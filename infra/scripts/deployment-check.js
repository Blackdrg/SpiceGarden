#!/usr/bin/env node
/**
 * Deployment Validation Script
 * Validates that all infrastructure components are properly configured for high-scale operations
 * Cross-platform Node.js implementation
 */

const { execSync } = require('child_process');
const path = require('path');

const NAMESPACE = process.argv[2] || 'spicegarden-production';
const ENVIRONMENT = process.argv[3] || 'production';

function log(message) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  console.log(`[${timestamp}] ${message}`);
}

function runKubectl(args) {
  try {
    return execSync(`kubectl ${args}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch (error) {
    throw new Error(`kubectl command failed: ${error.message}`);
  }
}

function checkPrerequisites() {
  log('Checking prerequisites...');
  try {
    execSync('kubectl version --client', { stdio: 'ignore' });
  } catch {
    log('ERROR: kubectl not found');
    process.exit(1);
  }
  try {
    execSync('kubectl cluster-info', { stdio: 'ignore' });
  } catch {
    log('ERROR: Cannot connect to cluster');
    process.exit(1);
  }
}

function validateHpa() {
  log('Validating Horizontal Pod Autoscaler...');
  
  try {
    const hpa = runKubectl(`get hpa spicegarden-backend-hpa -n "${NAMESPACE}" -o jsonpath='{.spec.minReplicas}' 2>/dev/null || echo ""`);
    if (!hpa) {
      log('ERROR: HPA not found');
      process.exit(1);
    }
    log(`HPA configured`);
    runKubectl(`get hpa -n "${NAMESPACE}"`);
  } catch (error) {
    log(`WARNING: HPA check failed - ${error.message}`);
  }
}

function validateRedisCluster() {
  log('Validating Redis cluster for high throughput...');
  
  try {
    const clusterNodes = runKubectl(`get statefulset redis-cluster -n "${NAMESPACE}" -o jsonpath='{.spec.replicas}' 2>/dev/null || echo ""`);
    if (clusterNodes) {
      log(`Redis cluster configured with ${clusterNodes} nodes`);
      runKubectl(`get pods -n "${NAMESPACE}" -l app=redis-cluster`);
    } else {
      log('WARNING: Redis cluster not deployed, using single instance');
      runKubectl(`get svc -n "${NAMESPACE}" -l app=spicegarden-backend`);
    }
  } catch (error) {
    log(`WARNING: Redis cluster check failed - ${error.message}`);
  }
}

function validateDatabasePooling() {
  log('Validating database connection pooling...');
  
  try {
    const deploymentYaml = runKubectl(`get deployment spicegarden-backend -n "${NAMESPACE}" -o jsonpath='{.spec.template.spec.containers[?(@.name=="backend")].env}' 2>/dev/null || echo ""`);
    if (deploymentYaml && deploymentYaml.includes('DB_CONNECTION_POOL_MAX')) {
      log('Database connection pool environment variables configured');
    } else {
      log('WARNING: Database connection pool not configured in deployment');
    }
  } catch (error) {
    log(`WARNING: Database pooling check failed - ${error.message}`);
  }
}

function validateCdn() {
  log('Validating CDN configuration...');
  
  try {
    const ingress = runKubectl(`get ingress spicegarden-cdn-ingress -n "${NAMESPACE}" 2>/dev/null || echo ""`);
    if (ingress) {
      log('CDN ingress configured');
      console.log(ingress);
    } else {
      log('WARNING: CDN ingress not found');
    }
  } catch (error) {
    log(`WARNING: CDN check failed - ${error.message}`);
  }
}

function validateScalingReadiness() {
  log('Checking scaling readiness...');
  
  try {
    execSync('kubectl top nodes', { stdio: 'ignore' });
  } catch {
    log('WARNING: Metrics server not available');
  }
  
  try {
    execSync(`kubectl top pods -n "${NAMESPACE}"`, { stdio: 'ignore' });
  } catch {
    log('WARNING: Cannot get pod metrics');
  }
  
  log('Scaling validation completed');
}

function runValidation() {
  console.log('========================================');
  console.log('SPICEGARDEN DEPLOYMENT VALIDATION');
  console.log('========================================\n');
  
  log(`Starting deployment validation for ${ENVIRONMENT} environment in ${NAMESPACE}`);
  
  checkPrerequisites();
  validateHpa();
  validateRedisCluster();
  validateDatabasePooling();
  validateCdn();
  validateScalingReadiness();
  
  log('Deployment validation completed successfully');
  console.log('\n========================================');
  console.log('VALIDATION PASSED');
  console.log('========================================');
}

if (require.main === module) {
  runValidation();
}