import * as core from '@actions/core'
import * as github from '@actions/github'

async function main(): Promise<void> {
  try {
    core.notice('some notice for you')
    core.debug('github.context:')
    core.debug(JSON.stringify(github.context, null, 2))
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

main()
