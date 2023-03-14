import type { PullRequestEvent } from "@octokit/webhooks-types";

import { TriggerableAction } from "../triggerable";
import { ActionResult, actionOk, actionErr } from "../result";

import type { Context, Sdk } from "../";

export class QueryProject extends TriggerableAction {
  constructor() {
    super("pull_request");
  }

  description(): string {
    return `QueryProject for ${super.description()}`;
  }

  protected async handle(context: Context, sdk: Sdk): Promise<ActionResult> {
    const payload = context.payload as PullRequestEvent;
    this.debug(`payload = ${JSON.stringify(payload, null, 2)}`);

    const node = await sdk.queryNode({
      id: payload.repository.node_id,
    });
    this.debug(`queryNode = ${JSON.stringify(node, null, 2)}`);

    if (
      node == undefined ||
      node.node == undefined ||
      node.node.__typename !== "Repository"
    ) {
      return actionErr("No repository found.");
    }

    const nodes = node.node.projectsV2.nodes;
    if (nodes == undefined) {
      return actionErr("No projectsV2 found.");
    }

    const projects = nodes.filter(
      project => project !== null && project.closed === false
    );
    if (projects.length === 0 || projects[0] == undefined) {
      return actionErr("No projectsV2 found.");
    }
    this.debug(`foundProjectV2 = ${JSON.stringify(projects, null, 2)}`);

    return actionOk(
      `Project queried {id: ${projects[0].id}, title: ${projects[0].title}}`
    );
  }
}
