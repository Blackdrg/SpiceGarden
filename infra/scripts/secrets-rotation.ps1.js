#!/usr/bin/env node
/**
 * Secrets Rotation Script - Proof of Rotation Capability
 * Demonstrates and validates the ability to rotate secrets in the infrastructure
 * Run: node infra/scripts/secrets-rotation.ps1.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SECRETS_DIR = path.join(__dirname, '../../secrets');
const ROTATION_LOG = path.join(__dirname, '../../secrets/rotation-history.json');

function loadRotationHistory() {
  if (fs.existsSync(ROTATION_LOG)) {
    return JSON.parse(fs.readFileSync(ROTATION_LOG, 'utf8'));
  }
  return { rotations: [] };
}

function saveRotationHistory(history) {
  fs.writeFileSync(ROTATION_LOG, JSON.stringify(history, null, 2));
}

function generateSecureSecret(length = 32) {
  const bytes = crypto.randomBytes(length);
  return bytes.toString('base64');
}

function rotateSecrets(secretNames = []) {
  console.log('[SECRETS ROTATION] Starting rotation process...');
  console.log(`[SECRETS ROTATION] Target secrets directory: ${SECRETS_DIR}`);

  if (!fs.existsSync(SECRETS_DIR)) {
    console.log('[SECRETS ROTATION] Creating secrets directory...');
    fs.mkdirSync(SECRETS_DIR, { recursive: true });
  }

  const history = loadRotationHistory();
  const rotationResults = [];

  for (const secretName of secretNames) {
    const oldPath = path.join(SECRETS_DIR, `${secretName}.txt`);
    const timestamp = new Date().toISOString();

    let oldValue = '';
    if (fs.existsSync(oldPath)) {
      oldValue = fs.readFileSync(oldPath, 'utf8').trim();
    }

    const newValue = generateSecureSecret();

    fs.writeFileSync(oldPath, newValue);

    rotationResults.push({
      secretName,
      timestamp,
      rotated: true,
      oldSize: oldValue.length,
      newSize: newValue.length,
      hasOld: oldValue.length > 0,
    });

    history.rotations.push({
      secretName,
      timestamp,
      rotated: true,
    });

    console.log(`[SECRETS ROTATION] Rotated: ${secretName}`);
  }

  saveRotationHistory(history);

  console.log('[SECRETS ROTATION] Rotation complete.');
  console.log('[SECRETS ROTATION] Rotation history saved.');

  return {
    success: true,
    totalRotated: rotationResults.length,
    results: rotationResults,
    proof: {
      timestamp: new Date().toISOString(),
      method: 'Programmatic rotation with cryptographic randomness',
      secretsDirectoryExists: fs.existsSync(SECRETS_DIR),
      rotationHistoryUpdated: fs.existsSync(ROTATION_LOG),
    },
  };
}

function validateRotationCapability() {
  const validation = {
    secretsDirectory: fs.existsSync(SECRETS_DIR),
    rotationScript: fs.existsSync(__filename),
    cryptoModule: typeof crypto.randomBytes === 'function',
    writeAccess: false,
  };

  try {
    const testFile = path.join(SECRETS_DIR, '.write-test');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    validation.writeAccess = true;
  } catch (e) {
    validation.writeAccess = false;
  }

  return validation;
}

function main() {
  const command = process.argv[2];

  if (command === 'validate') {
    const validation = validateRotationCapability();
    console.log('[SECRETS ROTATION] Validation:', JSON.stringify(validation, null, 2));
    return validation;
  }

  if (command === 'rotate') {
    const secrets = process.argv.slice(3);
    if (secrets.length === 0) {
      console.log('[SECRETS ROTATION] Usage: node secrets-rotation.ps1.js rotate <secret1> <secret2> ...');
      console.log('[SECRETS ROTATION] Default secrets: jwt_secret, encryption, db_password');
      const defaultSecrets = ['jwt_secret', 'encryption', 'db_password'];
      return rotateSecrets(defaultSecrets);
    }
    return rotateSecrets(secrets);
  }

  console.log('[SECRETS ROTATION] Available commands:');
  console.log('  validate - Check rotation capability');
  console.log('  rotate <secrets...> - Rotate specified secrets');
  console.log('[SECRETS ROTATION] Default: rotate jwt_secret, encryption, db_password');

  return rotateSecrets(['jwt_secret', 'encryption', 'db_password']);
}

if (require.main === module) {
  const result = main();
  console.log(JSON.stringify(result, null, 2));
}

module.exports = { rotateSecrets, validateRotationCapability };