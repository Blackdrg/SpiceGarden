const fs = require('fs');
const path = require('path');

const RESULTS_DIR = path.join(__dirname, 'results');
const REPORT_DIR = path.join(__dirname, '..', 'reports');

if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });

function parseK6Json(filePath) {
    const lines = fs.readFileSync(filePath, 'utf8').split('\n').filter(l => l.trim());
    const metrics = {};
    let startTime = null;
    let endTime = null;

    for (const line of lines) {
        try {
            const obj = JSON.parse(line);
            if (obj.type === 'Point' && obj.data) {
                const name = obj.metric;
                const time = obj.data.time;
                if (!startTime || time < startTime) startTime = time;
                if (!endTime || time > endTime) endTime = time;
                if (!metrics[name]) metrics[name] = [];
                metrics[name].push({
                    time,
                    value: obj.data.value,
                    tags: obj.data.tags || {},
                });
            }
        } catch (e) {
            // skip invalid lines
        }
    }

    const summary = {};
    for (const [name, points] of Object.entries(metrics)) {
        const values = points.map(p => p.value).filter(v => typeof v === 'number');
        if (values.length === 0) continue;
        values.sort((a, b) => a - b);
        const sum = values.reduce((a, b) => a + b, 0);
        summary[name] = {
            count: values.length,
            min: values[0],
            max: values[values.length - 1],
            sum,
            avg: sum / values.length,
            p50: values[Math.floor(values.length * 0.5)],
            p90: values[Math.floor(values.length * 0.9)],
            p95: values[Math.floor(values.length * 0.95)],
            p99: values[Math.floor(values.length * 0.99)],
        };
    }

    return { summary, startTime, endTime, totalPoints: lines.length };
}

function extractCheckMetrics(filePath) {
    const lines = fs.readFileSync(filePath, 'utf8').split('\n').filter(l => l.trim());
    const checks = {};
    for (const line of lines) {
        try {
            const obj = JSON.parse(line);
            if (obj.type === 'Metric' && obj.data && obj.data.name && obj.data.contains === 'checks') {
                checks[obj.data.name] = {
                    type: obj.data.type,
                    thresholds: obj.data.thresholds,
                };
            }
        } catch (e) {}
    }
    return checks;
}

function generateMarkdown(stageName, parseResult, checkMetrics) {
    const { summary, startTime, endTime } = parseResult;
    const duration = endTime && startTime ? ((new Date(endTime) - new Date(startTime)) / 1000).toFixed(1) : 'N/A';

    let md = `# ${stageName} - Load Test Report\n\n`;
    md += `## Test Overview\n\n`;
    md += `- **Stage:** ${stageName}\n`;
    md += `- **Start Time:** ${startTime || 'N/A'}\n`;
    md += `- **End Time:** ${endTime || 'N/A'}\n`;
    md += `- **Duration:** ${duration}s\n`;
    md += `- **Total Metric Points:** ${parseResult.totalPoints.toLocaleString()}\n\n`;

    md += `## HTTP Metrics\n\n`;
    md += `| Metric | Count | Avg | Min | P50 | P90 | P95 | P99 | Max |\n`;
    md += `|--------|-------|-----|-----|-----|-----|-----|-----|-----|\n`;

    const httpMetrics = ['http_req_duration', 'http_req_waiting', 'http_req_connecting', 'http_req_receiving', 'http_req_sending'];
    for (const m of httpMetrics) {
        if (summary[m]) {
            const s = summary[m];
            md += `| ${m} | ${s.count} | ${s.avg.toFixed(1)}ms | ${s.min.toFixed(1)}ms | ${s.p50.toFixed(1)}ms | ${s.p90.toFixed(1)}ms | ${s.p95.toFixed(1)}ms | ${s.p99.toFixed(1)}ms | ${s.max.toFixed(1)}ms |\n`;
        }
    }

    md += `\n## Custom Metrics\n\n`;
    md += `| Metric | Count | Avg | Min | P90 | P95 | P99 | Max |\n`;
    md += `|--------|-------|-----|-----|-----|-----|-----|-----|\n`;
    const customMetrics = ['http_req_success_rate', 'auth_success_rate', 'order_success_rate', 'payment_success_rate', 'active_vus', 'errors_total', 'orders_placed_total', 'payments_processed_total'];
    for (const m of customMetrics) {
        if (summary[m]) {
            const s = summary[m];
            const unit = m.includes('rate') ? '%' : (m.includes('_total') ? 'count' : '');
            const avgDisplay = m.includes('rate') ? (s.avg * 100).toFixed(2) + '%' : s.avg.toFixed(2) + unit;
            md += `| ${m} | ${s.count} | ${avgDisplay} | ${s.min} | ${s.p90} | ${s.p95} | ${s.p99} | ${s.max} |\n`;
        }
    }

    md += `\n## Check Metrics\n\n`;
    for (const [name, info] of Object.entries(checkMetrics)) {
        md += `- **${name}** (${info.type}): thresholds = ${JSON.stringify(info.thresholds)}\n`;
    }

    md += `\n## Network\n\n`;
    const netMetrics = ['data_received', 'data_sent', 'http_reqs', 'iterations', 'vus', 'vus_max'];
    for (const m of netMetrics) {
        if (summary[m]) {
            const s = summary[m];
            md += `- **${m}:** count=${s.count}, sum=${s.sum.toFixed(0)}, avg=${s.avg.toFixed(2)}\n`;
        }
    }

    return md;
}

function generateCsv(stageName, parseResult) {
    const { summary } = parseResult;
    let csv = 'metric,count,avg,min,max,p50,p90,p95,p99\n';
    for (const [name, s] of Object.entries(summary)) {
        csv += `${name},${s.count},${s.avg.toFixed(4)},${s.min},${s.max},${s.p50.toFixed(4)},${s.p90.toFixed(4)},${s.p95.toFixed(4)},${s.p99.toFixed(4)}\n`;
    }
    return csv;
}

function generateHtml(stageName, parseResult, checkMetrics) {
    const { summary, startTime, endTime } = parseResult;
    const duration = endTime && startTime ? ((new Date(endTime) - new Date(startTime)) / 1000).toFixed(1) : 'N/A';

    let html = `<!DOCTYPE html><html><head><title>${stageName} Load Test Report</title><style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #4CAF50; color: white; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        .metric { font-weight: bold; color: #333; }
        .section { margin-bottom: 30px; }
        .pass { color: green; }
        .fail { color: red; }
    </style></head><body>`;
    html += `<h1>${stageName} - Load Test Report</h1>`;
    html += `<div class="section"><h2>Test Overview</h2>`;
    html += `<p><strong>Stage:</strong> ${stageName}</p>`;
    html += `<p><strong>Duration:</strong> ${duration}s</p>`;
    html += `<p><strong>Start Time:</strong> ${startTime || 'N/A'}</p>`;
    html += `<p><strong>End Time:</strong> ${endTime || 'N/A'}</p>`;
    html += `</div>`;

    html += `<div class="section"><h2>HTTP Request Duration</h2><table><tr><th>Metric</th><th>Count</th><th>Avg</th><th>Min</th><th>P50</th><th>P90</th><th>P95</th><th>P99</th><th>Max</th></tr>`;
    for (const m of ['http_req_duration', 'http_req_waiting', 'http_req_connecting']) {
        if (summary[m]) {
            const s = summary[m];
            html += `<tr><td>${m}</td><td>${s.count}</td><td>${s.avg.toFixed(1)}ms</td><td>${s.min.toFixed(1)}ms</td><td>${s.p50.toFixed(1)}ms</td><td>${s.p90.toFixed(1)}ms</td><td>${s.p95.toFixed(1)}ms</td><td>${s.p99.toFixed(1)}ms</td><td>${s.max.toFixed(1)}ms</td></tr>`;
        }
    }
    html += `</table></div>`;

    html += `<div class="section"><h2>Custom Metrics</h2><table><tr><th>Metric</th><th>Count</th><th>Avg</th><th>Min</th><th>P90</th><th>P95</th><th>P99</th><th>Max</th></tr>`;
    for (const m of ['http_req_success_rate', 'auth_success_rate', 'order_success_rate', 'payment_success_rate', 'errors_total']) {
        if (summary[m]) {
            const s = summary[m];
            const avgDisplay = m.includes('rate') ? (s.avg * 100).toFixed(2) + '%' : s.avg.toFixed(2);
            html += `<tr><td>${m}</td><td>${s.count}</td><td>${avgDisplay}</td><td>${s.min}</td><td>${s.p90}</td><td>${s.p95}</td><td>${s.p99}</td><td>${s.max}</td></tr>`;
        }
    }
    html += `</table></div>`;

    html += `<div class="section"><h2>Check Metrics</h2><ul>`;
    for (const [name, info] of Object.entries(checkMetrics)) {
        html += `<li><strong>${name}</strong> (${info.type}): thresholds = ${JSON.stringify(info.thresholds)}</li>`;
    }
    html += `</ul></div>`;

    html += `</body></html>`;
    return html;
}

// Main execution
const args = process.argv.slice(2);
const stageName = args[0] || 'unknown';
const jsonFile = args[1] || path.join(RESULTS_DIR, 'stage-1-100vu.json');

if (!fs.existsSync(jsonFile)) {
    console.error('JSON file not found:', jsonFile);
    process.exit(1);
}

const parseResult = parseK6Json(jsonFile);
const checkMetrics = extractCheckMetrics(jsonFile);
const md = generateMarkdown(stageName, parseResult, checkMetrics);
const csv = generateCsv(stageName, parseResult);
const html = generateHtml(stageName, parseResult, checkMetrics);

fs.writeFileSync(path.join(REPORT_DIR, `${stageName}-report.md`), md);
fs.writeFileSync(path.join(REPORT_DIR, `${stageName}-metrics.csv`), csv);
fs.writeFileSync(path.join(REPORT_DIR, `${stageName}-report.html`), html);

console.log(`Reports generated for ${stageName}:`);
console.log(`  - ${path.join(REPORT_DIR, stageName + '-report.md')}`);
console.log(`  - ${path.join(REPORT_DIR, stageName + '-metrics.csv')}`);
console.log(`  - ${path.join(REPORT_DIR, stageName + '-report.html')}`);
