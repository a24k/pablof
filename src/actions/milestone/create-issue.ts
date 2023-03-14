import { Result, ok, err } from 'neverthrow';

import type { MilestoneEvent } from '@octokit/webhooks-types';

import { TriggerableAction } from '../triggerable';
import { ActionResult, actionOk, actionErr } from '../result';

import type { Context, Sdk, ID } from '../';
import type {
  MilestonePropsFragment,
  IssuePropsFragment,
  ProjectV2PropsFragment,
  ProjectV2ItemPropsFragment,
} from '../../graphql';

export class CreateMilestoneIssue extends TriggerableAction {
  constructor() {
    super('milestone', 'created');
  }

  description(): string {
    return `CreateMilestoneIssue for ${super.description()}`;
  }

  protected async queryMilestone(
    sdk: Sdk,
    milestone: ID
  ): Promise<Result<MilestonePropsFragment, string>> {
    const node = (await sdk.queryNode({ id: milestone })).node;
    this.debug(`queryNode = ${JSON.stringify(node, null, 2)}`);

    if (node == undefined || node.__typename !== 'Milestone') {
      return err('No milestone found.');
    }

    return ok(node);
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
      return err('Fail to create issue.');
    }

    return ok(issue.createIssue.issue);
  }

  protected async queryProjects(
    sdk: Sdk,
    repository: ID
  ): Promise<Result<ProjectV2PropsFragment[], string>> {
    const node = (await sdk.queryNode({ id: repository })).node;
    this.debug(`queryNode = ${JSON.stringify(node, null, 2)}`);

    if (node == undefined || node.__typename !== 'Repository') {
      return err('No repository found.');
    }

    const projects = node.projectsV2.nodes?.flatMap(project =>
      project == null || project.closed ? [] : project
    );

    if (projects == undefined || projects.length === 0) {
      return err('No projects found.');
    }

    return ok(projects);
  }

  protected async addItemToProject(
    sdk: Sdk,
    project: ID,
    item: ID
  ): Promise<Result<ProjectV2ItemPropsFragment, string>> {
    const projectItem = await sdk.addProjectItem({
      project,
      item,
    });
    this.debug(`addItemToProject = ${JSON.stringify(item, null, 2)}`);

    if (projectItem.addProjectV2ItemById?.item?.id == undefined) {
      return err('Fail to add project item.');
    }

    return ok(projectItem.addProjectV2ItemById.item);
  }

  protected async handle(context: Context, sdk: Sdk): Promise<ActionResult> {
    const payload = context.payload as MilestoneEvent;
    this.debug(`payload = ${JSON.stringify(payload, null, 2)}`);

    const milestone = await this.queryMilestone(sdk, payload.milestone.node_id);
    if (milestone.isErr()) {
      return actionErr(milestone.error);
    }

    const issue = await this.createIssueWithMilestone(sdk, milestone.value);
    if (issue.isErr()) {
      return actionErr(issue.error);
    }

    const projects = await this.queryProjects(
      sdk,
      milestone.value.repository.id
    );
    if (projects.isErr()) {
      return actionErr(projects.error);
    }

    for (const project of projects.value) {
      const item = await this.addItemToProject(sdk, project.id, issue.value.id);
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
