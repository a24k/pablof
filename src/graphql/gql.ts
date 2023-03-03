/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "query milestone($owner: String!, $repository: String!, $number: Int!) {\n  repository(owner: $owner, name: $repository) {\n    id\n    name\n    owner {\n      login\n    }\n    milestone(number: $number) {\n      id\n      number\n      title\n      description\n      state\n      dueOn\n      issues(first: 100, orderBy: {field: CREATED_AT, direction: ASC}) {\n        totalCount\n        nodes {\n          id\n          number\n          title\n          state\n          trackedInIssues(first: 1) {\n            totalCount\n          }\n        }\n      }\n    }\n  }\n}": types.MilestoneDocument,
    "query projectFields($owner: String!, $number: Int!) {\n  user(login: $owner) {\n    projectV2(number: $number) {\n      id\n      title\n      fields(first: 100) {\n        totalCount\n        nodes {\n          ... on ProjectV2FieldCommon {\n            id\n            name\n            dataType\n          }\n          ... on ProjectV2IterationField {\n            configuration {\n              startDay\n              duration\n            }\n          }\n          ... on ProjectV2SingleSelectField {\n            options {\n              id\n              name\n            }\n          }\n        }\n      }\n    }\n  }\n}": types.ProjectFieldsDocument,
    "query project($owner: String!, $number: Int!) {\n  user(login: $owner) {\n    id\n    name\n    login\n    projectV2(number: $number) {\n      id\n      number\n      title\n    }\n  }\n}": types.ProjectDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query milestone($owner: String!, $repository: String!, $number: Int!) {\n  repository(owner: $owner, name: $repository) {\n    id\n    name\n    owner {\n      login\n    }\n    milestone(number: $number) {\n      id\n      number\n      title\n      description\n      state\n      dueOn\n      issues(first: 100, orderBy: {field: CREATED_AT, direction: ASC}) {\n        totalCount\n        nodes {\n          id\n          number\n          title\n          state\n          trackedInIssues(first: 1) {\n            totalCount\n          }\n        }\n      }\n    }\n  }\n}"): (typeof documents)["query milestone($owner: String!, $repository: String!, $number: Int!) {\n  repository(owner: $owner, name: $repository) {\n    id\n    name\n    owner {\n      login\n    }\n    milestone(number: $number) {\n      id\n      number\n      title\n      description\n      state\n      dueOn\n      issues(first: 100, orderBy: {field: CREATED_AT, direction: ASC}) {\n        totalCount\n        nodes {\n          id\n          number\n          title\n          state\n          trackedInIssues(first: 1) {\n            totalCount\n          }\n        }\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query projectFields($owner: String!, $number: Int!) {\n  user(login: $owner) {\n    projectV2(number: $number) {\n      id\n      title\n      fields(first: 100) {\n        totalCount\n        nodes {\n          ... on ProjectV2FieldCommon {\n            id\n            name\n            dataType\n          }\n          ... on ProjectV2IterationField {\n            configuration {\n              startDay\n              duration\n            }\n          }\n          ... on ProjectV2SingleSelectField {\n            options {\n              id\n              name\n            }\n          }\n        }\n      }\n    }\n  }\n}"): (typeof documents)["query projectFields($owner: String!, $number: Int!) {\n  user(login: $owner) {\n    projectV2(number: $number) {\n      id\n      title\n      fields(first: 100) {\n        totalCount\n        nodes {\n          ... on ProjectV2FieldCommon {\n            id\n            name\n            dataType\n          }\n          ... on ProjectV2IterationField {\n            configuration {\n              startDay\n              duration\n            }\n          }\n          ... on ProjectV2SingleSelectField {\n            options {\n              id\n              name\n            }\n          }\n        }\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query project($owner: String!, $number: Int!) {\n  user(login: $owner) {\n    id\n    name\n    login\n    projectV2(number: $number) {\n      id\n      number\n      title\n    }\n  }\n}"): (typeof documents)["query project($owner: String!, $number: Int!) {\n  user(login: $owner) {\n    id\n    name\n    login\n    projectV2(number: $number) {\n      id\n      number\n      title\n    }\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;