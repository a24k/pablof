import { describe, expect, test } from "@jest/globals";

import { ActionInventory, TriggerableAction } from "../../src/actions";
import type { Context } from "../../src/actions";
import { ActionResult, actionOk } from "../../src/actions/result";

describe("ActionInventory", () => {
  class TestActionA extends TriggerableAction {
    constructor() {
      super("nameA", "actionA");
    }

    protected async handle(_: Context): Promise<ActionResult> {
      return actionOk("ok");
    }
  }

  class TestActionB extends TriggerableAction {
    constructor() {
      super("nameB", "actionB");
    }

    protected async handle(_: Context): Promise<ActionResult> {
      return actionOk("ok");
    }
  }

  describe("submit", () => {
    test.each([
      [1, [new TestActionA()]],
      [1, [new TestActionB()]],
      [2, [new TestActionA(), new TestActionB()]],
    ])(
      "submit %d actions(%p)",
      (expected: number, actions: TriggerableAction[]) => {
        const inventory = new ActionInventory();
        for (const action of actions) {
          inventory.submit(action);
        }
        expect(inventory.length()).toBe(expected);
      }
    );
  });
});
