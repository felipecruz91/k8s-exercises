const http = require('http');

const hostname = '0.0.0.0';
const port = 3000;

console.log("Blocking for 40 seconds...");
freeze(40000);
console.log(`Starting HTTP server on port ${port}`);

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

server.listen(port, () => {
  console.log(`Magic happens on port ${port}`);
});

function freeze(time) {
  const stop = new Date().getTime() + time;
  while(new Date().getTime() < stop);       
}

