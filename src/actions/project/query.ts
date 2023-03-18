/* eslint-disable eqeqeq */

import { Result, ok, err } from "neverthrow";

import type { PullRequestEvent } from "@octokit/webhooks-types";

import { actionOk, actionErr } from "../";
import { Action } from "../base";
import { graphql } from "../graphql";
import type { ActionResult, Context, ID } from "../";

import type { RepositoryPropsFragment } from "./graphql";

import { getSdk } from "./graphql";
const gql = getSdk(graphql);

export class QueryProject extends Action {
  constructor() {
    super("pull_request");
  }

  protected async queryRepositoryById(
    repository: ID
  ): Promise<Result<RepositoryPropsFragment, string>> {
    const node = (await gql.queryNode({ id: repository })).node;
    this.dump(node, "queryNode");

    if (node == undefined || node.__typename !== "Repository") {
      return err("No repository found.");
    }

    return ok(node);
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
