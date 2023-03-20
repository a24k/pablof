/* eslint-disable eqeqeq */

import { Result, ok, err } from "neverthrow";

import { Action } from "../base";
import type { ID } from "../";

import type {
  IssuePropsFragment,
  MilestonePropsFragment,
  MilestonePropsWithRepositoryFragment,
  MilestonePropsWithIssuesFragment,
  ProjectV2ItemPropsWithProjectAndFieldValuesFragment,
  ProjectV2PropsFragment,
} from "./graphql";

import { graphql } from "../";
import { getSdk } from "./graphql";
export const gql = getSdk(graphql);

export abstract class MilestoneAction extends Action {
  protected async queryProjectsByRepositoryId(
    repository: ID
  ): Promise<Result<ProjectV2PropsFragment[], string>> {
    const node = (await gql.queryRepositoryWithProjectsV2({ id: repository }))
      .node;
    if (node == undefined || node.__typename !== "Repository") {
      return err("No repository found.");
    }

    const projects = node.projectsV2.nodes?.flatMap(project =>
      project == null || project.closed ? [] : project
    );

    if (projects == undefined || projects.length === 0) {
      return err("No projects found.");
    }

    return ok(projects);
  }

  protected async queryMilestoneWithRepository(
    milestone: ID
  ): Promise<Result<MilestonePropsWithRepositoryFragment, string>> {
    const node = (await gql.queryMilestoneWithRepository({ id: milestone }))
      .node;
    this.dump(node, "queryNode");

    if (node == undefined || node.__typename !== "Milestone") {
      return err("No milestone found.");
    }

    return ok(node);
  }

  protected async queryMilestoneWithIssues(
    milestone: ID
  ): Promise<Result<MilestonePropsWithIssuesFragment, string>> {
    const node = (await gql.queryMilestoneWithIssues({ id: milestone })).node;
    this.dump(node, "queryNode");

    if (node == undefined || node.__typename !== "Milestone") {
      return err("No milestone found.");
    }

    return ok(node);
  }

  protected async findMilestoneIssueFromMilestone(
    milestone: MilestonePropsWithIssuesFragment
  ): Promise<Result<IssuePropsFragment, string>> {
    const roots = milestone.issues.nodes?.flatMap(issue =>
      issue === null || issue.trackedInIssues.totalCount !== 0 ? [] : issue
    );
    if (roots == undefined || roots.length === 0) {
      return err("No milestone issue found.");
    }

    const root = roots[0];
    this.dump(root, "foundMilestoneIssue");

    return ok(root);
  }

  protected async updateStartDateField(
    item: ProjectV2ItemPropsWithProjectAndFieldValuesFragment,
    milestone: MilestonePropsFragment
  ): Promise<
    Result<ProjectV2ItemPropsWithProjectAndFieldValuesFragment, string>
  > {
    const fields = item.project.fields.nodes?.flatMap(field =>
      field === null ||
      field.__typename !== "ProjectV2Field" ||
      field.dataType !== "DATE" ||
      !field.name.match(/^(Begin|Start) [dD]ate$/)
        ? []
        : field
    );
    if (fields == undefined || fields.length === 0) {
      return err(`No field for "Start Date" on project(${item.project.id}).`);
    }

    const field = fields[0];

    const result = await gql.updateProjectItemFieldByDate({
      project: item.project.id,
      item: item.id,
      field: field.id,
      date: milestone.createdAt,
    });
    this.dump(result, "updateProjectItemFieldByDate");

    if (result.updateProjectV2ItemFieldValue?.projectV2Item?.id == undefined) {
      return err(
        `Fail to update field(${field.name}) with value(${milestone.createdAt}) on project(${item.project.id}).`
      );
    }

    return ok(result.updateProjectV2ItemFieldValue.projectV2Item);
  }

  protected async updateTargetDateField(
    item: ProjectV2ItemPropsWithProjectAndFieldValuesFragment,
    milestone: MilestonePropsFragment
  ): Promise<
    Result<ProjectV2ItemPropsWithProjectAndFieldValuesFragment, string>
  > {
    if (milestone.dueOn == undefined) {
      return err(`No due date setted on milestone(${milestone.id}).`);
    }

    const fields = item.project.fields.nodes?.flatMap(field =>
      field === null ||
      field.__typename !== "ProjectV2Field" ||
      field.dataType !== "DATE" ||
      !field.name.match(/^(Due|End|Finish|Target) [dD]ate$/)
        ? []
        : field
    );
    if (fields == undefined || fields.length === 0) {
      return err(`No field for "Target Date" on project(${item.project.id}).`);
    }

    const field = fields[0];

    const result = await gql.updateProjectItemFieldByDate({
      project: item.project.id,
      item: item.id,
      field: field.id,
      date: milestone.dueOn,
    });
    this.dump(result, "updateProjectItemFieldByDate");

    if (result.updateProjectV2ItemFieldValue?.projectV2Item?.id == undefined) {
      return err(
        `Fail to update field(${field.name}) with value(${milestone.dueOn}) on project(${item.project.id}).`
      );
    }

    return ok(result.updateProjectV2ItemFieldValue.projectV2Item);
  }
}
