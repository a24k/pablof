import * as core from "@actions/core";
import * as github from "@actions/github";

import { getSdk } from "./graphql";
import { ActionInventory } from "./inventory";
import { MilestoneAction } from "./inventory/actions/milestone";

async function main(): Promise<void> {
  try {
    const token = core.getInput("token");
    const octokit = github.getOctokit(token);
    const sdk = getSdk(octokit.graphql);

    const inventory = new ActionInventory();
    inventory.submit(new MilestoneAction());

    await inventory.handleContext(github.context, sdk);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

main();
