# Branch workflow

- The only long-lived branch is `master` (the default branch). No other branch stays around.
- Every new feature or fix starts from a fresh `master`: `git fetch origin && git switch -c <type>/<name> origin/master`. Never branch off another feature branch, and never commit to `master` directly.
- One branch per task. When several agents work in parallel, each one has its own branch from `master` and its own PR; the owner merges them into `master` one at a time. If `master` moved, rebase or merge `origin/master` into your branch before asking for a merge.
- Do not merge PRs yourself unless asked. The repository deletes head branches on merge; delete any leftover local branch once its PR is merged.
- Deploy only from `master` after the PR is merged, so the live site always matches `master`.
