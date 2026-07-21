import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH = path.join(__dirname, '..', '.env');

// Escribe (o reemplaza) una variable en server/.env y la deja disponible al toque
// en process.env, sin esperar a que se reinicie el proceso.
export function upsertEnvVar(key, value) {
  let lines = [];
  if (fs.existsSync(ENV_PATH)) {
    lines = fs.readFileSync(ENV_PATH, 'utf-8').split('\n').filter(Boolean);
  }

  const withoutKey = lines.filter((line) => !line.startsWith(`${key}=`));
  withoutKey.push(`${key}=${value}`);
  fs.writeFileSync(ENV_PATH, withoutKey.join('\n') + '\n', 'utf-8');

  process.env[key] = value;
}
