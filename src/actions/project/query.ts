/* eslint-disable eqeqeq */

import type { PullRequestEvent } from "@octokit/webhooks-types";

import { Action, actionOk, actionErr } from "../";
import type { ActionResult, Context } from "../";

export class QueryProject extends Action {
  constructor() {
    super("pull_request");
  }

  description(): string {
    return `QueryProject for ${super.description()}`;
  }

  protected async handle(context: Context): Promise<ActionResult> {
    const payload = context.payload as PullRequestEvent;
    this.debug(`payload = ${JSON.stringify(payload, null, 2)}`);

    const repository = await this.queryRepositoryById(
      payload.repository.node_id
    );
    if (repository.isErr()) {
      return actionErr(repository.error);
    }

    const nodes = repository.value.projectsV2.nodes;
    if (nodes == undefined) {
      return actionErr("No projectsV2 found.");
    }

    const projects = repository.value.projectsV2.nodes?.flatMap(project =>
      project == null || project.closed ? [] : project
    );
    if (projects == undefined || projects.length === 0) {
      return actionErr("No projectsV2 found.");
    }
    this.debug(`foundProjectV2 = ${JSON.stringify(projects, null, 2)}`);

    return actionOk(
      `Project queried {id: ${projects[0].id}, title: ${projects[0].title}}`
    );
  }
}
