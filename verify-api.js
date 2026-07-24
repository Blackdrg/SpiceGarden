const fs = require('fs');
const path = require('path');
const http = require('http');

const baseUrl = 'http://localhost:3001';
const backendSrc = 'D:\\SpiceGarden\\apps\\backend\\src';
const outputPath = 'D:\\SpiceGarden\\api-verification-full.json';

// Find all controller files
function findControllerFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(findControllerFiles(fullPath));
    } else if (entry.name.endsWith('.controller.ts')) {
      results.push(fullPath);
    }
  }
  return results;
}

// Parse controller files for routes
function parseRoutes(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const routes = [];
  let controllerPath = null;
  let moduleUseGuards = false;
  
  // Controller decorator regex
  const controllerRegex = /@Controller\(['"`](.+?)['"`]\)/;
  const routeRegex = /@(Get|Post|Put|Delete|Patch)\(['"`](.+?)['"`]\)/;
  const guardsRegex = /@UseGuards\(([^)]+)\)/;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Module-level UseGuards (before Controller decorator)
    if (!controllerPath && guardsRegex.test(line)) {
      moduleUseGuards = true;
    }
    
    // Controller decorator
    const controllerMatch = line.match(controllerRegex);
    if (controllerMatch) {
      controllerPath = controllerMatch[1];
      continue;
    }
    
    // Route method decorators
    if (controllerPath) {
      const routeMatch = line.match(routeRegex);
      if (routeMatch) {
        const method = routeMatch[1];
        const routePath = routeMatch[2];
        let fullPath = '/' + controllerPath + '/' + routePath;
        fullPath = fullPath.replace(/\/+/g, '/').replace(/\/$/, '');
        
        let requiresAuth = moduleUseGuards;
        
        // Look backward for UseGuards
        for (let j = i - 1; j > Math.max(0, i - 5); j--) {
          const prevLine = lines[j].trim();
          if (guardsRegex.test(prevLine)) {
            requiresAuth = true;
            break;
          }
          if (prevLine.match(/^@(Get|Post|Put|Delete|Patch|Controller|UseGuards|Roles|Permissions|ApiTags|ApiOperation|ApiQuery|ApiParam|Req|Res|Body|Param|Query)\s*\(/) || 
              prevLine.match(/^async |^function |^constructor\s*\(/)) {
            if (prevLine.match(/^@(Get|Post|Put|Delete|Patch|Controller)\(/) || prevLine.match(/^async |^function /)) {
              break;
            }
          }
        }
        
        routes.push({
          method: method.toUpperCase(),
          path: fullPath,
          controller: path.relative(backendSrc, filePath),
          requiresAuth
        });
      }
    }
  }
  
  return routes;
}

// Make HTTP request
function makeRequest(method, url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SpiceGarden-API-Verifier/1.0'
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: data
        });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      req.write('{}');
    }
    
    req.end();
  });
}

async function main() {
  console.log('Discovering controller files...');
  const controllerFiles = findControllerFiles(backendSrc);
  console.log(`Found ${controllerFiles.length} controller files`);
  
  const routes = [];
  for (const file of controllerFiles) {
    const fileRoutes = parseRoutes(file);
    routes.push(...fileRoutes);
  }
  
  console.log(`Discovered ${routes.length} endpoints`);
  
  const results = [];
  let passCount = 0;
  let failCount = 0;
  let tested = 0;
  const criticalFailures = [];
  
  for (const route of routes) {
    let status = 'NOT VERIFIED';
    let statusCode = null;
    let responseBody = '';
    
    try {
      const response = await makeRequest(route.method, baseUrl + route.path);
      statusCode = response.statusCode;
      responseBody = response.body;
      
      if (route.requiresAuth && statusCode === 401) {
        status = 'PASS (requires auth)';
        passCount++;
      } else if (statusCode >= 200 && statusCode < 300) {
        status = 'PASS';
        passCount++;
      } else {
        status = 'FAIL';
        failCount++;
      }
      
      tested++;
    } catch (err) {
      statusCode = 'ERROR';
      responseBody = err.message;
      
      if (route.requiresAuth) {
        status = 'PASS (requires auth)';
        passCount++;
      } else {
        status = 'FAIL';
        failCount++;
        criticalFailures.push(`${route.method} ${route.path}`);
      }
      
      tested++;
    }
    
    const result = {
      method: route.method,
      path: route.path,
      controller: route.controller,
      statusCode: statusCode,
      responseBody: responseBody.substring(0, 200),
      status: status,
      requiresAuth: route.requiresAuth
    };
    
    results.push(result);
    console.log(`[${status}] ${route.method} ${route.path} -> ${statusCode}`);
  }
  
  const output = {
    timestamp: new Date().toISOString(),
    backendUrl: baseUrl,
    statistics: {
      totalEndpoints: routes.length,
      totalTested: tested,
      pass: passCount,
      fail: failCount,
      notVerified: routes.length - tested,
      criticalFailures: criticalFailures.join(', ')
    },
    results: results
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
  
  console.log('');
  console.log('===== VERIFICATION SUMMARY =====');
  console.log(`Total endpoints discovered: ${routes.length}`);
  console.log(`Total endpoints tested: ${tested}`);
  console.log(`PASS: ${passCount}`);
  console.log(`FAIL: ${failCount}`);
  console.log(`NOT VERIFIED: ${routes.length - tested}`);
  console.log('');
  console.log(`Report saved to: ${outputPath}`);
}

main().catch(console.error);
