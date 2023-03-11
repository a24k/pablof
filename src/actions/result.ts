import { Result, ok as neverthrow_ok, err as neverthrow_err } from "neverthrow";

type ActionResult = Result<ActionOk, ActionErr>;

type ActionOk = ActionSuccess | ActionSkip;
type ActionErr = ActionFailure;

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

export {
  ActionResult,
  ActionOk,
  ActionErr,
  ActionSuccess,
  ActionSkip,
  ActionFailure,
};

export { ok, skip, err };
