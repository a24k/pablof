import type { IssuesEvent } from "@octokit/webhooks-types";

import { actionErr, actionSkip } from "../";
import type { ActionResult, Context } from "../";

import { IssueAction } from "./base";

export class DeriveIssue extends IssueAction {
  constructor() {
    super("issues", "opened");
  }

  description(): string {
    return `DeriveIssue for ${super.description()}`;
  }

  protected async handle(context: Context): Promise<ActionResult> {
    const payload = context.payload as IssuesEvent;
    this.dump(payload, "payload");

    const issue = await this.queryIssueById(payload.issue.node_id);
    if (issue.isErr()) {
      return actionErr(issue.error);
    }

    if (issue.value.trackedInIssues.totalCount !== 1) {
      return actionSkip("Issue is not derived.");
    }

    return actionErr("Not implemented.");
  }
}
