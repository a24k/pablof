#!/usr/bin/env bash

args=("$@")

query=$(cat "${args[0]}" "fragments.graphql")
unset "args[0]"

gh api graphql --raw-field query="$query" "${args[@]}"
