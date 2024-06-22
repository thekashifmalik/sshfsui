# sshfsui
Straightforward UI to manage your SSHFS mounts.

## Quickstart
`sshfsui` is a mostly tray-based program. It can create SSHFS mount targets, connect & disconnect to them and delete
these targets.

![screenshot](screenshot.png)


## Installation
Download the right installer for your OS and Architecture from [Github](https://github.com/thekashifmalik/sshfsui/releases).

> **Note**: This software is not yet stable; there may be backwards-incompatible changes before v1. Use at your own
> risk.

### MacOS instructions
On MacOS you will need to run the following command before you can start the application:

```bash
xattr -c /Applications/sshfsui.app
```

This is needed since this application has not yet been signed via the Apple Developer Program.
