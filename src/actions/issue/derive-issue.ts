/* eslint-disable eqeqeq */

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

    const issue = await this.queryIssueWithTrackedInIssues(
      payload.issue.node_id
    );
    if (issue.isErr()) {
      return actionErr(issue.error);
    }

    if (issue.value.trackedInIssues.totalCount !== 1) {
      return actionSkip("Issue is not derived.");
    }

    const parents = issue.value.trackedInIssues.nodes?.flatMap(iss =>
      iss === null ? [] : iss
    );
    if (parents == undefined || parents.length === 0) {
      return actionErr("No parent issue found.");
    }

    const parent = parents[0];
    this.dump(parent, "foundParentIssue");

    return actionErr("Not implemented.");
  }
}
