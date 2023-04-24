/* eslint-disable eqeqeq */

import { Result, ok, err } from "neverthrow";

import type { IssuesEvent } from "@octokit/webhooks-types";

import { actionErr, actionSkip } from "../";
import type { ID, ActionResult, Context } from "../";

import type {
  IssuePropsFragment,
  IssuePropsWithTrackedInIssuesFragment,
  IssuePropsWithProjectItemsFragment,
  ProjectV2ItemPropsFragment,
  ProjectV2ItemPropsWithProjectAndFieldsFragment,
  ProjectV2ItemFieldValuePropsFragment,
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

  protected findProjectItems(
    issue: IssuePropsWithProjectItemsFragment
  ): ProjectV2ItemPropsWithProjectAndFieldsFragment[] {
    const items = issue.projectItems.nodes?.flatMap(item =>
      item === null || item.project.closed ? [] : item
    );

    this.dump(items, "foundProjectItems");

    return items == undefined ? [] : items;
  }

  protected async addProjectItem(
    project: ID,
    item: ID
  ): Promise<Result<ProjectV2ItemPropsFragment, string>> {
    const result = await gql.addProjectItem({
      project,
      item,
    });
    this.dump(result, "addProjectItem");

    if (result.addProjectV2ItemById?.item?.id == undefined) {
      return err("Fail to add project item.");
    }

    return ok(result.addProjectV2ItemById.item);
  }

  protected findProjectItemFieldValues(
    item: ProjectV2ItemPropsWithProjectAndFieldsFragment
  ): ProjectV2ItemFieldValuePropsFragment[] {
    const fields = item.fieldValues?.nodes?.flatMap(field =>
      field === null ||
      !("id" in field) ||
      !("dataType" in field.field) ||
      !(
        field.field.dataType === "DATE" ||
        field.field.dataType === "ITERATION" ||
        field.field.dataType === "NUMBER" ||
        field.field.dataType === "SINGLE_SELECT" ||
        field.field.dataType === "TEXT"
      )
        ? []
        : field
    );

    this.dump(fields, "foundProjectItemFieldValues");

    return fields == undefined ? [] : fields;
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

    for (const pitem of this.findProjectItems(parent.value)) {
      const item = await this.addProjectItem(pitem.project.id, issue.value.id);
      if (item.isErr()) {
        return actionErr(item.error);
      }

      for (const field of this.findProjectItemFieldValues(pitem)) {
        this.dump(field, "field");
      }
    }

    return actionErr("Not implemented.");
  }
}
