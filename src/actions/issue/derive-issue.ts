/* eslint-disable eqeqeq */

import { Result, ok, err } from "neverthrow";

import type { IssuesEvent } from "@octokit/webhooks-types";

import { actionErr, actionSkip } from "../";
import type { ActionResult, Context } from "../";

import type {
  IssuePropsFragment,
  IssuePropsWithTrackedInIssuesFragment,
  IssuePropsWithProjectItemsFragment,
} from "./graphql";

import { gql, IssueAction } from "./base";

export class DeriveIssue extends IssueAction {
  constructor() {
    super("issues", "opened");
  }

  description(): string {
    return `DeriveIssue for ${super.description()}`;
  }

  protected async findParentIssue(
    issue: IssuePropsWithTrackedInIssuesFragment
  ): Promise<Result<IssuePropsWithProjectItemsFragment, string>> {
    const parents = issue.trackedInIssues.nodes?.flatMap(iss =>
      iss === null ? [] : iss
    );
    if (parents == undefined || parents.length === 0) {
      return err("No parent issue found.");
    }

    const parent = parents[0];
    this.dump(parent, "foundParentIssue");

    return ok(parent);
  }

  protected async updateIssueWithParent(
    issue: IssuePropsFragment,
    parent: IssuePropsWithProjectItemsFragment
  ): Promise<Result<IssuePropsFragment, string>> {
    const milestone = parent.milestone?.id;

    const labels = parent.labels?.nodes?.flatMap(label =>
      label === null ? [] : label.id
    );

    const result = await gql.updateIssue({
      issue: issue.id,
      milestone,
      labels,
    });
    this.dump(result, "updateIssue");

    if (result.updateIssue?.issue?.id == undefined) {
      return err("Fail to update issue.");
    }

    return ok(result.updateIssue.issue);
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

    const parent = await this.findParentIssue(issue.value);
    if (parent.isErr()) {
      return actionErr(parent.error);
    }

    {
      const result = await this.updateIssueWithParent(
        issue.value,
        parent.value
      );
      if (result.isErr()) {
        return actionErr(result.error);
      }
    }

    return actionErr("Not implemented.");
  }
}
