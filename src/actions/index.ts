import * as github from "@actions/github";

import type { Sdk } from "../graphql";

import { CreateMilestoneIssue } from "./milestone";
import { Success, Failure } from "./pr";

import { ActionInventory } from "./inventory";
import { ActionResult } from "./result";
import { TriggerableAction } from "./triggerable";
export { ActionInventory, ActionResult, TriggerableAction };

type Context = typeof github.context;

export type { Context, Sdk };

export function collect(): ActionInventory {
  const inventory = new ActionInventory();

  inventory.submit(new Success());
  inventory.submit(new Failure());
  inventory.submit(new CreateMilestoneIssue());

  return inventory;
}
