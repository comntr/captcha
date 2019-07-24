import * as sha1 from 'sha1';

const EXPIRATION_MS = 3 * 60 * 1000; // 3 mins
const NHEX_DIGITS = 2;
const MODULO = 100;

let nonce = sha1(
  sha1(Date.now()) +
  sha1(Math.random()));

export function derive(payload: string) {
  let time = Date.now() / EXPIRATION_MS | 0;
  let hash = sha1(sha1(time) + sha1(payload) + sha1(nonce));
  let x = parseInt(hash.slice(0, NHEX_DIGITS), 16) % MODULO
  let y = parseInt(hash.slice(NHEX_DIGITS, NHEX_DIGITS * 2), 16) % MODULO;
  let question = x + '+' + y;
  let answer = x + y + ''; // eval(q)
  return { question, answer };
}
