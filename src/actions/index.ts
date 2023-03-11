import * as github from "@actions/github";

import { CreateMilestoneIssue } from "./milestone";

import { ActionInventory } from "./inventory";
import { TriggerableAction } from "./triggerable";
export { ActionInventory, TriggerableAction };

export type Context = typeof github.context;

export function collect(): ActionInventory {
  const inventory = new ActionInventory();

  inventory.submit(new CreateMilestoneIssue());

  return inventory;
}
