import http from 'http';

const data = JSON.stringify({
  longUrl: 'https://google.com',
  deviceId: 'cli-test-device'
});

const req = http.request({
  hostname: 'localhost',
  port: 3005,
  path: '/api/shorten',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk.toString());
  res.on('end', () => console.log('Response:', res.statusCode, body));
});

req.on('error', (e) => console.error(e));
req.write(data);
req.end();

