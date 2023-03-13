[![build-test](https://github.com/a24k/pablof/actions/workflows/test.yml/badge.svg)](https://github.com/a24k/pablof/actions/workflows/test.yml)
[![Check dist/](https://github.com/a24k/pablof/actions/workflows/check-dist.yml/badge.svg)](https://github.com/a24k/pablof/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/a24k/pablof/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/a24k/pablof/actions/workflows/codeql-analysis.yml)

# About

pablof - a Productive Assistant for a Better Life OF you and your team.

# Usage

## Beta

### Workflow Example

```yaml
name: pablof - milestone

on:
  milestone:

jobs:
  pablof-milestone:
    runs-on: ubuntu-latest
    steps:
      - uses: a24k/pablof@milestone-issue-edited
        with:
          token: ${{ secrets.GH_TOKEN }}
```

### Inputs

| Name  | Required | Type   | Description      |
| ---   | :---:    | ---    | ---              |
| token | ✓        | string | a Personal Access Token with `repo` and `project` scopes.GitHub Token for |

# Features

## Milestone Issue

```mermaid
flowchart LR
  ma[Milestone A]
  mia[Milestone Issue A]

  ma -- 1:1 --- mia

  mb[Milestone B]
  mib[Milestone Issue B]

  mb -- 1:1 --- mib

  tia[Task Issue A]
  sti1[Sub Task Issue 1]
  sti2[Sub Task Issue 2]

  tib[Task Issue B]
  sti3[Sub Task Issue 3]
  sti4[Sub Task Issue 4]

  tic[Task Issue C]

  tid[Task Issue D]

  mia -- track --> tia
  tia -- track --> sti1
  tia -- track --> sti2

  mia -- track --> tib
  tib -- track --> sti3
  tib -- track --> sti4

  mib -- track --> tic
  mib -- track --> tid
```
