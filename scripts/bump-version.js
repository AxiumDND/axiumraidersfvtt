const fs = require('fs');
const path = require('path');

// Read the module.json file
const modulePath = path.join(__dirname, '..', 'module.json');
const moduleJson = require(modulePath);

// Parse current version
const [major, minor, patch] = moduleJson.version.split('.').map(Number);

// Determine which version number to bump based on command line argument
const bumpType = process.argv[2] || 'patch';

switch (bumpType.toLowerCase()) {
    case 'major':
        moduleJson.version = `${major + 1}.0.0`;
        break;
    case 'minor':
        moduleJson.version = `${major}.${minor + 1}.0`;
        break;
    case 'patch':
    default:
        moduleJson.version = `${major}.${minor}.${patch + 1}`;
        break;
}

// Write the updated module.json file
fs.writeFileSync(modulePath, JSON.stringify(moduleJson, null, 2));

console.log(`Version bumped to ${moduleJson.version}`);

// Create git commands for committing and pushing
const gitCommands = [
    `git add ${modulePath}`,
    `git commit -m "chore: Bump version to ${moduleJson.version}"`,
    'git push origin main'
].join(' && ');

console.log('\nRun the following commands to commit and push:');
console.log(gitCommands); 