/* eslint-disable eqeqeq */

import { Result, ok, err } from "neverthrow";

import * as core from "@actions/core";
import * as github from "@actions/github";

import { TriggerHandler } from "./handler";

import { getSdk } from "../graphql";
import type {
  Sdk,
  RepositoryPropsFragment,
  ProjectV2PropsFragment,
} from "../graphql";

type ID = string;

export type { ID };

export abstract class Action extends TriggerHandler {
  private static readonly sdk: Sdk = getSdk(
    github.getOctokit(core.getInput("token")).graphql
  );

  protected sdk(): Sdk {
    return Action.sdk;
  }

  protected async queryRepositoryById(
    repository: ID
  ): Promise<Result<RepositoryPropsFragment, string>> {
    const node = (await this.sdk().queryNode({ id: repository })).node;
    this.dump(node, "queryNode");

    if (node == undefined || node.__typename !== "Repository") {
      return err("No repository found.");
    }

    return ok(node);
  }

  protected async queryProjectsByRepositoryId(
    repository: ID
  ): Promise<Result<ProjectV2PropsFragment[], string>> {
    const node = (await this.sdk().queryNode({ id: repository })).node;
    if (node == undefined || node.__typename !== "Repository") {
      return err("No repository found.");
    }

    const projects = node.projectsV2.nodes?.flatMap(project =>
      project == null || project.closed ? [] : project
    );

    if (projects == undefined || projects.length === 0) {
      return err("No projects found.");
    }

    return ok(projects);
  }
}
