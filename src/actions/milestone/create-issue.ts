import * as core from "@actions/core";
import type { MilestoneEvent } from "@octokit/webhooks-types";

import { TriggerableAction } from "../triggerable";
import { ActionResult, ok, err } from "../result";

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

    const milestone = await sdk.queryMilestone({
      owner: payload.repository.owner.login,
      repository: payload.repository.name,
      number: payload.milestone.number,
    });

    core.debug(`queryMilestone = ${JSON.stringify(milestone, null, 2)}`);

    if (milestone.repository?.milestone?.id === undefined)
      return err("No repository or milestone found.");

    const issue = await sdk.createIssueWithMilestone({
      repository: milestone.repository.id,
      title: payload.milestone.title,
      body: payload.milestone.description,
      milestone: milestone.repository.milestone.id,
    });

    core.debug(`createIssueWithMilestone = ${JSON.stringify(issue, null, 2)}`);

    if (issue.createIssue?.issue?.id === undefined)
      return err("Fail to create issue.");

    return ok(
      `MilestoneIssue created {id: ${issue.createIssue.issue.id}, number: ${issue.createIssue.issue.number}, title: ${issue.createIssue.issue.title}, body: ${issue.createIssue.issue.body}}`
    );
  }
}
