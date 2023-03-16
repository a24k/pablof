[![Build & Test](https://github.com/a24k/pablof/actions/workflows/ci.yml/badge.svg)](https://github.com/a24k/pablof/actions/workflows/ci.yml)
[![Check & Test Flight](https://github.com/a24k/pablof/actions/workflows/dist.yml/badge.svg)](https://github.com/a24k/pablof/actions/workflows/dist.yml)
[![CodeQL](https://github.com/a24k/pablof/actions/workflows/codeql.yml/badge.svg)](https://github.com/a24k/pablof/actions/workflows/codeql.yml)

# About

pablof -- a Productive Assistant for a Better Life OF you, your team, your family and our world.

This is a custom action for GitHub Actions to help you work with GitHub Issues and Projects (V2).

## Table of Contents

- [Usage](#usage)
- [Feature - Milestone Issue](#feature---milestone-issue)
    - [Action - Create Milestone Issue](#action---create-milestone-issue)
    - [Action - Sync Milestone Issue](#action---sync-milestone-issue)

# Usage

## Beta - Milestone Issue

### Workflow Example

```yaml
name: pablof

on:
  milestone:

jobs:
  pablof:
    runs-on: ubuntu-latest
    steps:
      - uses: a24k/pablof@milestone-issue
        with:
          token: ${{ secrets.GH_TOKEN }}
```

### Inputs

| Name    | Required | Type   | Description                                             |
| ---     | :---:    | ---    | ---                                                     |
| token   | ✓        | string | Personal Access Token with `repo` and `project` scopes. |

# Feature - Milestone Issue

[Milestone](https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/about-milestones)
is a better way to track progress on groups of issues.
It is very useful for managing project with multiple issues,
but there is not a sufficient way to describe or discuss about Milestone itself in detail.

## Concept

Milestone Issue is a issue linked 1:1 to Milestone.

As shown in the figure below, each Milestone has a linked Milestone Issue.
Each Issues in the Milestone should be tracked from the Milestone Issue.
All Issues on the Milestone consists of a single tree with the Milestone Issue as its root.

```mermaid
flowchart LR
  ma[Milestone A]
  mia[Milestone Issue A]

  ma -- 1:1 --- mia

  mb[Milestone B]
  mib[Milestone Issue B]

  mb -- 1:1 --- mib

  ti1[Task Issue 1]
  sia[Sub Issue a]
  sib[Sub Issue b]

  ti2[Task Issue 2]
  sic[Sub Issue c]
  sid[Sub Issue d]

  ti3[Task Issue 3]

  ti4[Task Issue 4]

  mia -- track --> ti1
  ti1 -- track --> sia
  ti1 -- track --> sib

  mia -- track --> ti2
  ti2 -- track --> sic
  ti2 -- track --> sid

  mib -- track --> ti3
  mib -- track --> ti4
```

### How to identify the Milestone Issue

1. list issues linked with the Milestone
1. filter issues by `trackedInIssues.totalCount === 0`
1. the first issue, in order of `CREATED_AT ASC`, is the Milestone Issue

## Action - Create Milestone Issue

Automatically create a Milestone Issue when a Milestone is created.
The created Milestone Issue will inherit the `title` and `body` of the Milestone.

### Supported Triggers

| Name        | Action    |
| ---         | ---       |
| `milestone` | `created` |

### Workins with Projects (V2)

If you have linked Projects on the Repository,
this action will add the Milestone Issue to every linked Projects.

#### Status Field

If the Project has a Field named `Status`,
this action will set the value of `Status` according to following rules in the order written.

1. If the `Status` Field has an Option named `Milestone`, set `Status` to `Milestone`.
1. If the `Status` Field has an Option named `Project`, set `Status` to `Project`.
1. Otherwise, set `Status` to first (most left) one.

#### Start Date Field

If the Project has a Field name matched with `/^(Begin|Start) [dD]ate$/`,
this action will set the field value to `createdAt` of Milestone.
Only affects for the first Field matched.

#### Target Date Field

If the Project has a Field name matched with `/^(Due|End|Finish|Target) [dD]ate$/`,
this action will set the field value to `dueOn` of Milestone.
Only affects for the first Field matched.

## Action - Sync Milestone Issue

Automatically updates the Milestone Issue when a Milestone is updated.
The updated Milestone Issue will have the same `title` and `state` as the Milestone.

### Supported Triggers

| Name        | Action    |
| ---         | ---       |
| `milestone` | `edited` `closed` `opened` |

### Workins with Projects (V2)

If you have linked Items on the Milestone Issue,
this action will update Items linked with Projects.

#### Target Date Field

If the Project has a Field name matched with `/^(Due|End|Finish|Target) [dD]ate$/`,
this action will set the field value to `dueOn` of Milestone.
Only affects for the first Field matched.
