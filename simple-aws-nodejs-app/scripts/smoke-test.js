const http = require('node:http');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { setTimeout: delay } = require('node:timers/promises');

const appDir = path.resolve(__dirname, '..');
const port = process.env.SMOKE_PORT || String(32000 + Math.floor(Math.random() * 10000));
const nodeArgs = ['app.js'];

function requestHealth() {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://127.0.0.1:${port}/health`, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body });
      });
    });

    req.on('error', reject);
    req.setTimeout(1000, () => {
      req.destroy(new Error('Timed out waiting for /health'));
    });
  });
}

async function main() {
  const child = spawn(process.execPath, nodeArgs, {
    cwd: appDir,
    env: { ...process.env, PORT: port },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let output = '';
  child.stdout.on('data', (chunk) => {
    output += chunk.toString();
  });
  child.stderr.on('data', (chunk) => {
    output += chunk.toString();
  });

  try {
    for (let attempt = 0; attempt < 30; attempt += 1) {
      if (child.exitCode !== null) {
        throw new Error(`App exited early with code ${child.exitCode}.\n${output}`);
      }

      try {
        const response = await requestHealth();
        if (response.statusCode === 200 && response.body.trim() === 'OK') {
          console.log('Smoke test passed: /health returned HTTP 200 OK.');
          return;
        }
      } catch (_) {
        // The server may still be starting; retry below.
      }

      await delay(250);
    }

    throw new Error(`Timed out waiting for /health to return HTTP 200 OK.\n${output}`);
  } finally {
    child.kill('SIGTERM');
    await delay(250);
    if (child.exitCode === null) {
      child.kill('SIGKILL');
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

