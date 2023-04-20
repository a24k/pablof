/* eslint-disable eqeqeq */

import { Result, ok, err } from "neverthrow";

import { Action } from "../base";
import type { ID } from "../";

import type { IssuePropsWithTrackedInIssuesFragment } from "./graphql";

import { graphql } from "../";
import { getSdk } from "./graphql";
const gql = getSdk(graphql);

export abstract class IssueAction extends Action {
  protected async queryIssueWithTrackedInIssues(
    issue: ID
  ): Promise<Result<IssuePropsWithTrackedInIssuesFragment, string>> {
    const node = (await gql.queryIssueWithTrackedInIssues({ id: issue })).node;
    this.dump(node, "queryIssueWithTrackedInIssues");

    if (node == undefined || node.__typename !== "Issue") {
      return err("No issue found.");
    }

    return ok(node);
  }
}
