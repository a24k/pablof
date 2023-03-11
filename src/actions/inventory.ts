import { TriggerableAction } from "./triggerable";

import type { Context } from "./";
import type { Sdk } from "../graphql";

export class ActionInventory {
  protected items: TriggerableAction[] = [];

  submit(item: TriggerableAction): void {
    this.items.push(item);
  }

  length(): number {
    return this.items.length;
  }

  async handleContext(context: Context, sdk: Sdk): Promise<void> {
    for (const item of this.items) {
      await item.handleContext(context, sdk);
    }
  }
}
