// Runs ESLint --fix on any API TypeScript file after Claude edits it.
const input = JSON.parse(process.env.CLAUDE_TOOL_INPUT || '{}');
const fp = input.file_path || '';

const isApiTs = fp.includes('apps/api') && /\.ts$/.test(fp) && !fp.includes('node_modules');

if (isApiTs) {
  try {
    require('child_process').execSync(
      `npx eslint "${fp}" --fix --quiet`,
      { stdio: 'pipe', cwd: process.cwd() }
    );
  } catch (_) {}
}
