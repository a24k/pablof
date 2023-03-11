import * as github from "@actions/github";

import type { Sdk } from "../graphql";

import { CreateMilestoneIssue } from "./milestone";

import { ActionInventory } from "./inventory";
import { TriggerableAction } from "./triggerable";
export { ActionInventory, TriggerableAction };

type Context = typeof github.context;

export type { Context, Sdk };

export function collect(): ActionInventory {
  const inventory = new ActionInventory();

  inventory.submit(new CreateMilestoneIssue());

  return inventory;
}
