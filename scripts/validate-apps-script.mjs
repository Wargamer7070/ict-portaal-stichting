import fs from 'node:fs';
import path from 'node:path';
import { repositoryRoot } from './lib/clasp-config.mjs';

const errors = [];
const requiredFiles = [
  'workspace-auth/appsscript.json',
  'workspace-auth/Code.gs',
  'workspace-auth/Config.gs',
  'workspace-auth/Index.html'
];

for (const relativePath of requiredFiles) {
  if (!fs.existsSync(path.join(repositoryRoot, relativePath))) {
    errors.push(`Ontbrekend bestand: ${relativePath}`);
  }
}

if (!errors.length) {
  const manifestPath = path.join(repositoryRoot, 'workspace-auth/appsscript.json');
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    errors.push(`Ongeldig appsscript.json: ${error.message}`);
  }

  if (manifest) {
    const scopes = new Set(manifest.oauthScopes || []);
    for (const requiredScope of [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/groups'
    ]) {
      if (!scopes.has(requiredScope)) errors.push(`OAuth-scope ontbreekt: ${requiredScope}`);
    }
    if (manifest.runtimeVersion !== 'V8') errors.push('runtimeVersion moet V8 zijn.');
  }

  for (const relativePath of ['workspace-auth/Code.gs', 'workspace-auth/Config.gs']) {
    const source = fs.readFileSync(path.join(repositoryRoot, relativePath), 'utf8');
    try {
      new Function(source);
    } catch (error) {
      errors.push(`JavaScript-syntaxisfout in ${relativePath}: ${error.message}`);
    }
  }

  const code = fs.readFileSync(path.join(repositoryRoot, 'workspace-auth/Code.gs'), 'utf8');
  const config = fs.readFileSync(path.join(repositoryRoot, 'workspace-auth/Config.gs'), 'utf8');
  if (!config.includes('PropertiesService.getScriptProperties')) {
    errors.push('Config.gs moet Script Properties gebruiken.');
  }
  if (/vsz-(leerlingen|medewerkers|docenten|schoolbeheerders)@/i.test(code + config)) {
    errors.push('Groepsadressen horen niet hardcoded in de Apps Script-code te staan.');
  }

  const html = fs.readFileSync(path.join(repositoryRoot, 'workspace-auth/Index.html'), 'utf8');
  for (const marker of ['access.allowed', 'portal.sections', 'config.publicPortalUrl']) {
    if (!html.includes(marker)) errors.push(`Index.html mist templatewaarde: ${marker}`);
  }
}

if (errors.length) {
  console.error('Apps Script-validatie mislukt:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Apps Script-validatie geslaagd.');
