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

  protected async addIssueToProject(
    sdk: Sdk,
    project: ProjectV2PropsFragment,
    issue: IssuePropsFragment
  ): Promise<Result<ProjectV2ItemPropsFragment, string>> {
    const item = await sdk.addProjectItem({
      project: project.id,
      item: issue.id,
    });
    this.debug(`addItemToProject = ${JSON.stringify(item, null, 2)}`);

    if (item.addProjectV2ItemById?.item?.id == undefined) {
      return err("Fail to add project item.");
    }

    const fields = item.addProjectV2ItemById.item.project.fields.nodes?.flatMap(
      field =>
        field === null ||
        field.__typename !== "ProjectV2SingleSelectField" ||
        field.name !== "Status"
          ? []
          : field
    );
    if (fields == undefined || fields.length === 0) {
      this.warning(
        `No field named "Status" on project(${item.addProjectV2ItemById.item.project.id}).`
      );
    } else {
      const option =
        fields[0].options.find(opt => opt.name === "Milestone") ||
        fields[0].options.find(opt => opt.name === "Project") ||
        fields[0].options[0];

      const result = await sdk.updateProjectItemSingleSelectField({
        project: project.id,
        item: item.addProjectV2ItemById.item.id,
        field: fields[0].id,
        option: option.id,
      });
      this.debug(
        `updateProjectItemSingleSelectField = ${JSON.stringify(
          result,
          null,
          2
        )}`
      );

      if (
        result.updateProjectV2ItemFieldValue?.projectV2Item?.id == undefined
      ) {
        this.warning(
          `Fail to update field(${fields[0].name}) with value(${option.name}) on project(${item.addProjectV2ItemById.item.project.id}).`
        );
      }

      this.warning(
        `Successfully updated field(${fields[0].name}) with value(${option.name}) on project(${item.addProjectV2ItemById.item.project.id}).`
      );
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
      const item = await this.addIssueToProject(sdk, project, issue.value);
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
