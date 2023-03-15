import * as core from "@actions/core";
import * as github from "@actions/github";

import { actionSkip } from "./result";
import type { ActionResult, ActionOk, ActionErr } from "./result";

type Context = typeof github.context;
export { Context };

export abstract class TriggerHandler {
  private triggerName: string;
  private triggerAction?: string | string[];

  constructor(name: string, action?: string | string[]) {
    this.triggerName = name;
    this.triggerAction = action;
  }

  description(): string {
    return `${this.triggerName}${
      this.triggerAction === undefined ? "" : `-${this.triggerAction}`
    }`;
  }

  debug(message: string): void {
    core.debug(message);
  }

  notice(message: string): void {
    core.notice(message, { title: this.description() });
  }

  warning(message: string): void {
    core.warning(message, { title: this.description() });
  }

  error(message: string): void {
    core.error(message, { title: this.description() });
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

  protected abstract handle(context: Context): Promise<ActionResult>;

  async handleContext(context: Context): Promise<ActionResult> {
    this.debug(`handleContext on ${this.description()}`);

    if (this.canHandleContext(context)) {
      const result = await this.handle(context);
      result.match(
        (r: ActionOk) => {
          switch (r.type) {
            case "Success":
              this.notice(r.message);
              break;
            case "Skip":
            default:
              this.debug("Skipped");
              break;
          }
        },
        (e: ActionErr) => {
          this.error(e.message);
        }
      );
      return result;
    } else {
      this.debug("Skipped");
      return actionSkip();
    }
  }
}
