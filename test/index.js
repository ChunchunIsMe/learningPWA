const http = require('http');
const fs = require('fs');
http.createServer((req, res) => {
  console.log(req.url);
  const url = req.url === '/' ? '/index.html' : req.url;
  if (url === '/sw.js') {
    res.writeHead(200, {
      'Content-Type': 'application/javascript; charset="utf-8"'
    })
  }
  fs.readFile(`.${url}`, (err, data) => {
    if (err) {
      res.end(`error: ${err}`)
    } else {
      res.end(data);
    }
  })
}).listen(8080)