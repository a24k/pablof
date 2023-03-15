import { TriggerHandler } from "./handler";
import type { Context } from "./handler";

export class ActionInventory {
  protected items: TriggerHandler[] = [];

  submit(item: TriggerHandler): void {
    this.items.push(item);
  }

  length(): number {
    return this.items.length;
  }

  async handleContext(context: Context): Promise<void> {
    for (const item of this.items) {
      await item.handleContext(context);
    }
  }
}
