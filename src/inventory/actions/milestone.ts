import * as core from "@actions/core";
import type { MilestoneEvent } from "@octokit/webhooks-types";

import { TriggerableAction } from "../action";
import type { Context } from "../action";
import type { Sdk } from "../../graphql";

export class MilestoneAction extends TriggerableAction {
  constructor() {
    super("milestone");
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
