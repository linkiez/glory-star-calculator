import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import releaseConfig from '../../.releaserc.json';

it('keeps generated release commits valid even with long breaking-change notes', () => {
  const gitPlugin = releaseConfig.plugins.find(plugin =>
    Array.isArray(plugin) && plugin[0] === '@semantic-release/git'
  );
  if (!Array.isArray(gitPlugin)) throw new Error('Missing release Git plugin');
  const options = gitPlugin[1];
  if (typeof options !== 'object' || !options || !('message' in options) ||
      typeof options.message !== 'string') throw new Error('Missing release commit template');

  const nextRelease = {
    version: '2.0.0',
    notes: [
      '# 2.0.0',
      '',
      '### BREAKING CHANGES',
      '',
      `* BREAKING CHANGE: ${'migration detail '.repeat(20)}`,
      '* Source: https://github.com/linkiez/glory-star-calculator/commit/63fb3c1'
    ].join('\n')
  };
  const message = options.message.replace(/\$\{nextRelease\.(version|notes)\}/g,
    (_, field: 'version' | 'notes') => nextRelease[field]);
  const result = spawnSync(resolve('node_modules/.bin/commitlint'), ['--strict'], {
    cwd: process.cwd(),
    input: message,
    encoding: 'utf8'
  });

  expect(result.error).toBeUndefined();
  expect({ status: result.status, output: result.stdout + result.stderr })
    .toEqual({ status: 0, output: '' });
  expect(message).toContain(nextRelease.version);
  expect(message).toContain('[skip ci]');
});
