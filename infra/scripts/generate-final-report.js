#!/usr/bin/env node

/**
 * Final Report Generator for SpiceGarden Load Testing
 * Consolidates all metrics and generates production readiness assessment
 */

const fs = require('fs');
const path = require('path');

const RESULTS_DIR = path.join(__dirname, '..', 'load-tests', 'results');

function generateReport() {
    const reportPath = path.join(RESULTS_DIR, 'load-test-report.json');
    
    if (!fs.existsSync(reportPath)) {
        console.log('No test results found.');
        return;
    }
    
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
    
    const finalReport = {
        executiveSummary: generateExecutiveSummary(report),
        stageResults: report.stages,
        specialTests: report.specialTests,
        maxConcurrentUsers: getMaxPassedUsers(report),
        infrastructureRequirements: calculateInfrastructureRequirements(report),
        kubernetesScaling: getKubernetesRecommendations(report),
        goNoGo: getGoNoGoRecommendation(report),
        generatedAt: new Date().toISOString(),
    };
    
    const outputPath = path.join(RESULTS_DIR, 'final-report.json');
    fs.writeFileSync(outputPath, JSON.stringify(finalReport, null, 2));
    
    console.log('\n========================================');
    console.log('SPICEGARDEN PRODUCTION READINESS REPORT');
    console.log('========================================\n');
    
    console.log('Executive Summary:');
    console.log('  Max Stable Concurrent Users: ' + finalReport.maxConcurrentUsers);
    console.log('  Go/No-Go: ' + finalReport.goNoGo.decision);
    console.log('  Confidence: ' + finalReport.goNoGo.confidence);
    console.log('\nStage Results:');
    
    for (const stage of report.stages) {
        const status = stage.status === 'PASS' ? '✓ PASS' : '✗ FAIL';
        console.log('  ' + status + ' - ' + stage.name);
    }
    
    console.log('\nInfrastructure Requirements (estimated):');
    console.log('  CPU: ' + finalReport.infrastructureRequirements.cpu + ' cores');
    console.log('  Memory: ' + finalReport.infrastructureRequirements.memory + 'GB');
    console.log('  Database Connections: ' + finalReport.infrastructureRequirements.dbConnections);
    console.log('  Redis Memory: ' + finalReport.infrastructureRequirements.redisMemory + 'GB');
    
    console.log('\nReport saved to: ' + outputPath);
}

function generateExecutiveSummary(report) {
    const passed = report.stages.filter(s => s.status === 'PASS').length;
    const total = report.stages.length;
    
    return {
        stagesPassed: passed + '/' + total,
        allTestsCompleted: report.endTime !== null,
        overallStatus: passed === total ? 'SUCCESS' : 'PARTIAL',
    };
}

function getMaxPassedUsers(report) {
    for (let i = report.stages.length - 1; i >= 0; i--) {
        if (report.stages[i].status === 'PASS') {
            const stage = getStageInfo(i);
            return stage.vus;
        }
    }
    return 0;
}

function getStageInfo(index) {
    const vus = [1000, 5000, 10000, 20000, 50000, 100000, 500000, 1000000];
    return { vus: vus[index] || 0 };
}

function calculateInfrastructureRequirements(report) {
    const maxUsers = getMaxPassedUsers(report);
    
    return {
        cpu: Math.max(8, Math.ceil(maxUsers / 50000)),
        memory: Math.max(16, Math.ceil(maxUsers / 20000)),
        dbConnections: 50 + Math.floor(maxUsers / 10000),
        redisMemory: Math.max(2, Math.ceil(maxUsers / 100000)),
    };
}

function getKubernetesRecommendations(report) {
    const maxUsers = getMaxPassedUsers(report);
    
    return {
        hpaMinReplicas: 3,
        hpaMaxReplicas: Math.max(20, Math.ceil(maxUsers / 20000)),
        cpuThreshold: 70,
        memoryThreshold: 80,
        redisNodes: Math.max(6, Math.ceil(maxUsers / 50000)),
    };
}

function getGoNoGoRecommendation(report) {
    const passed = report.stages.filter(s => s.status === 'PASS').length;
    const total = report.stages.length;
    
    if (passed === total) {
        return { decision: 'GO', confidence: 'HIGH' };
    } else if (passed >= total * 0.5) {
        return { decision: 'GO WITH CAUTION', confidence: 'MEDIUM' };
    } else {
        return { decision: 'NO-GO', confidence: 'LOW' };
    }
}

generateReport();