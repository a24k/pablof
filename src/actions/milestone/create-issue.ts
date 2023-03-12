import * as core from "@actions/core";
import type { MilestoneEvent } from "@octokit/webhooks-types";

import { TriggerableAction } from "../triggerable";
import { ActionResult, actionOk, actionErr } from "../result";

import type { Context, Sdk } from "../";

export class CreateMilestoneIssue extends TriggerableAction {
  constructor() {
    super("milestone", "created");
  }

  description(): string {
    return `CreateMilestoneIssue for ${super.description()}`;
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

    if (node == undefined || node.__typename != "Milestone") {
      return actionErr("No milestone found.");
    }

    const issue = await sdk.createIssueWithMilestone({
      repository: node.repository.id,
      title: payload.milestone.title,
      body: payload.milestone.description,
      milestone: node.id,
    });

    core.debug(`createIssueWithMilestone = ${JSON.stringify(issue, null, 2)}`);

    if (issue.createIssue?.issue?.id === undefined)
      return actionErr("Fail to create issue.");

    return actionOk(
      `MilestoneIssue created {id: ${issue.createIssue.issue.id}, number: ${issue.createIssue.issue.number}, title: ${issue.createIssue.issue.title}, body: ${issue.createIssue.issue.body}}`
    );
  }
}
