import { ActionInventory } from "./inventory";

import { QueryProject } from "./project";
import { CreateMilestoneIssue, SyncMilestoneIssue } from "./milestone";

export function collect(): ActionInventory {
  const inventory = new ActionInventory();

  inventory.submit(new QueryProject());
  inventory.submit(new CreateMilestoneIssue());
  inventory.submit(new SyncMilestoneIssue());

  return inventory;
}
