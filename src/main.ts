import * as github from '@actions/github'
import * as core from '@actions/core'

const getListInput = (input: string, options?: core.InputOptions): string[] => {
  return core.getInput(input, options).split(',')
}

const GITHUB_TOKEN = core.getInput('github-token', {
  required: true,
  trimWhitespace: false,
})
const REQUIRED_LABEL_PREFIXES = getListInput('required-label-prefixes', {
  required: true,
  trimWhitespace: false,
})
const DEFAULT_LABELS = getListInput('default-labels', {
  required: true,
  trimWhitespace: false,
})
const ISSUE_NUMBER = core.getInput('issue-number', {
  required: false,
  trimWhitespace: false,
})

/**
 * @description
 * Get the issue number from either the input or from the context
 */
const getIssueNumber = (
  payload: typeof github.context.payload,
): number | undefined => {
  // Most users will likely never pass an `issue-number`. This is used
  // internally to test that this action is working.
  if (ISSUE_NUMBER !== '' && !isNaN(Number(ISSUE_NUMBER))) {
    return Number(ISSUE_NUMBER)
  }

  const issueNumber = payload.issue && payload.issue.issueNumber
  if (issueNumber) {
    return issueNumber
  }

  const prNumber =
    payload.pull_request && payload.issue && payload.issue.pull_request
  if (prNumber) {
    return prNumber
  }

  const cardUrl = payload.project_card && payload.project_card.content_url
  const issueNumberFromCard = cardUrl && cardUrl.split('/').pop()
  return issueNumberFromCard
}

const hasLabelWithRequiredPrefix = (labels: string[]): boolean => {
  return labels.some((label: string) => {
    REQUIRED_LABEL_PREFIXES.some((requiredLabelPrefix) =>
      label.startsWith(requiredLabelPrefix),
    )
  })
}

const getMissingDefaultLabels = (labels: string[]): string[] => {
  const currentLabels = new Set(labels)
  const defaultLabels = new Set(DEFAULT_LABELS)
  const missingLabels = new Set<string>()

  for (const defaultLabel of defaultLabels) {
    if (!currentLabels.has(defaultLabel)) {
      missingLabels.add(defaultLabel)
    }
  }
  return Array.from(missingLabels)
}

async function main(): Promise<string> {
  const hasPayload = Boolean(github && github.context && github.context.payload)
  if (!hasPayload) {
    throw new Error('No payload provided in GitHub context.')
  }

  const octokit = github.getOctokit(GITHUB_TOKEN)

  const REPO_NAME = github.context?.payload?.repository?.name
  if (!REPO_NAME) {
    throw new Error('Failed to read repository name.')
  }
  const OWNER_NAME = github.context?.payload?.repository?.owner?.login as string
  if (!OWNER_NAME) {
    throw new Error('Failed to read repository owner name.')
  }

  const issueNumber = getIssueNumber(github.context.payload)

  if (!issueNumber) {
    throw new Error(
      'No action being taken. Ignored because "issueNumber" was undefined.',
    )
  }

  const githubIssue = await octokit.rest.issues.get({
    owner: OWNER_NAME,
    repo: REPO_NAME,
    issue_number: issueNumber,
  })

  const labels = githubIssue.data.labels
    .map((it): string | undefined => {
      if (typeof it === 'string') {
        return it
      }
      if (it.name) {
        return it.name
      }
    })
    .filter((it: string | undefined): boolean => {
      return typeof it === 'string'
    }) as string[]

  if (hasLabelWithRequiredPrefix(labels)) {
    return `No action being taken for #${issueNumber}. Required label already present.`
  }

  const missingLabels = getMissingDefaultLabels(labels)

  if (missingLabels.length === 0) {
    return `No action being taken for #${issueNumber}. Default label(s) already present.`
  }

  const updatedLabels = [...new Set(labels.concat(missingLabels))]

  await octokit.rest.issues.update({
    owner: OWNER_NAME,
    repo: REPO_NAME,
    issue_number: issueNumber,
    labels: updatedLabels,
  })

  return `Updated labels in #${issueNumber}. Default labels are now present: ${DEFAULT_LABELS.join(
    ', ',
  )}`
}

main()
  .then(
    (message: string) => {
      core.info(message)
    },
    (error: Error) => {
      core.error(error)
      process.exit(core.ExitCode.Failure)
    },
  )
  .finally(() => {
    core.info('Action has finished.')
    process.exit(core.ExitCode.Success)
  })
