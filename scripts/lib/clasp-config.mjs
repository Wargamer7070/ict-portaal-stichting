import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFile = fileURLToPath(import.meta.url);
export const repositoryRoot = path.resolve(path.dirname(currentFile), '..', '..');

const environmentAliases = Object.freeze({
  dev: 'dev',
  development: 'dev',
  prod: 'prod',
  production: 'prod'
});

export function normalizeEnvironment(value) {
  const environment = environmentAliases[String(value || '').trim().toLowerCase()];
  if (!environment) {
    throw new Error('Gebruik omgeving "dev" of "prod".');
  }
  return environment;
}

export function loadDotEnv(fileName = '.env.clasp') {
  const filePath = path.join(repositoryRoot, fileName);
  if (!fs.existsSync(filePath)) return;

  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const separator = line.indexOf('=');
    if (separator < 1) continue;

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) process.env[key] = value;
  }
}

export function selectClaspProject(environmentInput) {
  const environment = normalizeEnvironment(environmentInput);
  const targetPath = path.join(repositoryRoot, '.clasp.json');
  const environmentPath = path.join(repositoryRoot, `.clasp.${environment}.json`);

  if (fs.existsSync(environmentPath)) {
    fs.copyFileSync(environmentPath, targetPath);
  } else if (!fs.existsSync(targetPath)) {
    throw new Error(
      `Geen clasp-configuratie gevonden. Kopieer .clasp.${environment}.example.json ` +
      `naar .clasp.${environment}.json en vul het Script ID in.`
    );
  }

  const config = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
  if (!config.scriptId || String(config.scriptId).startsWith('PLAATS_HIER')) {
    throw new Error(`Het Script ID voor ${environment} ontbreekt.`);
  }
  if (config.rootDir !== 'workspace-auth') {
    throw new Error('rootDir in .clasp.json moet exact "workspace-auth" zijn.');
  }

  return { environment, config, targetPath };
}

/**
 * Start clasp via de geïnstalleerde JavaScript-entrypoint in plaats van via
 * node_modules/.bin/clasp.cmd. Dat voorkomt spawnSync EINVAL op Windows en
 * houdt shell-uitvoering uitgeschakeld.
 */
export function localClaspInvocation() {
  const packagePath = path.join(repositoryRoot, 'node_modules', '@google', 'clasp', 'package.json');
  if (!fs.existsSync(packagePath)) {
    throw new Error('clasp ontbreekt. Voer eerst "npm install" uit.');
  }

  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const binValue = typeof packageJson.bin === 'string'
    ? packageJson.bin
    : packageJson.bin && packageJson.bin.clasp;

  if (!binValue) {
    throw new Error('De clasp-opstartlocatie ontbreekt in @google/clasp/package.json.');
  }

  const entryPoint = path.resolve(path.dirname(packagePath), binValue);
  if (!fs.existsSync(entryPoint)) {
    throw new Error(`De clasp-opstartlocatie bestaat niet: ${entryPoint}`);
  }

  return {
    command: process.execPath,
    argumentsPrefix: [entryPoint]
  };
}

export function deploymentIdFor(environmentInput) {
  const environment = normalizeEnvironment(environmentInput);
  const suffix = environment === 'dev' ? 'DEV' : 'PROD';
  const generic = process.env.APPS_SCRIPT_DEPLOYMENT_ID;
  const specific = process.env[`APPS_SCRIPT_DEPLOYMENT_ID_${suffix}`];
  const deploymentId = String(specific || generic || '').trim();

  if (!deploymentId || deploymentId.startsWith('PLAATS_HIER')) {
    throw new Error(
      `Deployment-ID voor ${environment} ontbreekt. Vul .env.clasp in of zet ` +
      `APPS_SCRIPT_DEPLOYMENT_ID_${suffix}.`
    );
  }
  return deploymentId;
}
