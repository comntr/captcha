import * as https from 'https';
import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs';
import * as cmdargs from 'commander';

import * as qadf from './qadf';
import * as svg from './svg';
import * as config from './config';
import * as ed25519 from './ed25519';

const log = {
  i(...args) { if (cmdargs.logs) console.log(...args); },
};

log.i('process.argv:', process.argv.join(' '));

cmdargs
  .option('-p, --port <n>', 'HTTP port.', parseInt)
  .option('-s, --seed <s>', 'Seed.')
  .option('-d, --logs', 'Print logs.')
  .parse(process.argv);

qadf.seed(cmdargs.seed);

function handleQuestionRequest(req: http.IncomingMessage, res: http.ServerResponse) {
  if (req.method != 'GET') return;
  let match = config.GET_QUESTION_PATTERN.exec(req.url);
  if (!match) return;
  let [, payload] = match;
  let { question, answer } = qadf.derive(payload);
  log.i('Q:', question);
  log.i('A:', answer);
  let svgxml = svg.render(question);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'image/svg+xml');
  res.write(svgxml);
}

function handlePostmarkRequest(req: http.IncomingMessage, res: http.ServerResponse) {
  if (req.method != 'GET') return;
  let match = config.GET_POSTMARK_PATTERN.exec(req.url);
  if (!match) return;
  let [, payload, givenAnswer] = match;
  let { answer } = qadf.derive(payload);

  if (answer != givenAnswer) {
    res.statusCode = 401;
    log.i('answer:', answer);
    return;
  }

  let signature = ed25519.sign(payload);
  log.i('sig:', signature);
  res.statusCode = 200;
  res.write(signature);
}

function handleKeysRequest(req: http.IncomingMessage, res: http.ServerResponse) {
  if (req.method != 'GET' || req.url != '/keys') return;
  let pubKeys = ed25519.getPubKeys();
  let json = JSON.stringify(pubKeys);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.write(json);
}

function handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
  log.i(req.method, req.url);
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    res.statusCode = 400;
    handleKeysRequest(req, res);
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
  log.i('Checking the cert dir:', config.CERT_DIR);
  if (fs.existsSync(config.CERT_DIR)) {
    log.i('Starting HTTPS server.');
    let key = fs.readFileSync(path.join(config.CERT_DIR, config.CERT_KEY_FILE));
    let cert = fs.readFileSync(path.join(config.CERT_DIR, config.CERT_FILE));
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
