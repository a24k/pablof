import type { Context } from "./";
import type { Sdk } from "../graphql";

export abstract class TriggerableAction {
  private triggerName: string;
  private triggerAction?: string | string[];

  constructor(name: string, action?: string | string[]) {
    this.triggerName = name;
    this.triggerAction = action;
  }

  canHandle(name: string, action?: string): boolean {
    return (
      this.triggerName === name &&
      (this.triggerAction === undefined ||
        (Array.isArray(this.triggerAction)
          ? action === undefined
            ? false
            : this.triggerAction.includes(action)
          : this.triggerAction === action))
    );
  }

  canHandleContext(context: Context): boolean {
    return this.canHandle(context.eventName, context.payload.action);
  }

  protected abstract handle(context: Context, sdk: Sdk): Promise<void>;

  async handleContext(context: Context, sdk: Sdk): Promise<void> {
    if (this.canHandleContext(context)) {
      return await this.handle(context, sdk);
    }
  }
}
