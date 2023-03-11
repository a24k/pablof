import * as core from "@actions/core";
import type { MilestoneEvent } from "@octokit/webhooks-types";

import { Result, ok, err } from "neverthrow";

import { TriggerableAction } from "../triggerable";

import type { Context, Sdk } from "../";

export class CreateMilestoneIssue extends TriggerableAction {
  constructor() {
    super("milestone", "created");
  }

  protected async handle(
    context: Context,
    sdk: Sdk
  ): Promise<Result<string, string>> {
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
