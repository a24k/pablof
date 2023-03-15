/* eslint-disable eqeqeq */

import { Result, ok, err } from "neverthrow";

import type { MilestoneEvent } from "@octokit/webhooks-types";

import { TriggerableAction } from "../triggerable";
import { ActionResult, actionOk, actionErr } from "../result";

import type { Context, Sdk } from "../";
import type {
  MilestonePropsFragment,
  IssuePropsFragment,
  ProjectV2PropsFragment,
  ProjectV2ItemPropsFragment,
} from "../../graphql";

export class CreateMilestoneIssue extends TriggerableAction {
  constructor() {
    super("milestone", "created");
  }

  description(): string {
    return `CreateMilestoneIssue for ${super.description()}`;
  }

  protected async createIssueWithMilestone(
    sdk: Sdk,
    milestone: MilestonePropsFragment
  ): Promise<Result<IssuePropsFragment, string>> {
    const issue = await sdk.createIssueWithMilestone({
      repository: milestone.repository.id,
      title: milestone.title,
      body: milestone.description,
      milestone: milestone.id,
    });
    this.debug(`createIssueWithMilestone = ${JSON.stringify(issue, null, 2)}`);

    if (issue.createIssue?.issue?.id == undefined) {
      return err("Fail to create issue.");
    }

    return ok(issue.createIssue.issue);
  }

  protected async updateStatusField(
    sdk: Sdk,
    item: ProjectV2ItemPropsFragment
  ): Promise<Result<ProjectV2ItemPropsFragment, string>> {
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

    const result = await sdk.updateProjectItemFieldBySingleSelectValue({
      project: item.project.id,
      item: item.id,
      field: field.id,
      option: option.id,
    });
    this.debug(
      `updateProjectItemFieldBySingleSelectValue = ${JSON.stringify(
        result,
        null,
        2
      )}`
    );

    if (result.updateProjectV2ItemFieldValue?.projectV2Item?.id == undefined) {
      return err(
        `Fail to update field(${field.name}) with value(${option.name}) on project(${item.project.id}).`
      );
    }

    return ok(result.updateProjectV2ItemFieldValue.projectV2Item);
  }

  protected async updateDueDateField(
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
      return err(`No field for "Due Date" on project(${item.project.id}).`);
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

  protected async addIssueToProject(
    sdk: Sdk,
    project: ProjectV2PropsFragment,
    issue: IssuePropsFragment,
    milestone: MilestonePropsFragment
  ): Promise<Result<ProjectV2ItemPropsFragment, string>> {
    const item = await sdk.addProjectItem({
      project: project.id,
      item: issue.id,
    });
    this.debug(`addItemToProject = ${JSON.stringify(item, null, 2)}`);

    if (item.addProjectV2ItemById?.item?.id == undefined) {
      return err("Fail to add project item.");
    }

    const statusResult = await this.updateStatusField(
      sdk,
      item.addProjectV2ItemById.item
    );
    if (statusResult.isOk()) {
      this.notice(
        `Successfully updated status field on project(${statusResult.value.project.id}).`
      );
    } else {
      this.warning(`Failed to update status field: ${statusResult.error}`);
    }

    const dueDateResult = await this.updateDueDateField(
      sdk,
      item.addProjectV2ItemById.item,
      milestone
    );
    if (dueDateResult.isOk()) {
      this.notice(
        `Successfully updated due date field on project(${dueDateResult.value.project.id}).`
      );
    } else {
      this.warning(`Failed to update due date field: ${dueDateResult.error}`);
    }

    return ok(item.addProjectV2ItemById.item);
  }

  protected async handle(context: Context, sdk: Sdk): Promise<ActionResult> {
    const payload = context.payload as MilestoneEvent;
    this.debug(`payload = ${JSON.stringify(payload, null, 2)}`);

    const milestone = await this.queryMilestoneById(
      sdk,
      payload.milestone.node_id
    );
    if (milestone.isErr()) {
      return actionErr(milestone.error);
    }

    const issue = await this.createIssueWithMilestone(sdk, milestone.value);
    if (issue.isErr()) {
      return actionErr(issue.error);
    }

    const projects = await this.queryProjectsByRepositoryId(
      sdk,
      milestone.value.repository.id
    );
    if (projects.isErr()) {
      return actionErr(projects.error);
    }

    for (const project of projects.value) {
      const item = await this.addIssueToProject(
        sdk,
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
