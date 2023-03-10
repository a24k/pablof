import type { Context } from "../main";
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

  abstract handle(context: Context, sdk: Sdk): Promise<void>;
}
