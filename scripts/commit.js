const cp = require('child_process');
const fs = require('fs');

const apps = fs.readdirSync('apps').filter(f => fs.statSync('apps/' + f).isDirectory());
for (const app of apps) {
  try {
    cp.execSync(`git add apps/${app}`);
    cp.execSync(`git commit -m "chore(${app}): fix lint errors and remove any types"`);
    console.log(`Committed apps/${app}`);
  } catch (e) {
    console.log(`Nothing to commit or error for apps/${app}`);
  }
}

try {
  cp.execSync('git add packages');
  cp.execSync('git commit -m "chore(packages): fix lint errors and remove any types"');
  console.log('Committed packages');
} catch (e) {}

try {
  cp.execSync('git add package.json scripts');
  cp.execSync('git commit -m "chore: update root files and scripts"');
  console.log('Committed root files');
} catch (e) {}
