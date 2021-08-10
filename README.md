# @matthamil/labeler

GitHub action that can automatically add `default-labels` to Issues and Pull Requests if a label with a specific prefix (`required-label-prefix`) is not present.

## Supported GitHub Events

* `issues`
* `pull_request`
* `project_card`

## Usage

The following example ensures that the `Priority: Unknown` label is always present on any issue or project card that does not already have a label that starts with `Priority: `.

> This action does *not* ensure that only one label exists that matches a `required-label-prefixes`. This is on my list of features to implement.

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

Actions are run from GitHub repos so the `dist` directory should be checked into git. 

Then run [ncc](https://github.com/zeit/ncc) and push the results:
```bash
npm run package
git add dist
git commit -a -m "prod dependencies"
git push origin releases/v1
```

Note: We recommend using the `--license` option for ncc, which will create a license file for all of the production node modules used in your project.

Your action is now published! :rocket: 

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)

## Usage:

After testing you can [create a v1 tag](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md) to reference the stable and latest V1 action

## Attributions

This project was heavily inspired by [andymckay/labeler](https://github.com/andymckay/labeler).