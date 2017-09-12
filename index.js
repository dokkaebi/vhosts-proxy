#!/usr/bin/env node

const http = require('http'),
    httpProxy = require('http-proxy');

const args = require('minimist')(process.argv.slice(2));

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
// Listen to the `upgrade` event and proxy the
// WebSocket requests as well.
//
server.on('upgrade', function (req, socket, head) {
  proxy.ws(req, socket, head, {target: getTarget(req)});
});

server.listen(9999);
