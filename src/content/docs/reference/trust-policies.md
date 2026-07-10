---
title: Trust policies
description: How Rolepass generates OIDC trust policies, including the subject-claim formats for GitHub and GitLab.
sidebar:
  order: 4
---

For every role/account pair, Rolepass generates an IAM trust policy that federates
against an OIDC provider and constrains which repository and refs may assume the
role. This page documents exactly what it produces. Use `rolepass preview` to see
the output for your own config.

## OIDC provider ARN

The trust policy's `Principal.Federated` is the OIDC provider ARN, built from the
account's partition, the account ID, and the issuer:

```
arn:<partition>:iam::<account-id>:oidc-provider/<issuer>
```

The issuer defaults per provider and can be overridden with `trust.issuer`:

| Provider | Default issuer                          |
| -------- | --------------------------------------- |
| `github` | `token.actions.githubusercontent.com`   |
| `gitlab` | `gitlab.com`                            |

Examples:

- GitHub, `aws` partition: `arn:aws:iam::111111111111:oidc-provider/token.actions.githubusercontent.com`
- GitLab, `aws` partition: `arn:aws:iam::222222222222:oidc-provider/gitlab.com`
- Self-hosted GitLab (`issuer: gitlab.mycompany.com`): `arn:aws:iam::333333333333:oidc-provider/gitlab.mycompany.com`
- GitHub, `aws-cn` partition: `arn:aws-cn:iam::444444444444:oidc-provider/token.actions.githubusercontent.com`
- GitHub, `aws-eusc` partition: `arn:aws-eusc:iam::555555555555:oidc-provider/token.actions.githubusercontent.com`

## Conditions

Every generated trust policy pins the audience and constrains the subject:

- **`StringEquals`** on `<issuer>:aud`, always `sts.amazonaws.com`.
- **`StringLike`** on `<issuer>:sub`, the subject pattern(s) derived from `repo`
  and `refs`. `StringLike` is used so wildcards (`*`) in your refs are honored.

When there is a single subject pattern, `sub` is a string; with multiple patterns it
is an array.

## Subject-claim formats

The `sub` pattern differs by provider.

### GitHub

| `refs` config                | Generated `sub`                             |
| ---------------------------- | ------------------------------------------- |
| *(omitted)*                  | `repo:<repo>:*`                             |
| `refs/heads/main`            | `repo:<repo>:ref:refs/heads/main`           |
| `refs/tags/v*`               | `repo:<repo>:ref:refs/tags/v*`              |

GitHub refs are inserted verbatim after `ref:`. Any ref string is accepted, and
wildcards work as-is.

### GitLab

| `refs` config                | Generated `sub`                                          |
| ---------------------------- | -------------------------------------------------------- |
| *(omitted)*                  | `project_path:<repo>:*`                                  |
| `refs/heads/main`            | `project_path:<repo>:ref_type:branch:ref:main`          |
| `refs/heads/*`               | `project_path:<repo>:ref_type:branch:ref:*`             |
| `refs/tags/v1.0`             | `project_path:<repo>:ref_type:tag:ref:v1.0`             |

GitLab refs **must** be `refs/heads/<name>` (mapped to `ref_type:branch`) or
`refs/tags/<name>` (mapped to `ref_type:tag`). Rolepass strips the prefix to the
short name and derives the `ref_type`. Any other format, for example a bare
`main`, is rejected during policy generation. Wildcards in the short name (e.g.
`refs/heads/*`, `refs/tags/v*`) are allowed.

## Full generated example

For this role in account `111111111111`:

```yaml
name: github-deploy
accounts: [prod]
trust:
  provider: github
  repo: my-org/my-repo
  refs:
    - refs/heads/main
    - refs/tags/v*
permissions:
  - effect: Allow
    actions: [s3:GetObject]
    resources: ["arn:aws:s3:::my-bucket/*"]
```

`rolepass preview` produces the following trust policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::111111111111:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": [
            "repo:my-org/my-repo:ref:refs/heads/main",
            "repo:my-org/my-repo:ref:refs/tags/v*"
          ]
        }
      }
    }
  ]
}
```

The accompanying permission policy (the role's single inline policy,
`rolepass-policy`) is:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::my-bucket/*"]
    }
  ]
}
```

See the [roles reference](/reference/roles/) for how `permissions` map into the
permission policy, and the [GitHub Actions](/guides/github-actions/) and
[GitLab CI](/guides/gitlab-ci/) guides for matching the subject on the consumer
side.
