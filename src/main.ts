import * as core from "@actions/core";
import * as github from "@actions/github";

async function main(): Promise<void> {
  try {
    const token = core.getInput("token");
    const octokit = github.getOctokit(token);

    core.debug(`octokit = ${JSON.stringify(octokit, null, 2)}`);
    core.debug(`graphql = ${JSON.stringify(octokit.graphql, null, 2)}`);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

main();
