import * as core from "@actions/core";
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
    core.debug(`payload = ${JSON.stringify(payload, null, 2)}`);

    const node = (
      await sdk.queryNode({
        id: payload.repository.node_id,
      })
    ).node;
    core.debug(`queryNode = ${JSON.stringify(node, null, 2)}`);

    if (node == undefined || node.__typename !== "Repository") {
      return actionErr("No repository found.");
    }

    const nodes = node.projectsV2.nodes;
    if (nodes == undefined) {
      return actionErr("No projectsV2 found.");
    }

    const projects = nodes.filter(project => project !== null);
    if (projects.length === 0 || projects[0] == undefined) {
      return actionErr("No projectsV2 found.");
    }
    core.debug(`foundProjectV2 = ${JSON.stringify(projects, null, 2)}`);

    return actionOk(
      `Project queried {id: ${projects[0].id}, number: ${projects[0].number}, title: ${projects[0].title}}`
    );
  }
}
