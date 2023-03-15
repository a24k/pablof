/* eslint-disable eqeqeq */

import { Result, ok, err } from "neverthrow";
import * as core from "@actions/core";

import { actionSkip } from "./result";
import type { Context, Sdk, ID, ActionResult } from "./";
import type {
  RepositoryPropsFragment,
  ProjectV2PropsFragment,
} from "../graphql";

export abstract class TriggerableAction {
  private triggerName: string;
  private triggerAction?: string | string[];

  constructor(name: string, action?: string | string[]) {
    this.triggerName = name;
    this.triggerAction = action;
  }

  description(): string {
    return `${this.triggerName}${
      this.triggerAction === undefined ? "" : `-${this.triggerAction}`
    }`;
  }

  debug(message: string): void {
    core.debug(message);
  }

  notice(message: string): void {
    core.notice(message, { title: this.description() });
  }

  warning(message: string): void {
    core.warning(message, { title: this.description() });
  }

  error(message: string): void {
    core.error(message, { title: this.description() });
  }

  canHandle(name: string, action?: string): boolean {
    return (
      this.triggerName === name &&
      (this.triggerAction === undefined ||
        (Array.isArray(this.triggerAction)
          ? action === undefined
            ? false
            : this.triggerAction.includes(action)
          : this.triggerAction === action))
    );
  }

  canHandleContext(context: Context): boolean {
    return this.canHandle(context.eventName, context.payload.action);
  }

  protected abstract handle(context: Context, sdk: Sdk): Promise<ActionResult>;

  async handleContext(context: Context, sdk: Sdk): Promise<ActionResult> {
    if (this.canHandleContext(context)) {
      return await this.handle(context, sdk);
    } else {
      return actionSkip();
    }
  }

  protected async queryRepositoryById(
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

  protected async queryProjectsByRepositoryId(
    sdk: Sdk,
    repository: ID
  ): Promise<Result<ProjectV2PropsFragment[], string>> {
    const node = (await sdk.queryNode({ id: repository })).node;
    this.debug(`queryNode = ${JSON.stringify(node, null, 2)}`);

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
