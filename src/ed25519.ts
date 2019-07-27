import * as supercop from 'supercop.wasm';
import * as sha1 from 'sha1';
import * as fs from 'fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import * as config from './config';

let latestKeys = null;
let seeds = null;
let pubKeys = null;

supercop.ready(() => console.log('ed25519 ready'));

function loadSeeds() {
  if (!fs.existsSync(config.KEYS_FILE))
    return {};
  let json = fs.readFileSync(config.KEYS_FILE, 'utf8');
  return JSON.parse(json);
}

// json[base64(seed)] = expired.toJSON()
function saveSeeds(json) {
  let dir = path.dirname(config.KEYS_FILE);
  if (!fs.existsSync(dir))
    mkdirp.sync(dir);
  fs.writeFileSync(config.KEYS_FILE, JSON.stringify(json), 'utf8');
}

function base64(data): string {
  return Buffer.from(data).toString('base64');
}

function fromBase64(text: string) {
  return Buffer.from(text, 'base64');
}

function getKeys() {
  seeds = seeds || loadSeeds();

  for (let seed in seeds) {
    let expired = seeds[seed];
    if (expired) continue;
    latestKeys = supercop.createKeyPair(fromBase64(seed));
    return latestKeys;
  }

  let seed = supercop.createSeed();
  seeds[base64(seed)] = null;
  saveSeeds(seeds);
  latestKeys = supercop.createKeyPair(seed);
  return latestKeys;
}

export function getPubKeys() {
  if (pubKeys) return pubKeys;
  getKeys();
  pubKeys = {};

  for (let seed in seeds) {
    let expired = seeds[seed];
    let { publicKey } = supercop.createKeyPair(fromBase64(seed));
    pubKeys[base64(publicKey)] = expired && expired.toJSON();
  }

  return pubKeys;
}

export function sign(text: string): string {
  let keys = getKeys();
  let time = new Date().toJSON().slice(0, 10);
  let msg = Buffer.from(sha1(time + ':' + text));
  let sig = supercop.sign(msg, keys.publicKey, keys.secretKey);
  return [
    time,
    base64(keys.publicKey),
    base64(sig),
  ].join(':');
}
