import { sync } from 'command-exists';

export function dependenciesInstalled() {
    return sync('ssh') && sync('sshfs');
}
