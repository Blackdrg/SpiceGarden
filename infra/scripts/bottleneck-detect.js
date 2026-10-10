#!/usr/bin/env node

/**
 * Bottleneck Detection Script for SpiceGarden Load Testing
 * Analyzes metrics and identifies performance bottlenecks
 */

const fs = require('fs');
const path = require('path');

const RESULTS_DIR = path.join(__dirname, '..', 'load-tests', 'results');

function analyzeTestResults() {
    const reportPath = path.join(RESULTS_DIR, 'load-test-report.json');
    
    if (!fs.existsSync(reportPath)) {
        console.log('No test results found. Run tests first with: npm run test:load');
        return;
    }
    
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
    const bottlenecks = [];
    
    console.log('=== BOTTLENECK ANALYSIS REPORT ===\n');
    
    for (const stage of report.stages) {
        console.log('Stage: ' + stage.name);
        
        if (stage.status === 'FAIL') {
            bottlenecks.push({
                stage: stage.name,
                type: 'test_failure',
                severity: 'critical',
                recommendation: 'Investigate test configuration or system limits'
            });
        }
        
        if (stage.stdout) {
            const lines = stage.stdout.split('\n');
            for (const line of lines) {
                if (line.includes('http_req_duration')) {
                    const match = line.match(/p\(95\)\s*=\s*(\d+)/);
                    if (match) {
                        const p95 = parseInt(match[1]);
                        if (p95 > 500) {
                            bottlenecks.push({
                                stage: stage.name,
                                type: 'high_latency',
                                p95: p95,
                                severity: p95 > 1000 ? 'critical' : 'warning',
                                recommendation: p95 > 1000 ? 
                                    'Scale up backend pods or optimize database queries' :
                                    'Check CPU/Memory utilization and consider caching'
                            });
                        }
                    }
                }
                
                if (line.includes('5xx') || line.includes('server errors')) {
                    bottlenecks.push({
                        stage: stage.name,
                        type: 'server_errors',
                        severity: 'critical',
                        recommendation: 'Check backend logs for crashes or timeouts'
                    });
                }
            }
        }
    }
    
    console.log('\n=== DETECTED BOTTLENECKS ===\n');
    
    if (bottlenecks.length === 0) {
        console.log('No bottlenecks detected. System performing within thresholds.\n');
    } else {
        for (const b of bottlenecks) {
            console.log('[' + b.severity.toUpperCase() + '] ' + b.type + ' in ' + b.stage);
            console.log('  Recommendation: ' + b.recommendation);
            console.log();
        }
    }
    
    return bottlenecks;
}

function generateRecommendations(bottlenecks) {
    const recommendations = [];
    
    if (bottlenecks.some(b => b.type === 'high_latency' && b.severity === 'critical')) {
        recommendations.push({
            category: 'Database',
            action: 'Add indexes on frequently queried columns (userId, restaurantId, status, createdAt)',
            priority: 'high'
        });
        recommendations.push({
            category: 'Redis',
            action: 'Ensure caching layer is enabled for hot paths (restaurant list, menu)',
            priority: 'high'
        });
        recommendations.push({
            category: 'Backend',
            action: 'Increase HPA maxReplicas from 20 to 30, add pod anti-affinity rules',
            priority: 'medium'
        });
    }
    
    if (bottlenecks.some(b => b.type === 'server_errors')) {
        recommendations.push({
            category: 'Connection Pool',
            action: 'Increase PostgreSQL poolSize from 20 to 50-100',
            priority: 'high'
        });
        recommendations.push({
            category: 'Rate Limiting',
            action: 'Verify rate limit is disabled in load test mode',
            priority: 'high'
        });
    }
    
    return recommendations;
}

function main() {
    const bottlenecks = analyzeTestResults();
    const recommendations = generateRecommendations(bottlenecks || []);
    
    if (recommendations.length > 0) {
        console.log('=== OPTIMIZATION RECOMMENDATIONS ===\n');
        for (const r of recommendations) {
            console.log('[' + r.priority.toUpperCase() + '] ' + r.category + ': ' + r.action);
        }
    }
}

main();