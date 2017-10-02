#!/usr/bin/env node

const http = require('http'),
    httpProxy = require('http-proxy');

const hostPortMapping = {
    'dp-ui.local': 8101,
    'dp-api.local': 8100,
    'masterytrack.local': 8000,
};

function getTarget(req) {
    const targetPort = hostPortMapping[req.headers.host],
        protocol = req.secure ? 'https' : 'http';
    return protocol + '://localhost:' + targetPort;
}

const proxy = httpProxy.createProxyServer(),
    server = http.createServer(function(req, res) {
        proxy.web(req, res, {target: getTarget(req)});
    });

//
// Listen for the `error` event on `proxy`.
proxy.on('error', function (err, req, res) {
  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });

  res.end('Something went wrong. And we are reporting a custom error message.');
});

//
// Listen to the `upgrade` event and proxy the
// WebSocket requests as well.
//
server.on('upgrade', function (req, socket, head) {
  proxy.ws(req, socket, head, {target: getTarget(req)});
});

server.listen(9999);
