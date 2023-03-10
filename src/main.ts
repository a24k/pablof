import * as core from "@actions/core";
import * as github from "@actions/github";
import type { MilestoneEvent } from "@octokit/webhooks-types";

import { getSdk } from "./graphql";
import { MilestoneAction } from "./inventory/actions/milestone";

export type Context = typeof github.context;

const token = core.getInput("token");
const octokit = github.getOctokit(token);
const ghq = getSdk(octokit.graphql);

async function main(): Promise<void> {
  try {
    const action = new MilestoneAction();
    if (action.canHandleContext(github.context)) {
      action.handle(github.context, ghq);
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

main();
