import * as core from "@actions/core";
import * as github from "@actions/github";

const graphql = github.getOctokit(core.getInput("token")).graphql;

export { graphql };
