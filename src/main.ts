import * as core from "@actions/core";
import * as github from "@actions/github";
import { getSdk } from "./graphql";
import type { MilestoneEvent } from "@octokit/webhooks-types";

async function main(): Promise<void> {
  try {
    switch (github.context.eventName) {
      case "milestone":
        const event = github.context.payload as MilestoneEvent;
        break;
      default:
        break;
    }

    const token = core.getInput("token");

    const octokit = github.getOctokit(token);

    const sdk = getSdk(octokit.graphql);

    const milestone = await sdk.milestone({
      owner: github.context.payload.repository!.owner.login,
      repository: github.context.payload.repository!.name,
      number: 1,
    });

    core.debug("milestone(1):");
    core.debug(JSON.stringify(milestone, null, 2));
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

main();
