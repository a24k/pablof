/* eslint-disable eqeqeq */

import { Result, ok, err } from "neverthrow";

import type { MilestoneEvent } from "@octokit/webhooks-types";

import { IssueState } from "../../graphql";
import { ActionResult, actionOk, actionErr } from "../result";
import { MilestoneAction } from "./";

import type { Context, Sdk } from "../";
import type {
  IssuePropsFragment,
  IssuePropsWithItemsFragment,
} from "../../graphql";

export class SyncMilestoneIssue extends MilestoneAction {
  constructor() {
    super("milestone", ["edited", "closed", "opened"]);
  }

  description(): string {
    return `SyncMilestoneIssue for ${super.description()}`;
  }

  protected async updateIssue(
    sdk: Sdk,
    issue: IssuePropsFragment,
    title: string,
    state: IssueState
  ): Promise<Result<IssuePropsWithItemsFragment, string>> {
    const result = await sdk.updateIssue({ issue: issue.id, title, state });
    this.debug(`updateIssue = ${JSON.stringify(result, null, 2)}`);

    if (result.updateIssue?.issue?.id == undefined) {
      return err("Fail to update issue.");
    }

    return ok(result.updateIssue.issue);
  }

  protected async handle(context: Context, sdk: Sdk): Promise<ActionResult> {
    const payload = context.payload as MilestoneEvent;
    this.debug(`payload = ${JSON.stringify(payload, null, 2)}`);

    const milestone = await this.queryMilestoneById(
      sdk,
      payload.milestone.node_id
    );
    if (milestone.isErr()) {
      return actionErr(milestone.error);
    }

    const milestoneIssue = await this.findMilestoneIssueFromMilestone(
      milestone.value
    );
    if (milestoneIssue.isErr()) {
      return actionErr(milestoneIssue.error);
    }

    const issue = await this.updateIssue(
      sdk,
      milestoneIssue.value,
      payload.milestone.title,
      payload.milestone.state === "open" ? IssueState.Open : IssueState.Closed
    );
    if (issue.isErr()) {
      return actionErr(issue.error);
    }

    const items = issue.value.projectItems.nodes?.flatMap(item =>
      item === null ? [] : item
    );
    if (items == undefined || items.length === 0) {
      this.warning(`No projects found.`);
    } else {
      for (const item of items) {
        this.updateTargetDateField(sdk, item, milestone.value);
      }
    }

    return actionOk(
      `MilestoneIssue updated {id: ${issue.value.id}, title: ${issue.value.title}, state: ${issue.value.state}}`
    );
  }
}
