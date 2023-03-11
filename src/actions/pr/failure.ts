import { TriggerableAction } from "../triggerable";
import { ActionResult, err } from "../result";

import type { Context, Sdk } from "../";

export class Failure extends TriggerableAction {
  constructor() {
    super("pull_request");
  }

  description(): string {
    return `Failure for ${super.description()}`;
  }

  protected async handle(_context: Context, _sdk: Sdk): Promise<ActionResult> {
    return err("failure");
  }
}
