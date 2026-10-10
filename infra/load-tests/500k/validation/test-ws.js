import ws from 'k6/ws';
import { check } from 'k6';

export const options = {
  vus: 1,
  iterations: 1,
};

export default function () {
  console.log('Testing ws.connect...');
  const url = 'ws://localhost:3001/socket.io/?EIO=4&transport=websocket';
  const res = ws.connect(url, {
    headers: {
      'Origin': 'http://localhost:3001',
      'User-Agent': 'k6-ws/1.0',
    },
  }, function (socket) {
    console.log('Inside ws callback');
    socket.on('open', function () {
      console.log('Socket opened!');
      socket.close();
    });
    socket.on('error', function (e) {
      console.log('Socket error:', e);
      socket.close();
    });
    socket.on('close', function () {
      console.log('Socket closed!');
    });
  });

  console.log('ws.connect returned:', res ? res.status : 'null');
}
