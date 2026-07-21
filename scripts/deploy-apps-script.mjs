import { spawnSync } from 'node:child_process';
import {
  deploymentIdFor,
  loadDotEnv,
  localClaspInvocation,
  normalizeEnvironment,
  repositoryRoot,
  selectClaspProject
} from './lib/clasp-config.mjs';

function runClasp(argumentsList, options = {}) {
  const invocation = localClaspInvocation();
  const result = spawnSync(
    invocation.command,
    [...invocation.argumentsPrefix, ...argumentsList],
    {
      cwd: repositoryRoot,
      encoding: options.capture ? 'utf8' : undefined,
      stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
      shell: false
    }
  );

  if (result.error) throw result.error;
  if (result.status !== 0) {
    if (options.capture) {
      if (result.stdout) process.stdout.write(result.stdout);
      if (result.stderr) process.stderr.write(result.stderr);
    }
    throw new Error(`clasp stopte met exitcode ${result.status}.`);
  }

  return options.capture ? `${result.stdout || ''}\n${result.stderr || ''}` : '';
}

function releaseDescription(environment, customDescription) {
  if (customDescription) return customDescription.slice(0, 120);
  const sha = String(process.env.GITHUB_SHA || '').slice(0, 7) || 'lokaal';
  const ref = process.env.GITHUB_REF_NAME || 'werkmap';
  return `ICT-portaal ${environment} ${ref} ${sha}`.slice(0, 120);
}

function deployExistingVersionedWebApp(deploymentId, description) {
  const help = runClasp(['--help'], { capture: true });

  if (help.includes('update-deployment')) {
    runClasp(['update-deployment', deploymentId, '--description', description]);
    return;
  }

  const versionOutput = runClasp(['version', description], { capture: true });
  const matches = [...versionOutput.matchAll(/\b(\d+)\b/g)];
  if (!matches.length) {
    throw new Error(`Kon het nieuwe versienummer niet bepalen uit: ${versionOutput.trim()}`);
  }
  const versionNumber = matches.at(-1)[1];
  runClasp(['redeploy', deploymentId, versionNumber, description]);
}

const [, , environmentInput, ...descriptionParts] = process.argv;

try {
  loadDotEnv();
  const environment = normalizeEnvironment(environmentInput);
  selectClaspProject(environment);
  const deploymentId = deploymentIdFor(environment);
  const description = releaseDescription(environment, descriptionParts.join(' ').trim());

  if (process.env.GITHUB_ACTIONS === 'true') {
    console.log(`::add-mask::${deploymentId}`);
  }

  console.log(`Controleer Apps Script-code voor ${environment}...`);
  const validation = spawnSync(process.execPath, ['scripts/validate-apps-script.mjs'], {
    cwd: repositoryRoot,
    stdio: 'inherit',
    shell: false
  });
  if (validation.status !== 0) process.exit(validation.status ?? 1);

  console.log(`Upload code naar Apps Script ${environment}...`);
  runClasp(['push', '--force']);

  console.log('Maak een nieuwe onveranderlijke versie en werk de bestaande deployment bij...');
  deployExistingVersionedWebApp(deploymentId, description);

  console.log(`Deployment ${environment} afgerond: ${description}`);
} catch (error) {
  console.error(`Deployment mislukt: ${error.message}`);
  process.exit(1);
}
