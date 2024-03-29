import * as core from "@actions/core";
import * as github from "@actions/github";

import { collect } from "./actions/collect";

async function main(): Promise<void> {
  try {
    const inventory = collect();

    await inventory.handleContext(github.context);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

main();
