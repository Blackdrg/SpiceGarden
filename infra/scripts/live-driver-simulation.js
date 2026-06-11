const http = require('http');
const WebSocket = require('ws');

const API_HOST = process.env.API_HOST || 'localhost';
const API_PORT = process.env.API_PORT || 3001;
const WS_PORT = process.env.WS_PORT || 3001;

// Live driver simulation with real GPS tracking
const drivers = [
  { 
    id: 'driver-001', 
    userId: 'driver-user-001',
    name: 'Raj Kumar', 
    lat: 30.735, 
    lng: 76.78, 
    heading: 45, 
    speed: 35,
    isOnline: true 
  },
  { 
    id: 'driver-002', 
    userId: 'driver-user-002',
    name: 'Amit Singh', 
    lat: 30.745, 
    lng: 76.79, 
    heading: 180, 
    speed: 28,
    isOnline: true 
  },
  { 
    id: 'driver-003', 
    userId: 'driver-user-003',
    name: 'Priya Sharma', 
    lat: 30.725, 
    lng: 76.76, 
    heading: 270, 
    speed: 42,
    isOnline: true 
  },
];

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve) => {
    const options = {
      hostname: API_HOST,
      port: API_PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: body,
        });
      });
    });

    req.on('error', () => resolve({ status: 0 }));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function simulateDriverMovement(driver) {
  console.log(`[Driver ${driver.name}] Starting live simulation`);
  
  // Initialize driver in system
  await makeRequest(`/business/drivers/${driver.id}/location`, 'POST', {
    lat: driver.lat,
    lng: driver.lng,
    heading: driver.heading,
    speed: driver.speed,
  });

  // Simulate movement updates every 5 seconds
  setInterval(async () => {
    // Simulate random movement
    driver.lat += (Math.random() - 0.5) * 0.001;
    driver.lng += (Math.random() - 0.5) * 0.001;
    
    await makeRequest(`/business/drivers/${driver.id}/location`, 'POST', {
      lat: driver.lat,
      lng: driver.lng,
      heading: driver.heading,
      speed: Math.floor(Math.random() * 40) + 20,
    });

    console.log(`[Driver ${driver.name}] Location updated: ${driver.lat.toFixed(4)}, ${driver.lng.toFixed(4)}`);
  }, 5000);
}

async function getLiveMetrics() {
  try {
    const metrics = await makeRequest('/business/metrics', 'GET');
    console.log(`[Live Metrics] GMV: ${JSON.parse(metrics.body)?.gmv || 0}`);
  } catch (error) {
    console.log('[Live Metrics] Failed to fetch');
  }
}

async function runSimulation() {
  console.log('=== SPICEGARDEN BUSINESS ENGINE SIMULATION ===\n');
  
  // Health check
  const health = await makeRequest('/health');
  if (health.status !== 200) {
    console.error('Backend not running - start with: npm run dev -w @spicegarden/backend');
    process.exit(1);
  }
  console.log('Backend healthy, starting driver simulation...\n');

  // Start driver simulations
  for (const driver of drivers) {
    simulateDriverMovement(driver);
  }

  // Report metrics every 10 seconds
  setInterval(getLiveMetrics, 10000);
  
  console.log('Driver simulation active. Press Ctrl+C to stop.\n');
}

runSimulation();