import * as core from "@actions/core";
import * as github from "@actions/github";
import { getSdk } from "./graphql";
import type { MilestoneEvent } from "@octokit/webhooks-types";

const token = core.getInput("token");
const octokit = github.getOctokit(token);
const ghq = getSdk(octokit.graphql);

async function milestone(event: MilestoneEvent): Promise<void> {
  switch (event.action) {
    case "created":
    case "edited":
      const milestone = await ghq.milestone({
        owner: event.repository.owner.login,
        repository: event.repository.name,
        number: event.milestone.number,
      });
      core.info(JSON.stringify(milestone, null, 2));
      break;
    default:
      break;
  }
}

async function main(): Promise<void> {
  try {
    switch (github.context.eventName) {
      case "milestone":
        milestone(github.context.payload as MilestoneEvent);
        break;
      default:
        break;
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

main();
