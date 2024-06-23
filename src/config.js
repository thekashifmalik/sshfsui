import os from "os";
import fs from "fs";
import util from "util";
import * as child_process from "child_process";
import path from "path";
import untildify from "untildify";
import * as sudo from "sudo-prompt";
import { kill } from "process";

const exec = util.promisify(child_process.exec)

const configDir = os.homedir() + '/.sshfsui'


class Target {
    constructor(name, url, mount) {
        this.name = name;
        this.url = url;
        this.mount = mount;
    }

    async status() {
        const { stdout } = await exec('mount');
        const foundURL = stdout.indexOf(this.url) !== -1;
        const foundMount = stdout.indexOf(this.mount) !== -1;
        return foundURL || foundMount;
    }

    async connect() {
        const parts = this.url.split(':');
        const host = parts[0];
        await exec(`timeout 3 ssh ${host} echo ping`);
        await exec(`timeout 3 sshfs ${this.url} ${this.mount}`);
    }

    async cleanupSSHFS() {
        const { stdout } = await exec(`ps aux | grep sshfs`)
        const lines = stdout.split('\n');
        const filteredGrep = lines.filter(l => !l.includes('grep '));
        const filteredURLs = filteredGrep.filter(l => l.includes(this.url));
        const absoluteMount = untildify(this.mount);
        const filteredMount = filteredURLs.filter(l => l.includes(absoluteMount));
        const line = filteredMount[0];
        const parts = line.split(' ');
        const pid = parts[1];
        kill(pid, 'SIGKILL');
    }

    async disconnect() {
        await exec(`umount ${this.mount}`);
    }
}


export function fetchOrCreateEmptyConfig() {
    try {
        return fetchConfig();
    } catch (error) {
        console.log(error);
        createEmptyConfig();
        return [];
    }
}

function fetchConfig() {
    const config = [];
    const targetNames = fs.readdirSync(configDir, { withFileTypes: true })
        .filter(item => item.isDirectory())
        .map(item => item.name);
    for (const name of targetNames) {
        const base = configDir + '/' + name + '/';
        const targetURL = fs.readFileSync(base + "target", { encoding: 'utf8' }).trim();
        const targetMount = fs.readFileSync(base + "mount", { encoding: 'utf8' }).trim();
        const t = new Target(name, targetURL, targetMount)
        config.push(t);
    }
    return config;
}

function createEmptyConfig() {
    fs.mkdirSync(configDir);
}


export function addTarget(name, url, mount) {
    const targetBase = configDir + '/' + name;
    fs.mkdirSync(targetBase);
    fs.writeFileSync(targetBase + "/target", url, { encoding: 'utf8' });
    fs.writeFileSync(targetBase + "/mount", mount, { encoding: 'utf8' });

    const absolutePath = untildify(mount);
    if (!fs.existsSync(absolutePath)) {
        try {
            fs.mkdirSync(absolutePath);
        } catch (error) {
            // This is the error code for permissions error.
            if (error.errno === -13) {
                sudo.exec('mkdir ' + absolutePath, { name: 'sshfs' }, (e, stdout, stderr) => {
                    if (!e) {
                        const username = os.userInfo().username
                        sudo.exec(`chown ${username}:${username} ${absolutePath}`, { name: 'sshfs' }, (e, stdout, stderr) => {});
                    }
                });
            }
        }
    }
}


export function deleteTarget(name) {
    const target = configDir + '/' + name;
    fs.rmSync(target, {recursive: true});
}
