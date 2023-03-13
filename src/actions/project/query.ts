import * as core from "@actions/core";
import type { PullRequestEvent } from "@octokit/webhooks-types";

import { TriggerableAction } from "../triggerable";
import { ActionResult, actionOk, actionErr } from "../result";

import type { Context, Sdk } from "../";

export class QueryProject extends TriggerableAction {
  constructor() {
    super("pull_request");
  }

  description(): string {
    return `QueryProject for ${super.description()}`;
  }

  protected async handle(context: Context, sdk: Sdk): Promise<ActionResult> {
    const payload = context.payload as PullRequestEvent;
    core.debug(`payload = ${JSON.stringify(payload, null, 2)}`);

    const project = core.getInput("project");
    if (project == undefined) {
      return actionErr("No project specified.");
    }

    const node = (
      await sdk.queryNode({
        id: project,
      })
    ).node;
    core.debug(`queryNode = ${JSON.stringify(node, null, 2)}`);

    return actionOk(`Project queried`);
  }
}
