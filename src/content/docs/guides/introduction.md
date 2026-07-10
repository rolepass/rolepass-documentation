---
title: Introduction
description: What RolePass is, the problem it solves, and the core concepts you need to understand before using it.
---

**RolePass** manages AWS IAM roles for CI/CD pipelines across multiple AWS accounts
using OIDC (OpenID Connect) federation. Instead of clicking through the IAM console
or maintaining ad-hoc Terraform for every deploy role, you describe your roles once
in version-controlled YAML and let RolePass provision, update, and clean them up
across every account.

## The problem it solves

CI/CD pipelines need AWS permissions. The traditional approach, creating an IAM
user, generating an access key, and pasting it into your CI system's secrets, has
well-known drawbacks:

- **Long-lived credentials** sit in CI secrets indefinitely and are a prime target
  if leaked.
- **Manual management** of roles across many accounts drifts quickly. Roles get
  created for one-off tasks and never cleaned up.
- **No audit trail**: who changed which role's permissions, and when?

OIDC federation fixes the credentials problem: GitHub Actions and GitLab CI can
exchange a short-lived, signed identity token for temporary AWS credentials by
assuming a role, with **no static secrets stored anywhere**. RolePass fixes the
management problem: it turns the roles that back that federation into declarative,
reviewable configuration.

## How RolePass works

RolePass is a command-line tool. You point it at a directory of YAML files and run
one of five commands:

1. **`init`** scaffolds a starter config.
2. **`validate`** checks your config against the schemas. No AWS calls.
3. **`preview`** prints the exact IAM JSON that would be generated. No AWS calls.
4. **`plan`** connects to AWS, reads the current state of your roles, and shows a
   diff of what would change.
5. **`apply`** executes that diff, creating, updating, and deleting roles.

The `plan` → `apply` split means you always see precisely what will happen before
anything is changed, the same way `terraform plan` precedes `terraform apply`.

## Core concepts

### Accounts registry

A single `accounts.yaml` file maps friendly names (like `production` or `staging`)
to 12-digit AWS account IDs. Every role refers to accounts by these names, so your
role definitions stay readable and account IDs live in exactly one place. See the
[accounts reference](/reference/accounts/) for the full schema.

### Role files

Each file under `roles/` defines one IAM role: its trust relationship (which
GitHub/GitLab repo and refs may assume it), its permissions, and how long its
sessions last. A single role file can target multiple accounts at once. See the
[roles reference](/reference/roles/) for the full schema.

### The deployer role

RolePass does not manage IAM roles with your own credentials directly. Instead,
each target account contains a bootstrapped **deployer role** (default name
`rolepass-deployer`) with permission to manage IAM roles. RolePass assumes this
role in each account via STS, then does its work there. This keeps the blast radius
contained and lets you grant RolePass access account-by-account. Setting it up is
covered in [Bootstrapping AWS](/guides/bootstrapping/).

### Managed roles and orphan detection

Every role RolePass creates is tagged `managed-by: rolepass` and given a single
inline policy named `rolepass-policy`. Because managed roles are tagged, RolePass
can find roles it created that are no longer in your config (**orphans**) and
flag them for deletion during `plan`. This keeps your accounts free of stale roles
without you having to track them manually. RolePass never touches roles it didn't
create.

## What's next

- Follow [Installation](/guides/installation/) to get the `rolepass` binary.
- Walk through [Getting Started](/guides/getting-started/) for a complete
  first-run.
- Read [Bootstrapping AWS](/guides/bootstrapping/) to prepare your accounts.
