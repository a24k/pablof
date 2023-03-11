import { Result, ok as neverthrow_ok, err as neverthrow_err } from "neverthrow";

export type ActionResult = Result<ActionOk, ActionErr>;

export type ActionOk = ActionSuccess | ActionSkip;
export type ActionErr = ActionFailure;

type ActionSuccess = {
  type: "Success";
  message: string;
};

type ActionSkip = {
  type: "Skip";
};

type ActionFailure = {
  type: "Failure";
  message: string;
};

function ok(message: string): ActionResult {
  return neverthrow_ok({ type: "Success", message });
}

function skip(): ActionResult {
  return neverthrow_ok({ type: "Skip" });
}

function err(message: string): ActionResult {
  return neverthrow_err({ type: "Failure", message });
}

export { ok, skip, err };
