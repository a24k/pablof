import * as core from "@actions/core";
import * as github from "@actions/github";
import { getSdk } from "./graphql";

async function main(): Promise<void> {
  try {
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
