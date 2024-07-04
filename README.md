# sshfsui
UI to mount remote filesystems locally using SSHFS.

## Quickstart
`sshfsui` is a tray-based program. It can mount remote filesystems to local mount points which let's you interact with
remote files as if they were stored locally. All changes to files are synchronized transparently in both directions.
This is done using SSHFS under the hood.

![screenshot](docs/screenshot.png)

You can manage multiple targets. Each target has a name (needs to be file-safe) and related config:

![screenshot](docs/screenshot-add.png)

Once set up you can connect/disconnect to the target path using the tray menu.

SSH keys must be set up in advance on target hosts. Password authentication is not supported at this time.

## Installation
Download and run the installer for your OS and Architecture from [Github](https://github.com/thekashifmalik/sshfsui/releases/latest).

> **Note**: This software is not yet stable; there may be backwards-incompatible changes before v1. Use at your own
> risk.

### Prerequisites
This software requires that the following are installed and configured:

- `ssh` (via [OpenSSH](https://formulae.brew.sh/formula/openssh) for MacOS or `apt` for linux)
- `sshfs` (via [FUSE](https://osxfuse.github.io/) for MacOS or `apt` for linux)
- `timeout` (via [coreutils](https://formulae.brew.sh/formula/coreutils) for MacOS)
