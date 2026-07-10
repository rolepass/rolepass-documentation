---
title: Installation
description: Download a prebuilt RolePass binary, build it from source, or run it as a Docker container.
---

RolePass is a single self-contained binary written in Rust. Download a prebuilt
release, build it from source with Cargo, or run it as a container.

## Download a release

Prebuilt binaries for the latest release are published at:

```
https://releases.rolepass.dev/latest/rolepass-<target-arch>.tar.xz
```

Windows binaries are packaged as `.zip` instead of `.tar.xz`.

Pick the archive matching your platform:

| Platform                     | `<target-arch>`               | Download                                                                    |
| ---------------------------- | ----------------------------- | --------------------------------------------------------------------------- |
| Apple Silicon macOS          | `aarch64-apple-darwin`        | `https://releases.rolepass.dev/latest/rolepass-aarch64-apple-darwin.tar.xz` |
| Linux x86-64 (glibc)         | `x86_64-unknown-linux-gnu`    | `https://releases.rolepass.dev/latest/rolepass-x86_64-unknown-linux-gnu.tar.xz` |
| Linux x86-64 (musl / static) | `x86_64-unknown-linux-musl`   | `https://releases.rolepass.dev/latest/rolepass-x86_64-unknown-linux-musl.tar.xz` |
| Linux ARM64 (glibc)          | `aarch64-unknown-linux-gnu`   | `https://releases.rolepass.dev/latest/rolepass-aarch64-unknown-linux-gnu.tar.xz` |
| Linux ARM64 (musl / static)  | `aarch64-unknown-linux-musl`  | `https://releases.rolepass.dev/latest/rolepass-aarch64-unknown-linux-musl.tar.xz` |
| Windows x86-64               | `x86_64-pc-windows-msvc`      | `https://releases.rolepass.dev/latest/rolepass-x86_64-pc-windows-msvc.zip` |

The `musl` builds are statically linked and are the best choice for minimal
container images and CI runners.

Download, extract, and place the binary on your `PATH`. For example, on Apple
Silicon macOS:

```sh
curl -LO https://releases.rolepass.dev/latest/rolepass-aarch64-apple-darwin.tar.xz
tar -xf rolepass-aarch64-apple-darwin.tar.xz
sudo mv rolepass /usr/local/bin/
rolepass --help
```

On Windows, download the `.zip`, extract it, and place `rolepass.exe` somewhere
on your `PATH`. In PowerShell:

```powershell
Invoke-WebRequest https://releases.rolepass.dev/latest/rolepass-x86_64-pc-windows-msvc.zip -OutFile rolepass.zip
Expand-Archive rolepass.zip -DestinationPath .
.\rolepass.exe --help
```

## From source

You need a recent Rust toolchain (RolePass uses the 2024 edition). Install
[rustup](https://rustup.rs/) if you don't already have `cargo`.

From a checkout of the RolePass repository:

```sh
cargo install --path .
```

This builds an optimized binary and installs it into `~/.cargo/bin`, which should
already be on your `PATH`. Verify the install:

```sh
rolepass --help
```

## Docker

A multi-stage Alpine-based image is provided. Build it once:

```sh
docker build -t rolepass .
```

Then run RolePass against a config directory by mounting it into the container. The
image's working directory is set with `-w`, and your config is mounted at that
path:

```sh
docker run --rm -v "$PWD:/config" -w /config rolepass validate
```

For commands that talk to AWS (`plan` and `apply`), pass your AWS credentials
through to the container, for example by forwarding the standard environment
variables:

```sh
docker run --rm \
  -v "$PWD:/config" -w /config \
  -e AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY -e AWS_SESSION_TOKEN \
  -e AWS_REGION \
  rolepass plan
```

## Verify your install

The quickest way to confirm RolePass works end-to-end without touching AWS is to
scaffold a project and validate it:

```sh
rolepass init
rolepass validate
```

If both commands succeed, you're ready to move on to
[Getting Started](/guides/getting-started/).
