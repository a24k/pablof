import * as github from "@actions/github";

import { ActionInventory } from "./inventory";

import { MilestoneAction } from "./milestone";

export type Context = typeof github.context;

export function collect(): ActionInventory {
  const inventory = new ActionInventory();

  inventory.submit(new MilestoneAction());

  return inventory;
}
