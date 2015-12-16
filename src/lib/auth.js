var sha1 = require('node-sha1');
var moment = require('moment');
var conf = require('./conf');

var _secret = conf.get('secret');
var _apiKey = conf.get('apiKey');

exports.getApiKey = function() {
  return _apiKey;
};

exports.getAuthToken = function() {
  var apiTimeStamp = moment().utc().format('YYYY-MM-DDTHH:mm:ss'); // Need utc time here
  var apiSecretData = apiTimeStamp + _secret;
  var shaSecret = sha1(apiSecretData);

  return {shaSecret: shaSecret, apiTimeStamp: apiTimeStamp};
};
