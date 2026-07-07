---
title: Best Practices
description: Recommendations for running Rolepass safely and effectively in production.
---

These practices come out of how Rolepass is built and how OIDC federation is meant
to be used. Adopt the ones that fit your environment.

## Prefer OIDC over static keys

The whole point of Rolepass is to eliminate long-lived AWS access keys from CI.
Never fall back to storing access keys in pipeline secrets when a federated role
will do. Short-lived, per-run credentials can't be exfiltrated and reused later.

## Grant least privilege

Give each role only the actions and resources its pipeline needs:

- List specific `actions` rather than service wildcards (`s3:GetObject`, not `s3:*`)
  wherever practical.
- Scope `resources` to specific ARNs instead of `"*"`.
- Add explicit `Deny` statements as guardrails against especially dangerous actions
  (for example, denying `s3:DeleteBucket` or `iam:*` even inside an otherwise
  permissive role).

## Scope trust tightly with refs

Always set `trust.refs`. Omitting them trusts **any** ref in the repository, which
means any branch (including a throwaway feature branch) can assume the role.
Prefer protected branches and tags:

```yaml
trust:
  provider: github
  repo: my-org/my-repo
  refs:
    - refs/heads/main       # protected production branch only
    - refs/tags/release-*   # signed release tags
```

Pair this with branch protection / protected tags in your VCS so the trusted refs
can't be pushed to by just anyone.

## Separate environments by account

Map each environment to its own AWS account in `accounts.yaml` (`production`,
`staging`, `dev`). Account boundaries are the strongest isolation AWS offers. A
compromised staging role can't reach production resources. Rolepass makes targeting
multiple accounts from one role definition easy, so use real account separation
rather than prefixing resource names in a shared account.

## Test in staging first

List a staging account before production in a role's `accounts`, roll the change
out there, and validate your pipeline against it before promoting. Since Rolepass is
declarative, the same role definition applies identically to both.

## Version-control and review your config

Keep `accounts.yaml` and `roles/` in git and require pull-request review for
changes. Permission and trust changes then get the same scrutiny as application
code, and you get a full audit trail of who changed which role and when. Run
`rolepass plan` in the PR so reviewers see the exact IAM diff.

## Keep the deployer role minimal

The deployer role is powerful: it can create and modify IAM roles. Scope its trust
policy to just the identity that runs Rolepass, and scope its role-mutating
permissions to a naming convention or path where possible (see
[Bootstrapping AWS](/guides/bootstrapping/)). Don't reuse it for anything else.

## Set session durations to match the work

`max_session_duration` defaults to 1 hour (3600s) and can go up to 12 hours
(43200s). Shorter is safer, so set it just long enough for your longest pipeline run
(for example 1800s for a quick deploy). Only raise it for long-running jobs.

## Let orphan detection do the cleanup

When a role is no longer needed, delete its file (or remove the account from its
`accounts` list) rather than deleting the role by hand in AWS. Rolepass will detect
the orphan and remove it on the next `apply`, keeping AWS and your config in sync.
Review `DELETE` lines in every plan so a removal is never a surprise.

## Handle non-standard partitions explicitly

If you operate in AWS China (`aws-cn`) or GovCloud (`aws-us-gov`), set the
`partition` field on those accounts so Rolepass builds correct ARNs. Don't assume
the default `aws` partition applies everywhere.
