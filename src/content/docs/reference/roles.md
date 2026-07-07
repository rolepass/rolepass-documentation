---
title: Role files
description: Schema for role definition files covering trust, permissions, and session settings for a managed IAM role.
sidebar:
  order: 3
---

Each file under `roles/` defines one IAM role. Rolepass discovers `roles/*.yaml`
(recursively, in alphabetical order) by default. Override with `--roles` or
`ROLEPASS_ROLES` (comma-separated paths).

A single role file can target multiple accounts; Rolepass creates one IAM role per
listed account, all sharing the same trust and permissions.

## Full example

```yaml title="roles/deploy.yaml"
name: github-deploy
description: CI/CD deployment role for GitHub Actions
accounts:
  - production
  - staging
trust:
  provider: github
  repo: my-org/my-repo
  refs:
    - refs/heads/main
    - refs/tags/v*
permissions:
  - sid: AllowS3Deploy
    effect: Allow
    actions:
      - s3:GetObject
      - s3:PutObject
    resources:
      - "arn:aws:s3:::my-deploy-bucket/*"
    conditions:
      StringEquals:
        aws:RequestedRegion:
          - eu-west-1
          - eu-central-1
  - effect: Deny
    actions:
      - s3:DeleteBucket
    resources:
      - "*"
max_session_duration: 1800
```

## Top-level fields

| Field                  | Required | Default | Description                                                     |
| ---------------------- | -------- | ------- | --------------------------------------------------------------- |
| `name`                 | Yes      | none    | IAM role name (unique per account).                             |
| `description`          | No       | none    | Human-readable description, stored on the role.                 |
| `accounts`             | Yes      | none    | List of account names (from `accounts.yaml`) to deploy into.    |
| `trust`                | Yes      | none    | Trust / federation settings. See [`trust`](#trust).             |
| `permissions`          | Yes      | none    | List of IAM policy statements. See [`permissions`](#permissions).|
| `max_session_duration` | No       | `3600`  | Maximum session duration in seconds (3600–43200).               |

### `name`

- Pattern: `^[a-zA-Z0-9+=,.@_-]{1,64}$` (standard IAM role-name characters).
- Must be unique per account.

### `accounts`

- A non-empty list of unique account names, each of which must exist in
  `accounts.yaml`.

### `max_session_duration`

- Integer between `3600` (1 hour) and `43200` (12 hours). Defaults to `3600`.

## `trust`

Defines which CI identity may assume the role via OIDC.

| Field      | Required | Default | Description                                                                 |
| ---------- | -------- | ------- | --------------------------------------------------------------------------- |
| `provider` | Yes      | none    | `github` or `gitlab`.                                                       |
| `repo`     | Yes      | none    | Repository / project path as it appears in the OIDC subject claim.          |
| `issuer`   | No       | *auto*  | OIDC issuer hostname (no `https://`). Defaults to `token.actions.githubusercontent.com` for GitHub and `gitlab.com` for GitLab. Set it for self-hosted GitLab. |
| `refs`     | No       | none    | List of git refs allowed to assume the role. Omit to allow any ref in the repo. |

The exact subject-claim formats generated for each provider, and the GitLab
requirement that refs be `refs/heads/<name>` or `refs/tags/<name>`, are documented
in [Trust policies](/reference/trust-policies/).

## `permissions`

A non-empty list of IAM policy statements, rendered into the role's single inline
policy (`rolepass-policy`).

| Field        | Required | Description                                                            |
| ------------ | -------- | --------------------------------------------------------------------- |
| `effect`     | Yes      | `Allow` or `Deny`.                                                    |
| `actions`    | Yes      | List of IAM actions (e.g. `s3:GetObject`, `lambda:InvokeFunction`, `s3:*`, `*`). |
| `resources`  | Yes      | List of resource ARNs (wildcards allowed).                            |
| `sid`        | No       | Statement ID. Pattern `^[a-zA-Z0-9]*$`.                               |
| `conditions` | No       | IAM condition block (see below).                                      |

### `actions`

Each action matches `^(\*|[a-zA-Z0-9]+:(\*|[a-zA-Z0-9*]+))$`: either `*`, a
service wildcard like `s3:*`, or a specific action like `s3:GetObject`.

### `conditions`

A nested map of `operator → condition-key → value`, mirroring an IAM `Condition`
block. Values may be a single string or a list of strings:

```yaml
conditions:
  StringEquals:
    aws:RequestedRegion:
      - eu-west-1
      - eu-central-1
  StringLike:
    aws:PrincipalTag/team: "platform-*"
```

renders to:

```json
"Condition": {
  "StringEquals": { "aws:RequestedRegion": ["eu-west-1", "eu-central-1"] },
  "StringLike": { "aws:PrincipalTag/team": "platform-*" }
}
```

## Validation

`rolepass validate` checks every role file against the schema and confirms all
account references resolve. Use `rolepass preview` to see the fully-rendered trust
and permission policies without touching AWS.
