import * as core from "@actions/core";
import type { MilestoneEvent } from "@octokit/webhooks-types";

import { TriggerableAction } from "../triggerable";

import type { Sdk } from "../../graphql";
import type { Context } from "../";

export class CreateMilestoneIssue extends TriggerableAction {
  constructor() {
    super("milestone", "created");
  }

  protected async handle(context: Context, sdk: Sdk): Promise<void> {
    const payload = context.payload as MilestoneEvent;
    const milestone = await sdk.queryMilestone({
      owner: payload.repository.owner.login,
      repository: payload.repository.name,
      number: payload.milestone.number,
    });
    core.info(JSON.stringify(milestone, null, 2));
  }
}
