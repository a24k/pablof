import * as core from "@actions/core";
import type { PullRequestEvent } from "@octokit/webhooks-types";

import { TriggerableAction } from "../triggerable";
import { ActionResult, ok, err } from "../result";

import type { Context, Sdk } from "../";

export class Success extends TriggerableAction {
  constructor() {
    super("pull_request");
  }

  protected async handle(context: Context, sdk: Sdk): Promise<ActionResult> {
    const payload = context.payload as PullRequestEvent;
    return ok("success");
  }
}
