const conf = require('./../../lib/conf');
const appRoot = require('app-root-path');
var src_path = process.env.NODE_ENV === 'production' ? 'dist' : 'src';

var cacheConfig = {
  cache: {
    expiresIn: conf.get('cacheTimeout'),
    privacy: conf.get('cachePrivacy')
  }
};

exports.routes = [
  {
    path: '/public/{p*}',
    method: 'GET',
    handler: {
      directory: {
        path: `${appRoot.path}/${src_path}/public`
      }
    },
    config: cacheConfig
  }
];
