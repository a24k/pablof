import * as core from "@actions/core";
import type { MilestoneEvent } from "@octokit/webhooks-types";

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

    if (node == undefined || node.__typename != "Milestone") {
      return actionErr("No milestone found.");
    }

    const nodes = node.issues.nodes;
    if (nodes === undefined || nodes === null) {
      return actionErr("No issue found.");
    }

    const roots = nodes.filter(
      issue => issue !== null && issue.trackedInIssues.totalCount === 0
    );
    if (roots.length === 0) {
      return actionErr("No milestone issue found.");
    }

    core.debug(`findMilestoneIssue = ${JSON.stringify(roots[0], null, 2)}`);

    return actionErr("Not implemented");
  }
}
