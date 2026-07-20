import { spawnSync } from 'node:child_process';
import {
  localClaspInvocation,
  normalizeEnvironment,
  repositoryRoot,
  selectClaspProject
} from './lib/clasp-config.mjs';

const [, , environmentInput, ...claspArguments] = process.argv;

try {
  const environment = normalizeEnvironment(environmentInput);
  if (!claspArguments.length) {
    throw new Error('Geef een clasp-opdracht mee.');
  }

  selectClaspProject(environment);
  const invocation = localClaspInvocation();
  const result = spawnSync(
    invocation.command,
    [...invocation.argumentsPrefix, ...claspArguments],
    {
      cwd: repositoryRoot,
      stdio: 'inherit',
      shell: false
    }
  );

  if (result.error) throw result.error;
  process.exit(result.status ?? 1);
} catch (error) {
  console.error(`Fout: ${error.message}`);
  process.exit(1);
}
