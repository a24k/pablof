import { describe, expect, test } from "@jest/globals";
import { TriggerableAction } from "../../src/inventory/action";
import { Context } from "../../src/main";

class TestAction extends TriggerableAction {
  constructor(name: string, action?: string | string[]) {
    super(name, action);
  }

  async handle(context: Context): Promise<void> {
    // empty
  }
}

describe("trigger matching", () => {
  test.each([
    [true, "milestone", undefined],
    [false, "issue", undefined],
    [true, "milestone", "created"],
    [true, "milestone", "edited"],
  ])(
    "action(milestone, undefined) is matched %p with trigger(%s, %s)",
    (expected: boolean, name: string, action?: string) => {
      const actionMilestone = new TestAction("milestone");
      expect(actionMilestone.canHandle(name, action)).toBe(expected);
    }
  );

  test.each([
    [false, "milestone", undefined],
    [false, "issue", undefined],
    [true, "milestone", "created"],
    [false, "milestone", "edited"],
  ])(
    "action(milestone, created) is matched %p with trigger(%s, %s)",
    (expected: boolean, name: string, action?: string) => {
      const actionMilestoneCreated = new TestAction("milestone", "created");
      expect(actionMilestoneCreated.canHandle(name, action)).toBe(expected);
    }
  );

  test.each([
    [false, "milestone", undefined],
    [false, "issue", undefined],
    [true, "milestone", "edited"],
    [false, "milestone", "opened"],
  ])(
    "action(milestone, edited) is matched %p with trigger(%s, %s)",
    (expected: boolean, name: string, action?: string) => {
      const actionMilestoneEdited = new TestAction("milestone", "edited");
      expect(actionMilestoneEdited.canHandle(name, action)).toBe(expected);
    }
  );

  test.each([
    [false, "milestone", undefined],
    [false, "issue", undefined],
    [true, "milestone", "created"],
    [true, "milestone", "edited"],
  ])(
    "action(milestone, created|edited) is matched %p with trigger(%s, %s)",
    (expected: boolean, name: string, action?: string) => {
      const actionMilestoneCreated = new TestAction("milestone", [
        "created",
        "edited",
      ]);
      expect(actionMilestoneCreated.canHandle(name, action)).toBe(expected);
    }
  );
});
