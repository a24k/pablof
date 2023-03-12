import * as core from "@actions/core";
import type { MilestoneEvent } from "@octokit/webhooks-types";
import { Result, ok, err } from "neverthrow";

import { TriggerableAction } from "../triggerable";
import { ActionResult, actionOk, actionErr } from "../result";

import type { QueryMilestoneQuery } from "../../graphql";
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

    if (milestone.repository?.milestone?.id === undefined) {
      return actionErr("No repository or milestone found.");
    }

    const nodes = milestone.repository.milestone.issues.nodes;
    if (nodes === undefined || nodes === null) {
      return actionErr("No issue found.");
    }

    const roots = nodes.filter(
      issue => issue !== null && issue.trackedInIssues.totalCount === 0
    );
    if (roots.length === 0) {
      return actionErr("No milestone issue found.");
    }

    core.debug(`findMilestoneIssue = ${roots[0]}`);

    return actionErr("Not implemented");
  }
}
