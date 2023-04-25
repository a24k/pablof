/* eslint-disable eqeqeq */

import { Result, ok, err } from "neverthrow";

import type { MilestoneEvent } from "@octokit/webhooks-types";

import { actionOk, actionErr } from "../";
import type { ActionResult, Context } from "../";

import { gql, MilestoneAction } from "./base";

import type {
  MilestonePropsWithRepositoryFragment,
  IssuePropsFragment,
  ProjectV2PropsFragment,
  ProjectV2ItemPropsFragment,
  ProjectV2ItemPropsWithProjectFragment,
  ProjectV2ItemPropsWithProjectAndFieldsFragment,
} from "./graphql";

export class CreateMilestoneIssue extends MilestoneAction {
  constructor() {
    super("milestone", "created");
  }

  description(): string {
    return `CreateMilestoneIssue for ${super.description()}`;
  }

  protected async createIssueWithMilestone(
    milestone: MilestonePropsWithRepositoryFragment
  ): Promise<Result<IssuePropsFragment, string>> {
    const result = await gql.createIssueWithMilestone({
      repository: milestone.repository.id,
      title: milestone.title,
      body: milestone.description,
      milestone: milestone.id,
    });
    this.dump(result, "createIssueWithMilestone");

    if (result.createIssue?.issue?.id == undefined) {
      return err("Fail to create issue.");
    }

    return ok(result.createIssue.issue);
  }

  protected async updateStatusField(
    item: ProjectV2ItemPropsWithProjectAndFieldsFragment
  ): Promise<Result<ProjectV2ItemPropsWithProjectFragment, string>> {
    const fields = item.project.fields.nodes?.flatMap(field =>
      field === null ||
      field.__typename !== "ProjectV2SingleSelectField" ||
      field.name !== "Status"
        ? []
        : field
    );
    if (fields == undefined || fields.length === 0) {
      return err(`No field named "Status" on project(${item.project.id}).`);
    }

    const field = fields[0];
    const option =
      field.options.find(opt => opt.name === "Milestone") ||
      field.options.find(opt => opt.name === "Project") ||
      field.options[0];

    const result = await gql.updateProjectItemFieldBySingleSelectValue({
      project: item.project.id,
      item: item.id,
      field: field.id,
      option: option.id,
    });
    this.dump(result, "updateProjectItemFieldBySingleSelectValue");

    if (result.updateProjectV2ItemFieldValue?.projectV2Item?.id == undefined) {
      return err(
        `Fail to update field(${field.name}) with value(${option.name}) on project(${item.project.id}).`
      );
    }

    return ok(result.updateProjectV2ItemFieldValue.projectV2Item);
  }

  protected async addIssueToProject(
    project: ProjectV2PropsFragment,
    issue: IssuePropsFragment,
    milestone: MilestonePropsWithRepositoryFragment
  ): Promise<Result<ProjectV2ItemPropsFragment, string>> {
    const item = await gql.addProjectItem({
      project: project.id,
      item: issue.id,
    });
    this.dump(item, "addItemToProject");

    if (item.addProjectV2ItemById?.item?.id == undefined) {
      return err("Fail to add project item.");
    }

    const statusResult = await this.updateStatusField(
      item.addProjectV2ItemById.item
    );
    if (statusResult.isOk()) {
      this.notice(
        `Successfully updated status field on project(${statusResult.value.project.id}).`
      );
    } else {
      this.warning(`Failed to update status field: ${statusResult.error}`);
    }

    const startDateResult = await this.updateStartDateField(
      item.addProjectV2ItemById.item,
      milestone
    );
    if (startDateResult.isOk()) {
      this.notice(
        `Successfully updated start date field on project(${startDateResult.value.project.id}).`
      );
    } else {
      this.warning(
        `Failed to update start date field: ${startDateResult.error}`
      );
    }

    const targetDateResult = await this.updateTargetDateField(
      item.addProjectV2ItemById.item,
      milestone
    );
    if (targetDateResult.isOk()) {
      this.notice(
        `Successfully updated target date field on project(${targetDateResult.value.project.id}).`
      );
    } else {
      this.warning(
        `Failed to update target date field: ${targetDateResult.error}`
      );
    }

    return ok(item.addProjectV2ItemById.item);
  }

  protected async handle(context: Context): Promise<ActionResult> {
    const payload = context.payload as MilestoneEvent;
    this.dump(payload, "payload");

    const milestone = await this.queryMilestoneWithRepository(
      payload.milestone.node_id
    );
    if (milestone.isErr()) {
      return actionErr(milestone.error);
    }

    const issue = await this.createIssueWithMilestone(milestone.value);
    if (issue.isErr()) {
      return actionErr(issue.error);
    }

    const projects = await this.queryProjectsByRepositoryId(
      milestone.value.repository.id
    );
    if (projects.isErr()) {
      return actionErr(projects.error);
    }

    for (const project of projects.value) {
      const item = await this.addIssueToProject(
        project,
        issue.value,
        milestone.value
      );
      if (item.isOk()) {
        this.notice(
          `Successfully added MilestoneIssue to ProjectV2 {id: ${project.id}, title: ${project.title}}`
        );
      } else {
        this.warning(
          `Failed to add MilestoneIssue to ProjectV2 {id: ${project.id}, title: ${project.title}}`
        );
      }
    }

    return actionOk(
      `MilestoneIssue created {id: ${issue.value.id}, title: ${issue.value.title}, body: ${issue.value.body}}`
    );
  }
}
