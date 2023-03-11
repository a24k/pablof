import * as core from "@actions/core";

import { TriggerableAction } from "./";
import type { Context, Sdk } from "./";
import type { ActionOk, ActionErr } from "./result";

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
      const result = await item.handleContext(context, sdk);
      result.match(
        (res: ActionOk) => {
          switch (res.type) {
            case "Success":
              core.notice(res.message, { title: item.description() });
              break;
            case "Skip":
            default:
              core.notice("skip", { title: item.description() });
              break;
          }
        },
        (err: ActionErr) => {
          core.error(err.message, { title: item.description() });
        }
      );
    }
  }
}
