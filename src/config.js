import os from "os";
import fs from "fs";
import * as child_process from "child_process";
import path from "path";
import untildify from "untildify";

const configDir = os.homedir() + '/.sshfsui'


class Target {
    constructor(name, url, mount) {
        this.name = name;
        this.url = url;
        this.mount = mount;
    }

    status() {
        const output = child_process.execSync('mount').toString();
        const foundURL = output.indexOf(this.url) !== -1;
        const foundMount = output.indexOf(this.mount) !== -1;
        return foundURL || foundMount;
    }
    connect() {
        const absolutePath = untildify(this.mount);
        if (!fs.existsSync(absolutePath)) {
            fs.mkdirSync(absolutePath);
        }
        child_process.execSync(`sshfs ${this.url} ${this.mount}`);
    }
    disconnect() {
        child_process.execSync(`umount ${this.mount}`);
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
}


export function deleteTarget(name) {
    const target = configDir + '/' + name;
    fs.rmSync(target, {recursive: true});
}
