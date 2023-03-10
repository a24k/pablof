import { context } from "@actions/github";
type Context = typeof context;

export abstract class TriggerableAction {
  private triggerName: string;
  private triggerAction?: string;

  constructor(name: string, action?: string) {
    this.triggerName = name;
    this.triggerAction = action;
  }

  canHandle(name: string, action?: string): boolean {
    return (
      name === this.triggerName &&
      (this.triggerAction === undefined || action === this.triggerAction)
    );
  }

  canHandleContext(context: Context): boolean {
    return this.canHandle(context.eventName, context.payload.action);
  }
}
