const http = require('http');

const PORT = 3001;

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  if (req.url === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok', timestamp: Date.now() }));
  } else if (req.url.startsWith('/restaurants/search')) {
    res.writeHead(200);
    res.end(JSON.stringify({
      results: [
        { id: 'rest_01', name: 'Spice Garden Biryani', rating: 4.8, distance: '1.2km' },
        { id: 'rest_02', name: 'Royal Tandoor House', rating: 4.6, distance: '2.4km' }
      ]
    }));
  } else if (req.url.startsWith('/restaurants')) {
    res.writeHead(200);
    res.end(JSON.stringify({
      restaurants: [
        { id: 'rest_01', name: 'Spice Garden Main', cuisine: 'Mughlai', active: true },
        { id: 'rest_02', name: 'Green Curry Kitchen', cuisine: 'Thai', active: true }
      ]
    }));
  } else if (req.method === 'POST' && req.url === '/orders') {
    res.writeHead(201);
    res.end(JSON.stringify({ orderId: 'ord_' + Math.random().toString(36).substr(2, 9), status: 'CONFIRMED' }));
  } else {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok' }));
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`High-performance target server listening on http://127.0.0.1:${PORT}`);
});
