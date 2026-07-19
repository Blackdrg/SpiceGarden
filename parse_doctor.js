const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.startsWith('react-doctor-') && f.endsWith('.json') && !f.includes('report') && !f.includes('admin') && !f.includes('mobile') && !f.includes('web'));
// Let's just do restaurant first
const f = 'react-doctor-restaurant.json';
const data = JSON.parse(fs.readFileSync(f));
console.log('\n---', f, '---');
data.projects[0].diagnostics.forEach(d => console.log(`${d.filePath}:${d.line} - ${d.rule}`));
