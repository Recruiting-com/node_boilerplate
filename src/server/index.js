/* global __dirname */
const Hapi = require('hapi');
/*eslint-disable */
const Boom = require('boom');
/*eslint-enable */
const http = require('http');
const winston = require('winston');
const union = require('lodash').union;
const appRoot = require('app-root-path');
const conf = require('./../lib/conf');

const index_routes = require('./routes/index').routes;

var server = new Hapi.Server({connections: {routes: {cors: true}}});
var src_path = process.env.NODE_ENV === 'production' ? 'dist' : 'src';

if (!conf.get('port')) {
  winston.log('error', '\n\'port\' is a required local.json field');
  winston.log('error', 'If you don\'t have a local.json file set up, please copy local.json-dist and fill in your config info before trying again\n');
}

server.connection({
  host: conf.get('domain'),
  port: conf.get('port')
});

const routes = [].concat(
  index_routes
);

server.route(routes);

var options = {
  cookieOptions: {
    password: conf.get('cookie'),
    isSecure: false,
    clearInvalid: true
  }
};

server.register([{
  register: require('yar'),
  options: options
}, {
  register: require('hapi-cache-buster'),
  options: new Date().getTime().toString()
}], (err) => {
  winston.log('error', err);
});

server.start((err) => {
  if (err) {
    throw new Error(err.message);
  }
  winston.info('Server running at:', server.info.uri);
});

exports.getServer = () => {
  return server;
};

