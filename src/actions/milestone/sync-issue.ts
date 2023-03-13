import * as core from "@actions/core";
import type { MilestoneEvent } from "@octokit/webhooks-types";

import { IssueState } from "../../graphql";
import { TriggerableAction } from "../triggerable";
import { ActionResult, actionOk, actionErr } from "../result";

import type { Context, Sdk } from "../";

export class SyncMilestoneIssue extends TriggerableAction {
  constructor() {
    super("milestone", ["edited", "closed", "opened"]);
  }

  description(): string {
    return `SyncMilestoneIssue for ${super.description()}`;
  }

  protected async handle(context: Context, sdk: Sdk): Promise<ActionResult> {
    const payload = context.payload as MilestoneEvent;
    core.debug(`payload = ${JSON.stringify(payload, null, 2)}`);

    const node = (
      await sdk.queryNode({
        id: payload.milestone.node_id,
      })
    ).node;
    core.debug(`queryNode = ${JSON.stringify(node, null, 2)}`);
    if (node == undefined || node.__typename !== "Milestone") {
      return actionErr("No milestone found.");
    }

    const nodes = node.issues.nodes;
    if (nodes == undefined) {
      return actionErr("No issue found.");
    }

    const roots = nodes.filter(
      issue => issue !== null && issue.trackedInIssues.totalCount === 0
    );
    if (roots.length === 0 || roots[0] == undefined) {
      return actionErr("No milestone issue found.");
    }
    core.debug(`foundMilestoneIssue = ${JSON.stringify(roots[0], null, 2)}`);

    const issue = await sdk.updateIssue({
      issue: roots[0].id,
      title: payload.milestone.title,
      state:
        payload.milestone.state === "open"
          ? IssueState.Open
          : IssueState.Closed,
    });
    core.debug(`updateIssue = ${JSON.stringify(issue, null, 2)}`);

    if (issue.updateIssue?.issue?.id == undefined) {
      return actionErr("Fail to update issue.");
    }

    return actionOk(
      `MilestoneIssue updated {id: ${issue.updateIssue.issue.id}, number: ${issue.updateIssue.issue.number}, title: ${issue.updateIssue.issue.title}, state: ${issue.updateIssue.issue.state}}`
    );
  }
}
