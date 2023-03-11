import { skip } from "./result";
import type { Context, Sdk, ActionResult } from "./";

export abstract class TriggerableAction {
  private triggerName: string;
  private triggerAction?: string | string[];

  constructor(name: string, action?: string | string[]) {
    this.triggerName = name;
    this.triggerAction = action;
  }

  description(): string {
    return `TriggerableAction for ${this.triggerName}${
      this.triggerAction === undefined ? "" : `-${this.triggerAction}`
    }`;
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

  protected abstract handle(context: Context, sdk: Sdk): Promise<ActionResult>;

  async handleContext(context: Context, sdk: Sdk): Promise<ActionResult> {
    if (this.canHandleContext(context)) {
      return await this.handle(context, sdk);
    } else {
      return skip();
    }
  }
}
