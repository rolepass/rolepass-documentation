---
title: CLI Reference
description: Every Rolepass command, global option, flag, and environment variable.
sidebar:
  order: 1
---

```
rolepass [OPTIONS] <COMMAND>
```

Get help for the tool or any command with `--help`:

```sh
rolepass --help
rolepass apply --help
```

## Commands

| Command    | AWS access | Description                                                       |
| ---------- | ---------- | ---------------------------------------------------------------- |
| `init`     | No         | Scaffold a new project with sample `accounts.yaml` and `roles/deploy.yaml`. |
| `validate` | No         | Validate config files against the JSON schemas and cross-check account references. |
| `preview`  | No         | Print the generated IAM trust and permission policies as JSON.   |
| `plan`     | Yes        | Assume deployer roles, read current state, and show a diff of planned changes. |
| `apply`    | Yes        | Execute the plan: create, update, and delete roles.              |

### `init`

Creates `accounts.yaml` and `roles/deploy.yaml` in the config directory with sample
content. It **refuses to overwrite** either file if it already exists, exiting with
an error and changing nothing.

### `validate`

Loads `accounts.yaml` and every role file and validates them against Rolepass's
embedded JSON schemas. It also cross-validates: every account name referenced in a
role must exist in the accounts registry. Makes no AWS calls. Exits non-zero on any
validation error.

### `preview`

Loads and validates the config, then prints a JSON array, one entry per
role/account pair, containing the `role_name`, `account_name`, `account_id`,
optional `description`, generated `trust_policy`, generated `permission_policy`, and
`max_session_duration`. Makes no AWS calls. Useful for inspecting exactly what would
be created. See [Trust policies](/reference/trust-policies/).

### `plan`

Assumes the deployer role in each target account via STS, fetches the current IAM
state of each role (trust policy, inline policy, session duration, description,
tags), and compares it to the desired configuration. Prints a categorized diff
(`CREATE` / `UPDATE` / `DELETE` / no change) and a summary. Makes no changes. Exits
non-zero if it can't assume a deployer role.

### `apply`

Performs the same read work as `plan`, re-displays the plan, then after
confirmation executes it. Roles are created, updated, or deleted as needed, and
all created/updated roles are tagged `managed-by: rolepass`. Reports a
success/failure count and exits non-zero if any operation failed (safe to re-run to
retry).

#### Flags

| Flag        | Description                                                                 |
| ----------- | --------------------------------------------------------------------------- |
| `--yes`, `-y` | Skip the confirmation prompt. Required when stdin is not a terminal (e.g. CI); otherwise `apply` refuses to run. |

## Global options

These apply to all commands. Each has an environment-variable equivalent; the
command-line flag takes precedence when both are set.

| Option                | Environment variable   | Default | Description                                              |
| --------------------- | ---------------------- | ------- | -------------------------------------------------------- |
| `--config-dir <DIR>`  | `ROLEPASS_CONFIG_DIR`  | `.`     | Directory containing `accounts.yaml` and `roles/`.       |
| `--accounts <FILE>`   | `ROLEPASS_ACCOUNTS`    | none    | Override the accounts file path.                         |
| `--roles <FILE>,...`  | `ROLEPASS_ROLES`       | none    | Override role file paths (comma-separated).              |
| `--debug`             | none                   | off     | Enable debug output for troubleshooting AWS interactions.|

By default Rolepass looks for `<config-dir>/accounts.yaml` and
`<config-dir>/roles/*.yaml` (role files are discovered recursively and processed in
alphabetical order).

## Environment variables

### Rolepass

| Variable              | Equivalent to     |
| --------------------- | ----------------- |
| `ROLEPASS_CONFIG_DIR` | `--config-dir`    |
| `ROLEPASS_ACCOUNTS`   | `--accounts`      |
| `ROLEPASS_ROLES`      | `--roles`         |

### AWS

Rolepass uses the standard AWS credential chain, so any variable the AWS SDK honors
applies, including:

| Variable                       | Purpose                                                          |
| ------------------------------ | ---------------------------------------------------------------- |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_SESSION_TOKEN` | Static or temporary credentials.        |
| `AWS_REGION` / `AWS_DEFAULT_REGION` | Region for STS and IAM calls.                               |
| `AWS_PROFILE`                  | Named profile from the shared config/credentials files.          |
| `AWS_WEB_IDENTITY_TOKEN_FILE` + `AWS_ROLE_ARN` | OIDC web-identity assumption (set automatically when Rolepass itself runs in a federated CI job). |

## Exit codes

Rolepass exits `0` on success and non-zero on failure, including validation
errors, failure to assume a deployer role, or any failed operation during `apply`.
This makes it safe to gate CI steps on the exit status.
