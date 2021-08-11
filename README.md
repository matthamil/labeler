# matthamil/labeler

GitHub action that can automatically add `default-labels` to Issues and Pull Requests if a label with a specific prefix (`required-label-prefix`) is not present.

For example, assume you have a GitHub repo with labels: `Priority: High`, `Priority: Medium`, `Priority: Low`, and `Priority: Unknown`. This GitHub action will allow you to automatically add the `Priority: Unknown` label when any other `Priority: *` label is not present on an issue, pull request, or project card.

## Supported GitHub Events

* `issues`
* `pull_request`
* `project_card`

## Usage

The following example ensures that the `Priority: Unknown` label is always present on any issue or project card that does not already have a label that starts with `Priority: `.

> This action does *not* ensure that only one label exists that matches a `required-label-prefixes`. For example, it is possible for a user to add both the "Priority: Medium" and "Priority: High" labels to the same Issue/Pull Request/Project Card when only one "Priority: *" label should be present. This constraint is on my list of features to implement.

```yml
name: issue-labeler

on:
  issues:
    types: [opened, edited]
  project_card:
    types: [moved]

jobs:
  automate-issues-labels:
    runs-on: ubuntu-latest
    steps:
      - name: Ensure Default Label is Present
        uses: matthamil/labeler@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          required-label-prefixes: 'Priority: '
          default-labels: 'Priority: Unknown'
```
## Publishing

Increment the version number in the `package.json` and run the following:

```bash
npm run build && npm run package
```

Commit the changes to the repository and push to `main`.

## Attributions

This project was heavily inspired by [andymckay/labeler](https://github.com/andymckay/labeler).