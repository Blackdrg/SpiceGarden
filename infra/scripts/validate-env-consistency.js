#!/usr/bin/env node
/**
 * Environment Configuration Validation Script
 * Validates API URL consistency, environment separation, and Stripe/Razorpay key isolation
 * Run: node infra/scripts/validate-env-consistency.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '../../');
const ENV_EXAMPLE = path.join(ROOT_DIR, '.env.example');
const ENV_STAGING_EXAMPLE = path.join(ROOT_DIR, '.env.staging.example');
const ENV_PROD_EXAMPLE = path.join(ROOT_DIR, '.env.production.example');
const ENV = path.join(ROOT_DIR, '.env');

const ENV_FILES = {
  development: ENV,
  staging: ENV_STAGING_EXAMPLE,
  production: ENV_PROD_EXAMPLE
};

const FRONTEND_ENV_FILES = [
  path.join(ROOT_DIR, 'apps/customer-web/.env.development.local'),
  path.join(ROOT_DIR, 'apps/customer-web/.env.staging.local'),
  path.join(ROOT_DIR, 'apps/customer-web/.env.production.local'),
  path.join(ROOT_DIR, 'apps/restaurant-dashboard/.env.development.local'),
  path.join(ROOT_DIR, 'apps/restaurant-dashboard/.env.staging.local'),
  path.join(ROOT_DIR, 'apps/restaurant-dashboard/.env.production.local'),
  path.join(ROOT_DIR, 'apps/super-admin/.env.development.local'),
  path.join(ROOT_DIR, 'apps/super-admin/.env.staging.local'),
  path.join(ROOT_DIR, 'apps/super-admin/.env.production.local'),
];

const API_URL_CONFIGS = {
  development: 'http://localhost:3001',
  staging: 'https://staging-api.spicegarden.com',
  production: 'https://api.spicegarden.com'
};

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && !key.startsWith('#')) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  });
  return env;
}

function validateApiUrls() {
  console.log('=== API URL CONSISTENCY CHECK ===\n');
  
  const issues = [];
  
  // Check backend callback URLs match frontend API URLs
  for (const [envType, filePath] of Object.entries(ENV_FILES)) {
    if (!fs.existsSync(filePath)) continue;
    
    const env = parseEnvFile(filePath);
    if (!env) continue;
    
    const expectedUrl = API_URL_CONFIGS[envType];
    
    // Check OAuth callback URLs
    const googleCallback = env.GOOGLE_CALLBACK_URL || '';
    const facebookCallback = env.FACEBOOK_CALLBACK_URL || '';
    
    const apiUrlInCallbacks = googleCallback.replace('/auth/google/callback', '') || 
                              facebookCallback.replace('/auth/facebook/callback', '');
    
    if (apiUrlInCallbacks && apiUrlInCallbacks !== expectedUrl && apiUrlInCallbacks !== expectedUrl + '/') {
      if (envType === 'production') {
        issues.push(`[PRODUCTION] API URL mismatch in ${path.basename(filePath)}: expected ${expectedUrl}, found ${apiUrlInCallbacks}`);
      } else {
        console.log(`⚠️  ${envType}: API URL in callbacks: ${apiUrlInCallbacks}`);
      }
    }
  }
  
  return issues;
}

function validateStripeRazorpayKeys() {
  console.log('\n=== STRIPE/RAZORPAY KEY ISOLATION CHECK ===\n');
  
  const issues = [];
  
  // Check .env for test keys
  const devEnv = parseEnvFile(ENV);
  if (devEnv) {
    const stripeKey = devEnv.STRIPE_SECRET_KEY || '';
    const razorpayKeyId = devEnv.RAZORPAY_KEY_ID || '';
    
    if (stripeKey && !stripeKey.startsWith('sk_test')) {
      issues.push('[DEVELOPMENT] STRIPE_SECRET_KEY should use test keys (sk_test_...)');
    }
    
    if (razorpayKeyId && !razorpayKeyId.startsWith('rzp_test')) {
      issues.push('[DEVELOPMENT] RAZORPAY_KEY_ID should use test keys (rzp_test_...)');
    }
    
    console.log(`Development keys: ${stripeKey ? 'sk_test_* ✓' : 'missing ⚠️'}, ${razorpayKeyId ? 'rzp_test_* ✓' : 'missing ⚠️'}`);
  }
  
  // Check production for file references
  if (fs.existsSync(ENV_PROD_EXAMPLE)) {
    const prodEnv = parseEnvFile(ENV_PROD_EXAMPLE);
    if (prodEnv) {
      const stripeRef = prodEnv.STRIPE_SECRET_KEY_FILE || '';
      if (stripeRef) {
        console.log(`Production Stripe: Uses file reference ✓ (${stripeRef})`);
      } else {
        issues.push('[PRODUCTION] STRIPE_SECRET_KEY_FILE not configured');
      }
    }
  }
  
  // Check staging file exists
  if (!fs.existsSync(ENV_STAGING_EXAMPLE)) {
    issues.push('[STAGING] .env.staging.example not found');
  } else {
    const stagingEnv = parseEnvFile(ENV_STAGING_EXAMPLE);
    if (stagingEnv) {
      const stripeRef = stagingEnv.STRIPE_SECRET_KEY_FILE || '';
      if (stripeRef && stripeRef.includes('staging')) {
        console.log(`Staging Stripe: Uses staging file reference ✓ (${stripeRef})`);
      } else {
        issues.push('[STAGING] STRIPE_SECRET_KEY_FILE should reference staging secrets');
      }
    }
  }
  
  return issues;
}

function validateFrontendEnv() {
  console.log('\n=== FRONTEND ENVIRONMENT FILES CHECK ===\n');
  
  const issues = [];
  
  // Group files by environment
  const frontendEnvs = {
    development: [],
    staging: [],
    production: []
  };
  
  FRONTEND_ENV_FILES.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
      issues.push(`MISSING: ${filePath}`);
      return;
    }
    
    const env = parseEnvFile(filePath);
    if (!env) return;
    
    const apiUrl = env.NEXT_PUBLIC_API_URL;
    const socketUrl = env.NEXT_PUBLIC_SOCKET_URL;
    
    if (filePath.includes('.env.development.local')) {
      frontendEnvs.development.push({ file: path.basename(path.dirname(filePath)), apiUrl, socketUrl });
    } else if (filePath.includes('.env.staging.local')) {
      frontendEnvs.staging.push({ file: path.basename(path.dirname(filePath)), apiUrl, socketUrl });
    } else if (filePath.includes('.env.production.local')) {
      frontendEnvs.production.push({ file: path.basename(path.dirname(filePath)), apiUrl, socketUrl });
    }
  });
  
  // Validate each environment
  for (const [envType, files] of Object.entries(frontendEnvs)) {
    const expectedUrl = API_URL_CONFIGS[envType];
    console.log(`\n${envType.toUpperCase()} Frontend Envs:`);
    
    files.forEach(({ file, apiUrl, socketUrl }) => {
      if (apiUrl !== expectedUrl) {
        issues.push(`[${envType.toUpperCase()}] ${file}: NEXT_PUBLIC_API_URL should be ${expectedUrl}, found ${apiUrl}`);
      }
      if (socketUrl !== expectedUrl) {
        issues.push(`[${envType.toUpperCase()}] ${file}: NEXT_PUBLIC_SOCKET_URL should be ${expectedUrl}, found ${socketUrl}`);
      }
      console.log(`  ${apiUrl === expectedUrl ? '✅' : '❌'} ${file}: api=${apiUrl}, socket=${socketUrl}`);
    });
  }
  
  return issues;
}

function validateSecretsInjection() {
  console.log('\n=== SECRETS INJECTION CHECK ===\n');
  
  const issues = [];
  const secretsDir = path.join(ROOT_DIR, 'secrets');
  
  // Check if secrets directory exists
  if (!fs.existsSync(secretsDir)) {
    console.log('⚠️  Secrets directory not found - run: powershell -File infra/scripts/generate-secrets.ps1');
    return issues;
  }
  
  const requiredSecrets = [
    'jwt_secret.txt',
    'encryption_secret.txt',
    'db_password.txt'
  ];
  
  requiredSecrets.forEach(secret => {
    const secretPath = path.join(secretsDir, secret);
    if (!fs.existsSync(secretPath)) {
      issues.push(`[SECRETS] Missing ${secret}`);
    } else {
      const content = fs.readFileSync(secretPath, 'utf8').trim();
      if (!content || content.includes('CHANGE_ME')) {
        issues.push(`[SECRETS] Invalid ${secret}`);
      } else {
        console.log(`✅ ${secret} exists and configured`);
      }
    }
  });
  
  return issues;
}

function runFullValidation() {
  console.log('========================================');
  console.log('SPICEGARDEN ENVIRONMENT VALIDATION');
  console.log('========================================\n');
  
  const allIssues = [
    ...validateApiUrls(),
    ...validateStripeRazorpayKeys(),
    ...validateFrontendEnv(),
    ...validateSecretsInjection()
  ];
  
  console.log('\n========================================');
  console.log('SUMMARY');
  console.log('========================================');
  
  if (allIssues.length === 0) {
    console.log('✅ All environment configurations are valid');
    return { status: 'VALID', issues: [] };
  }
  
  console.log(`\n❌ Found ${allIssues.length} issues:\n`);
  allIssues.forEach(issue => console.log(`  - ${issue}`));
  
  return { status: 'ISSUES_FOUND', issues: allIssues };
}

if (require.main === module) {
  const result = runFullValidation();
  process.exit(result.status === 'VALID' ? 0 : 1);
}

module.exports = { runFullValidation, validateApiUrls, validateStripeRazorpayKeys, validateFrontendEnv };