import * as github from "@actions/github";

import type { Sdk } from "../graphql";

import { CreateMilestoneIssue, SyncMilestoneIssue } from "./milestone";
import { QueryProject } from "./project";

import { ActionInventory } from "./inventory";
import { ActionResult } from "./result";
import { TriggerableAction } from "./triggerable";
export { ActionInventory, ActionResult, TriggerableAction };

type Context = typeof github.context;

export type { Context, Sdk };

export function collect(): ActionInventory {
  const inventory = new ActionInventory();

  inventory.submit(new CreateMilestoneIssue());
  inventory.submit(new SyncMilestoneIssue());
  inventory.submit(new QueryProject());

  return inventory;
}
