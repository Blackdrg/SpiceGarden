#!/usr/bin/env node
/**
 * Legal Compliance Verification Script
 * Validates Legal/IP checklist items
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..', '..');

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  return {
    name: description,
    file: filePath.replace(projectRoot, ''),
    status: exists ? '✅ EXISTS' : '❌ MISSING',
    required: true,
  };
}

function main() {
  console.log('=== SpiceGarden Legal/IP Checklist Verification ===\n');

  const checks = [
    checkFile(path.join(projectRoot, 'LICENSE'), 'MIT License'),
    checkFile(path.join(projectRoot, 'CONTRIBUTING.md'), 'Contributor Guidelines'),
    checkFile(path.join(projectRoot, 'legal/LEGAL_ip-ownership.md'), 'IP Ownership Document'),
    checkFile(path.join(projectRoot, 'legal/LEGAL_contributor-agreements.md'), 'Contributor Agreements'),
    checkFile(path.join(projectRoot, 'LEGAL_trademark-search.md'), 'Trademark Search'),
    checkFile(path.join(projectRoot, 'apps/customer-web/src/pages/legal/privacy.tsx'), 'Privacy Policy (Frontend)'),
    checkFile(path.join(projectRoot, 'apps/customer-web/src/pages/legal/terms.tsx'), 'Terms of Service (Frontend)'),
    checkFile(path.join(projectRoot, 'apps/backend/src/legal/legal.controller.ts'), 'Legal API Endpoints'),
    checkFile(path.join(projectRoot, 'apps/backend/src/legal/legal.module.ts'), 'Legal Module'),
  ];

  console.log('Document Status:');
  checks.forEach((check) => {
    console.log(`  ${check.status} - ${check.name}`);
  });

  const missing = checks.filter((c) => c.status.includes('MISSING'));
  const complete = missing.length === 0;

  console.log('\n=== Summary ===');
  console.log(`Total Checks: ${checks.length}`);
  console.log(`Passed: ${checks.length - missing.length}`);
  console.log(`Failed: ${missing.length}`);
  console.log(`Status: ${complete ? '✅ COMPLETE' : '⚠️ INCOMPLETE'}`);

  if (!complete) {
    console.log('\nMissing items:');
    missing.forEach((m) => console.log(`  - ${m.file}`));
  }

  return complete;
}

main();