import { Result, ok, err } from "neverthrow";

import type { MilestoneEvent } from "@octokit/webhooks-types";

import { TriggerableAction } from "../triggerable";
import { ActionResult, actionOk, actionErr } from "../result";

import type { Context, Sdk, ID } from "../";
import type { IssueDigestFragment } from "../../graphql";

export class CreateMilestoneIssue extends TriggerableAction {
  constructor() {
    super("milestone", "created");
  }

  description(): string {
    return `CreateMilestoneIssue for ${super.description()}`;
  }

  private async queryProjects(
    repository: ID,
    sdk: Sdk
  ): Promise<Result<ID[], string>> {
    const node = (
      await sdk.queryNode({
        id: repository,
      })
    ).node;
    this.debug(`queryNode = ${JSON.stringify(node, null, 2)}`);

    if (node == undefined || node.__typename !== "Repository") {
      return err("No repository found.");
    }

    const nodes = node.projectsV2.nodes;
    if (nodes == undefined || nodes.length === 0) {
      return err("No projects found.");
    }
    this.debug(`foundProjectV2 = ${JSON.stringify(nodes, null, 2)}`);

    return ok(
      nodes.flatMap(project =>
        project == null || project.closed ? [] : project.id
      )
    );
  }

  private async addIssueToProject(sdk: Sdk, project: ID, issue: ID) {
    const result = (
      await sdk.addProjectItem({
        project: project,
        item: issue,
      })
    ).addProjectV2ItemById;
    this.debug(`addProjectV2ItemById = ${JSON.stringify(result, null, 2)}`);

    if (result?.item?.type === "ISSUE") {
      this.notice(`MilestoneIssue is added to ProjectV2 {id: ${project}}`);
    } else {
      this.warning(`MilestoneIssue isn't added to ProjectV2 {id: ${project}}`);
    }
  }

  protected async handle(context: Context, sdk: Sdk): Promise<ActionResult> {
    const payload = context.payload as MilestoneEvent;
    this.debug(`payload = ${JSON.stringify(payload, null, 2)}`);

    const node = (
      await sdk.queryNode({
        id: payload.milestone.node_id,
      })
    ).node;
    this.debug(`queryNode = ${JSON.stringify(node, null, 2)}`);

    if (node == undefined || node.__typename !== "Milestone") {
      return actionErr("No milestone found.");
    }

    const issue = await sdk.createIssueWithMilestone({
      repository: node.repository.id,
      title: payload.milestone.title,
      body: payload.milestone.description,
      milestone: node.id,
    });
    this.debug(`createIssueWithMilestone = ${JSON.stringify(issue, null, 2)}`);

    if (issue.createIssue?.issue?.id == undefined) {
      return actionErr("Fail to create issue.");
    }

    const issueDigest = issue.createIssue.issue as IssueDigestFragment;
    this.debug(`IssueDigestFragment = ${issueDigest}`);

    const projects = await this.queryProjects(payload.repository.node_id, sdk);
    const issueId = issue.createIssue.issue.id;
    projects.match(
      (ids: ID[]) => {
        for (const id of ids) {
          this.addIssueToProject(sdk, id, issueId);
        }
      },
      (err: string) => this.warning(`No projects found. (${err})`)
    );

    return actionOk(
      `MilestoneIssue created {id: ${issue.createIssue.issue.id}, title: ${issue.createIssue.issue.title}, body: ${issue.createIssue.issue.body}}`
    );
  }
}
