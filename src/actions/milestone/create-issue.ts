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

    core.info(JSON.stringify(milestone, null, 2));
    if (milestone.repository?.milestone?.id === undefined) return err("err");

    const issue = await sdk.createIssueWithMilestone({
      repository: milestone.repository.id,
      title: payload.milestone.title,
      milestone: milestone.repository.milestone.id,
    });

    core.info(JSON.stringify(issue, null, 2));
    if (issue.createIssue?.issue?.id === undefined) return err("err");

    return ok("ok");
  }
}
