#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

console.log('Triggering Master Performance & Remediations Generator...');
require('./generate-master-1m-validation-suite.js');
console.log('Reports generated successfully.');
