import { Result, ok, err } from "neverthrow";

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

export type {
  ActionResult,
  ActionOk,
  ActionErr,
  ActionSuccess,
  ActionSkip,
  ActionFailure,
};

function actionOk(message: string): ActionResult {
  return ok({ type: "Success", message });
}

function actionSkip(): ActionResult {
  return ok({ type: "Skip" });
}

function actionErr(message: string): ActionResult {
  return err({ type: "Failure", message });
}

export { actionOk, actionSkip, actionErr };
