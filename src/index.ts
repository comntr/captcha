import * as https from 'https';
import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs';
import * as cmdargs from 'commander';

import * as qadf from './qadf';
import * as svg from './svg';

const CERT_DIR = '/etc/letsencrypt/archive/comntr.live/';
const CERT_KEY_FILE = 'privkey1.pem';
const CERT_FILE = 'cert1.pem';
const GET_QUESTION_PATTERN = /^\/question\/(.+)$/;
const GET_POSTMARK_PATTERN = /^\/postmark\/(.+)\?answer=(.+)$/;

const log = {
  i(...args) { console.log(...args); },
};

log.i('process.argv:', process.argv.join(' '));

cmdargs
  .option('-p, --port <n>', 'HTTP port.', parseInt)
  .parse(process.argv);

function handleQuestionRequest(req: http.IncomingMessage, res: http.ServerResponse) {
  if (req.method != 'GET') return;
  let match = GET_QUESTION_PATTERN.exec(req.url);
  if (!match) return;
  let [, payload] = match;
  let { question, answer } = qadf.derive(payload);
  log.i('answer:', answer);
  let svgxml = svg.render(question);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'image/svg+xml');
  res.write(svgxml);
}

function handlePostmarkRequest(req: http.IncomingMessage, res: http.ServerResponse) {
  if (req.method != 'GET') return;
  let match = GET_POSTMARK_PATTERN.exec(req.url);
  if (!match) return;
  let [, payload, givenAnswer] = match;
  let { answer } = qadf.derive(payload);

  if (answer != givenAnswer) {
    res.statusCode = 401;
    log.i('answer:', answer);
    return;
  }

  let signature = '...';
  res.statusCode = 200;
  res.write(signature);
}

function handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
  log.i(req.method, req.url);
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    res.statusCode = 400;
    handleQuestionRequest(req, res);
    handlePostmarkRequest(req, res);
  } catch (err) {
    log.i(err);
    res.statusCode = 500;
  } finally {
    res.end();
    log.i(res.statusCode, res.statusMessage);
  }
}

function createServer() {
  log.i('Checking the cert dir:', CERT_DIR);
  if (fs.existsSync(CERT_DIR)) {
    log.i('Starting HTTPS server.');
    let key = fs.readFileSync(path.join(CERT_DIR, CERT_KEY_FILE));
    let cert = fs.readFileSync(path.join(CERT_DIR, CERT_FILE));
    return https.createServer({ key, cert }, handleRequest);
  } else {
    log.i('SSL certs not found.');
    log.i('Starting HTTP server.');
    return http.createServer(handleRequest);
  }
}

let server = createServer();
server.listen(cmdargs.port);
server.on('error', err => log.i(err));
server.on('listening', () => log.i('Listening on port', cmdargs.port));
