/* eslint-disable eqeqeq */

import type { PullRequestEvent } from "@octokit/webhooks-types";

import { actionOk, actionErr } from "../";
import type { ActionResult, Context } from "../";
import { Action } from "../base";

export class QueryProject extends Action {
  constructor() {
    super("pull_request");
  }

  description(): string {
    return `QueryProject for ${super.description()}`;
  }

  protected async handle(context: Context): Promise<ActionResult> {
    const payload = context.payload as PullRequestEvent;
    this.dump(payload, "payload");

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
    this.dump(projects, "foundProjectV2");

    return actionOk(
      `Project queried {id: ${projects[0].id}, title: ${projects[0].title}}`
    );
  }
}
