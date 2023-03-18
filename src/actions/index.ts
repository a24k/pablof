import * as core from "@actions/core";
import * as github from "@actions/github";

import type { Sdk } from "../graphql";

import { actionOk, actionSkip, actionErr } from "./result";
import type {
  ActionResult,
  ActionOk,
  ActionErr,
  ActionSuccess,
  ActionSkip,
  ActionFailure,
} from "./result";

import { collect } from "./collect";

import type { Context } from "./handler";

import type { ID } from "./base";

const graphql = github.getOctokit(core.getInput("token")).graphql;

export { actionOk, actionSkip, actionErr, collect, graphql };

export type {
  ActionResult,
  ActionOk,
  ActionErr,
  ActionSuccess,
  ActionSkip,
  ActionFailure,
  Context,
  ID,
  Sdk,
};
