import * as core from "@actions/core";
import type { MilestoneEvent } from "@octokit/webhooks-types";

import { TriggerableAction } from "../triggerable";
import { ActionResult, ok, err } from "../result";

import type { Context, Sdk } from "../";

export class SyncMilestoneIssue extends TriggerableAction {
  constructor() {
    super("milestone", "edited");
  }

  description(): string {
    return `SyncMilestoneIssue for ${super.description()}`;
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

    core.debug(
      `Found ${milestone.repository.milestone.issues.totalCount} issues with milestonr`
    );

    return err("Not implemented");
  }
}
