#!/usr/bin/env node
/**
 * Secret Validation Script for Production Deployment Checklist
 * Validates all required secrets are properly configured
 * Run: node infra/scripts/validate-secrets.js
 */

const fs = require('fs');
const path = require('path');

const SECRETS_DIR = path.join(__dirname, '../../secrets');
const ENV_EXAMPLE = path.join(__dirname, '../../.env.example');

const REQUIRED_SECRETS = [
  'jwt_secret',
  'encryption_secret',
  'db_password',
  'stripe_secret',
  'stripe_webhook_secret',
  'razorpay_key_id',
  'razorpay_key_secret',
  'razorpay_webhook_secret',
  'fcm_server_key',
  'apns_private_key',
  'apns_key_id',
  'apns_team_id',
  'sendgrid_api_key',
  'google_maps_api_key',
  'twilio_account_sid',
  'twilio_auth_token',
];

const PLACEHOLDER_PATTERNS = [
  /CHANGE_ME/i,
  /NOT_CONFIGURED/i,
  /^$/,
  /^\s*$/,
];

const TEST_KEY_PATTERNS = [
  /^sk_test_/,
  /^rzp_test_/,
  /^whsec_test_/,
  /^test_/,
];

function isValidSecretKey(secretName, content) {
  if (secretName.includes('key') || secretName.includes('secret')) {
    if (content.length < 20) {
      for (const testPattern of TEST_KEY_PATTERNS) {
        if (testPattern.test(content) && content.length >= 10) {
          return true;
        }
      }
      return false;
    }
    return true;
  }
  return content.length >= 10;
}

function validateSecretFile(secretName, isStaging = false) {
  const filePath = path.join(SECRETS_DIR, `${secretName}.txt`);
  
  if (!fs.existsSync(filePath)) {
    return { name: secretName, status: 'MISSING', value: null };
  }
  
  const content = fs.readFileSync(filePath, 'utf8').trim();
  
  if (content.length === 0) {
    return { name: secretName, status: 'EMPTY', value: content };
  }
  
  for (const pattern of PLACEHOLDER_PATTERNS) {
    if (pattern.test(content)) {
      return { name: secretName, status: 'PLACEHOLDER', value: content.substring(0, 20) + '...' };
    }
  }
  
  const hasValidFormat = isValidSecretKey(secretName, content);
  if (!hasValidFormat) {
    return { name: secretName, status: 'INSECURE_LENGTH', value: `${content.length} chars` };
  }
  
  return { name: secretName, status: 'VALID', value: `${content.length} chars` };
}

function validateEnvFile() {
  if (!fs.existsSync(ENV_EXAMPLE)) {
    return { status: 'MISSING', path: ENV_EXAMPLE };
  }
  
  const content = fs.readFileSync(ENV_EXAMPLE, 'utf8');
  
  const issues = [];
  
  for (const pattern of PLACEHOLDER_PATTERNS) {
    const matches = content.match(new RegExp(`(.*)${pattern.source}(.*)`, 'gi'));
    if (matches) {
      issues.push(...matches.slice(0, 5));
    }
  }
  
  return {
    status: issues.length > 0 ? 'HAS_PLACEHOLDERS' : 'VALID',
    path: ENV_EXAMPLE,
    issues: issues.slice(0, 10),
  };
}

function runValidation() {
  console.log('=== SPICEGARDEN SECRET VALIDATION ===\n');
  
  // Check secrets directory
  if (!fs.existsSync(SECRETS_DIR)) {
    console.log('[ERROR] Secrets directory not found!');
    console.log('Run: powershell -File infra/scripts/generate-secrets.ps1');
    process.exit(1);
  }
  
  console.log('Checking required secrets:\n');
  
  const results = [];
  let criticalMissing = 0;
  let warnings = 0;
  
  const CRITICAL_SECRETS = ['jwt_secret', 'encryption_secret', 'db_password'];
  const WARNING_SECRETS = ['stripe', 'razorpay', 'fcm', 'apns', 'sendgrid', 'google_maps', 'twilio'];
  
  for (const secret of REQUIRED_SECRETS) {
    const result = validateSecretFile(secret);
    results.push(result);
    
    const symbol = result.status === 'VALID' ? '✅' : '⚠️';
    console.log(`${symbol} ${result.name}: ${result.status} ${result.value ? `(${result.value})` : ''}`);
    
    if (result.status !== 'VALID') {
      const isCritical = CRITICAL_SECRETS.some(s => secret.includes(s));
      if (isCritical) {
        criticalMissing++;
      } else if (WARNING_SECRETS.some(s => secret.includes(s))) {
        warnings++;
      }
    }
  }
  
  console.log('\n--- Environment File Check ---');
  const envResult = validateEnvFile();
  console.log(`Status: ${envResult.status}`);
  if (envResult.issues?.length) {
    console.log('Issues found (template placeholders - expected for .env.example):');
    envResult.issues.forEach(i => console.log(`  - ${i}`));
  }
  
  console.log('\n=== SUMMARY ===');
  console.log(`Valid: ${results.filter(r => r.status === 'VALID').length}/${results.length}`);
  console.log(`Critical missing: ${criticalMissing}`);
  console.log(`Warnings: ${warnings}`);
  
  console.log('\n=== DEPLOYMENT READINESS ===');
  if (criticalMissing > 0) {
    console.log('❌ BLOCKED: Critical secrets missing');
    console.log('Action required: Set values from provider dashboards');
  } else if (warnings > 0) {
    console.log('⚠️  WARNING: Optional secrets not configured (payment providers, notifications)');
    console.log('These are required for production but not blocking local development');
  } else {
    console.log('✅ READY: All required secrets configured');
  }
  
  return {
    totalSecrets: results.length,
    valid: results.filter(r => r.status === 'VALID').length,
    criticalMissing,
    warnings,
    results,
  };
}

if (require.main === module) {
  const result = runValidation();
  process.exit(result.criticalMissing > 0 ? 1 : 0);
}

module.exports = { runValidation, validateSecretFile };