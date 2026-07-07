---
title: accounts.yaml
description: Schema for the accounts registry, the file that maps account names to AWS account IDs.
sidebar:
  order: 2
---

`accounts.yaml` is the registry of AWS accounts Rolepass manages roles in. Roles
refer to accounts by their `name`, so account IDs live in exactly one place.

By default Rolepass reads `<config-dir>/accounts.yaml`. Override the path with
`--accounts` or `ROLEPASS_ACCOUNTS`.

## Example

```yaml title="accounts.yaml"
accounts:
  - name: production
    id: "123456789012"

  - name: staging
    id: "123456789013"

  - name: gov-prod
    id: "123456789014"
    partition: aws-us-gov
    deployer_role_name: ci-rolepass-deployer
```

## Schema

The top-level `accounts` key is a list with at least one entry; entries must be
unique.

| Field                | Required | Default             | Description                                                                 |
| -------------------- | -------- | ------------------- | --------------------------------------------------------------------------- |
| `name`               | Yes      | none                | Short, unique account name used to reference the account from role files.   |
| `id`                 | Yes      | none                | The 12-digit AWS account ID.                                                |
| `partition`          | No       | `aws`               | AWS partition the account belongs to.                                       |
| `deployer_role_name` | No       | `rolepass-deployer` | Name of the IAM role Rolepass assumes in this account to manage roles.      |

### Field details

#### `name`

- Pattern: `^[a-z0-9-]{1,32}$`. Lowercase letters, digits, and hyphens, 1 to 32
  characters.
- Must be unique across the registry.
- This is the value you list under a role's `accounts`.

#### `id`

- Pattern: `^[0-9]{12}$`. Exactly 12 digits.
- Quote it in YAML (`"123456789012"`) so it isn't parsed as a number, which would
  drop any leading zero.

#### `partition`

- One of: `aws`, `aws-cn`, `aws-us-gov`.
- Determines the ARN prefix Rolepass generates for this account (for example the
  OIDC provider ARN). Set it for China and GovCloud accounts; the default `aws`
  covers all standard commercial regions.

#### `deployer_role_name`

- Pattern: `^[a-zA-Z0-9+=,.@_-]{1,64}$` (standard IAM role-name characters).
- The name of the bootstrapped deployer role Rolepass assumes in this account. Set
  it only if your role isn't named `rolepass-deployer`. See
  [Bootstrapping AWS](/guides/bootstrapping/).

## Validation

`rolepass validate` checks this file against the schema and confirms that every
account name referenced by a role file exists here. A role referring to an unknown
account is a validation error.
