import { TriggerableAction } from './';
import type { Context, Sdk } from './';
import type { ActionOk, ActionErr } from './result';

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
      const title = item.description();

      item.debug(`handleContext on ${title}`);

      const result = await item.handleContext(context, sdk);
      result.match(
        (res: ActionOk) => {
          switch (res.type) {
            case 'Success':
              item.notice(res.message);
              break;
            case 'Skip':
            default:
              item.debug('skipped');
              break;
          }
        },
        (err: ActionErr) => {
          item.error(err.message);
        }
      );
    }
  }
}
