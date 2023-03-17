/* eslint-disable eqeqeq */

import { Result, ok, err } from "neverthrow";

import { Action } from "../base";
import type { ID } from "../";

import type { IssuePropsWithTrackedInIssuesFragment } from "../../graphql";

export abstract class IssueAction extends Action {
  protected async queryIssueById(
    issue: ID
  ): Promise<Result<IssuePropsWithTrackedInIssuesFragment, string>> {
    const node = (await this.sdk().queryNode({ id: issue })).node;
    this.dump(node, "queryNode");

    if (node == undefined || node.__typename !== "Issue") {
      return err("No milestone found.");
    }

    return ok(node);
  }
}
