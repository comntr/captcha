import * as supercop from 'supercop.wasm';
import * as sha1 from 'sha1';

let seed = null;
let keys = null;

supercop.ready(() => console.log('ed25519 ready'));

function getKeys() {
  if (keys) return keys;
  seed = supercop.createSeed();
  keys = supercop.createKeyPair(seed);
  return keys;
}

export function sign(text: string): string {
  let keys = getKeys();
  let time = new Date().toJSON().slice(0, 10);
  let msg = Buffer.from(sha1(time + ':' + text));
  let sig = supercop.sign(msg, keys.publicKey, keys.secretKey);
  return [
    time,
    Buffer.from(keys.publicKey).toString('base64'),
    Buffer.from(sig).toString('base64'),
  ].join(':');
}
