import { Result, ok, err } from "neverthrow";

import type { PullRequestEvent } from "@octokit/webhooks-types";

import { TriggerableAction } from "../triggerable";
import { ActionResult, actionOk, actionErr } from "../result";

import type { Context, Sdk, ID } from "../";
import type { RepositoryPropsFragment } from "../../graphql";

export class QueryProject extends TriggerableAction {
  constructor() {
    super("pull_request");
  }

  description(): string {
    return `QueryProject for ${super.description()}`;
  }

  protected async queryRepository(
    sdk: Sdk,
    repository: ID
  ): Promise<Result<RepositoryPropsFragment, string>> {
    const node = (await sdk.queryNode({ id: repository })).node;
    this.debug(`queryNode = ${JSON.stringify(node, null, 2)}`);

    if (node == undefined || node.__typename !== "Repository") {
      return err("No repository found.");
    }

    return ok(node);
  }

  protected async handle(context: Context, sdk: Sdk): Promise<ActionResult> {
    const payload = context.payload as PullRequestEvent;
    this.debug(`payload = ${JSON.stringify(payload, null, 2)}`);

    const repository = await this.queryRepository(
      sdk,
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
