import type { Context, TriggerableAction } from "./action";
import type { Sdk } from "../graphql";

export class ActionInventory<T extends TriggerableAction> {
  protected items: T[] = [];

  submit(item: T): void {
    this.items.push(item);
  }

  async handleContext(context: Context, sdk: Sdk): Promise<void> {
    for (const item of this.items) {
      await item.handleContext(context, sdk);
    }
  }
}
