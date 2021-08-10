# WIP

This action, while published to the Marketplace, is a WIP. Expect buggy behavior for now.

# matthamil/labeler

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
## Attributions

This project was heavily inspired by [andymckay/labeler](https://github.com/andymckay/labeler).