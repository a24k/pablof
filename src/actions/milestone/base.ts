/* eslint-disable eqeqeq */

import { Result, ok, err } from "neverthrow";

import { TriggerableAction } from "../triggerable";

import type { Sdk, ID } from "../";
import type {
  MilestonePropsFragment,
  MilestonePropsWithRepositoryAndIssuesFragment,
  IssuePropsFragment,
  ProjectV2ItemPropsFragment,
} from "../../graphql";

export abstract class MilestoneAction extends TriggerableAction {
  protected async queryMilestoneById(
    sdk: Sdk,
    milestone: ID
  ): Promise<Result<MilestonePropsWithRepositoryAndIssuesFragment, string>> {
    const node = (await sdk.queryNode({ id: milestone })).node;
    this.debug(`queryNode = ${JSON.stringify(node, null, 2)}`);

    if (node == undefined || node.__typename !== "Milestone") {
      return err("No milestone found.");
    }

    return ok(node);
  }

  protected async findMilestoneIssueFromMilestone(
    milestone: MilestonePropsWithRepositoryAndIssuesFragment
  ): Promise<Result<IssuePropsFragment, string>> {
    const roots = milestone.issues.nodes?.flatMap(issue =>
      issue === null || issue.trackedInIssues.totalCount !== 0 ? [] : issue
    );
    if (roots == undefined || roots.length === 0) {
      return err("No milestone issue found.");
    }

    const root = roots[0];
    this.debug(`foundMilestoneIssue = ${JSON.stringify(root, null, 2)}`);

    return ok(root);
  }

  protected async updateStartDateField(
    sdk: Sdk,
    item: ProjectV2ItemPropsFragment,
    milestone: MilestonePropsFragment
  ): Promise<Result<ProjectV2ItemPropsFragment, string>> {
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

    const result = await sdk.updateProjectItemFieldByDate({
      project: item.project.id,
      item: item.id,
      field: field.id,
      date: milestone.createdAt,
    });
    this.debug(
      `updateProjectItemFieldByDate = ${JSON.stringify(result, null, 2)}`
    );

    if (result.updateProjectV2ItemFieldValue?.projectV2Item?.id == undefined) {
      return err(
        `Fail to update field(${field.name}) with value(${milestone.createdAt}) on project(${item.project.id}).`
      );
    }

    return ok(result.updateProjectV2ItemFieldValue.projectV2Item);
  }

  protected async updateTargetDateField(
    sdk: Sdk,
    item: ProjectV2ItemPropsFragment,
    milestone: MilestonePropsFragment
  ): Promise<Result<ProjectV2ItemPropsFragment, string>> {
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

    const result = await sdk.updateProjectItemFieldByDate({
      project: item.project.id,
      item: item.id,
      field: field.id,
      date: milestone.dueOn,
    });
    this.debug(
      `updateProjectItemFieldByDate = ${JSON.stringify(result, null, 2)}`
    );

    if (result.updateProjectV2ItemFieldValue?.projectV2Item?.id == undefined) {
      return err(
        `Fail to update field(${field.name}) with value(${milestone.dueOn}) on project(${item.project.id}).`
      );
    }

    return ok(result.updateProjectV2ItemFieldValue.projectV2Item);
  }
}
