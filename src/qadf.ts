import * as sha1 from 'sha1';
import * as config from './config';

let nonce = '';

export function seed(text: string) {
  nonce = sha1(text || Math.random() + Date.now());
  console.log('seed:', nonce);
}

export function derive(payload: string) {
  let nhd = config.NHEX_DIGITS;
  let mod = config.MODULO;
  let time = Date.now() / config.EXPIRATION_MS | 0;
  let hash = sha1(time + payload + nonce);
  let x = parseInt(hash.slice(0, nhd), 16) % mod;
  let y = parseInt(hash.slice(nhd, nhd * 2), 16) % mod;
  let question = x + '+' + y;
  let answer = x + y + ''; // eval(q)
  return { question, answer };
}
