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
const public_routes = require('./routes/public.js').routes;

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

server.views({
  engines: {
    html: require('ejs')
  },
  isCached: process.env.NODE_ENV === 'production',
  path: `${appRoot.path}/${src_path}/server/templates`,
  compileOptions: {
    pretty: true
  }
});

const routes = [].concat(
  index_routes,
  public_routes
);



server.route(routes);

server.ext('onPreResponse', function(request, reply) {
  var response = request.response;


  if (response.isBoom) {
    var error = response;
    var ctx = {};

    var message = error.output.payload.message;
    var statusCode = error.output.statusCode || 500;
    ctx.code = statusCode;
    ctx.httpMessage = http.STATUS_CODES[statusCode].toLowerCase();
    switch (statusCode) {
      case 404:
        ctx.reason = 'page not found';
        break;
      case 403:
        ctx.reason = 'forbidden';
        break;
      case 500:
        ctx.reason = 'something went wrong';
        break;
      default:
        break;
    }

    if (process.env.NODE_ENV === 'dev') {
      winston.log('error', request.path, {error: error.output.payload.error});
    }

    ctx.layout_data = {
      host: conf.get('domain'),
      port: conf.get('webpack_port')
    };

    if (ctx.reason) {
      // Use actual message if supplied
      ctx.reason = message || ctx.reason;
      return reply.view('error', ctx).code(statusCode);
    } else {
      ctx.reason = message.replace(/\s/gi, '+');
      reply.redirect(request.path + '?err=' + ctx.reason);
    }
  }
  return reply.continue();
});

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

