import { TriggerableAction } from "../triggerable";
import { ActionResult, ok } from "../result";

import type { Context, Sdk } from "../";

export class Success extends TriggerableAction {
  constructor() {
    super("pull_request");
  }

  description(): string {
    return `Success for ${super.description()}`;
  }

  protected async handle(_context: Context, _sdk: Sdk): Promise<ActionResult> {
    return ok("success");
  }
}
