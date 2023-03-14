/* eslint-disable eqeqeq */

import { Result, ok, err } from "neverthrow";

import type { MilestoneEvent } from "@octokit/webhooks-types";

import { IssueState } from "../../graphql";
import { TriggerableAction } from "../triggerable";
import { ActionResult, actionOk, actionErr } from "../result";

import type { Context, Sdk, ID } from "../";
import type { IssuePropsFragment } from "../../graphql";

export class SyncMilestoneIssue extends TriggerableAction {
  constructor() {
    super("milestone", ["edited", "closed", "opened"]);
  }

  description(): string {
    return `SyncMilestoneIssue for ${super.description()}`;
  }

  protected async updateIssue(
    sdk: Sdk,
    issue: ID,
    title: string,
    state: IssueState
  ): Promise<Result<IssuePropsFragment, string>> {
    const result = await sdk.updateIssue({ issue, title, state });
    this.debug(`updateIssue = ${JSON.stringify(result, null, 2)}`);

    if (result.updateIssue?.issue?.id == undefined) {
      return err("Fail to update issue.");
    }

    return ok(result.updateIssue.issue);
  }

  protected async handle(context: Context, sdk: Sdk): Promise<ActionResult> {
    const payload = context.payload as MilestoneEvent;
    this.debug(`payload = ${JSON.stringify(payload, null, 2)}`);

    const milestone = await this.queryMilestone(sdk, payload.milestone.node_id);
    if (milestone.isErr()) {
      return actionErr(milestone.error);
    }

    const node = (
      await sdk.queryNode({
        id: payload.milestone.node_id,
      })
    ).node;
    this.debug(`queryNode = ${JSON.stringify(node, null, 2)}`);
    if (node == undefined || node.__typename !== "Milestone") {
      return actionErr("No milestone found.");
    }

    const roots = milestone.value.issues.nodes?.flatMap(issue =>
      issue === null || issue.trackedInIssues.totalCount !== 0 ? [] : issue
    );
    if (roots == undefined || roots.length === 0) {
      return actionErr("No milestone issue found.");
    }
    this.debug(`foundMilestoneIssue = ${JSON.stringify(roots[0], null, 2)}`);

    const issue = await this.updateIssue(
      sdk,
      roots[0].id,
      payload.milestone.title,
      payload.milestone.state === "open" ? IssueState.Open : IssueState.Closed
    );
    if (issue.isErr()) {
      return actionErr(issue.error);
    }

    return actionOk(
      `MilestoneIssue updated {id: ${issue.value.id}, title: ${issue.value.title}, state: ${issue.value.state}}`
    );
  }
}
