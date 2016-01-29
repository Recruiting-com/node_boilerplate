const Joi = require('joi');
const req = require('request');

// Whitelist of approved Applications
// Key: UUID, Value: <github repo name>
const APPLICATIONS = {
  '9fa6aba2-28cc-4552-a540-ea294e6aa14a': 'recruiting-capture-widget',
  '4b4ba596-d223-4c63-b8b3-b7e113fbe4f9': 'career-sites',
  '2bb0fefa-d5a9-4857-a99b-f8c52661ddeb': 'api',
  '2cc529e6-4b4b-45de-a792-8763d80deed7': 'morgan-stanley',
  '1f413e55-6757-4b87-af76-4f1b18817d48': 'jobing_com',
  'd1042bfc-94a6-4be3-bb06-0d22f960e499': 'crm'
};

const USERNAME = 'error_bot';
const PASSWORD = '?s4#q.k;.Mod37';

var auth = new Buffer(USERNAME + ':' + PASSWORD).toString('base64');

// 10400
var schema = Joi.object().keys({
  key: Joi.string().min(36).max(36).required(),
  error_id: Joi.string().min(1).max(100).required(),
  project_key: Joi.string().min(1).max(50).required(),
  summary: Joi.string().min(1).max(500).required(),
  description: Joi.string().min(1).max(500).required()
});

function createIssue(data, callback) {
  const JIRA_OPTIONS = {
    uri: 'https://recruitingventures.atlassian.net/rest/api/2/issue/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Atlassian-Token': 'no-check'
    },
    json: data
  }
  req(JIRA_OPTIONS, (error, response, body) => {
    if (!error && response.statusCode <= 201) {
      callback(null, response.body);
    } else {
      callback({ error: 'Jira didnt like something you sent'});
    }
  });
}

function commentIssue(response_data, data, callback) {
  const JIRA_OPTIONS = {
    uri: `https://recruitingventures.atlassian.net/rest/api/2/issue/${response_data.issues[0].key}/comment`,
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    json: {
      "body": data.fields.description
    }
  }
  req(JIRA_OPTIONS, (error, response, body) => {
    if (!error && response.statusCode <= 201) {
      callback(null, response.body);
    } else {
      callback({error: 'Jira didnt like something you sent'});
    }
  });
}

function checkIfErrorId(data, callback) {
  const JIRA_GET_OPTIONS = {
    uri: `https://recruitingventures.atlassian.net/rest/api/2/search?jql=cf[10400]~${data.fields.customfield_10400}`,
    method: 'GET',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    }
  };

  req(JIRA_GET_OPTIONS, (error, response, body) => {
    if (!error && response.statusCode < 400) {
      const response_data = JSON.parse(body);
      if (response_data.total > 0) {
        commentIssue(response_data, data, callback);
      } else {
        createIssue(data, callback);
      }
    } else {
      callback({error: error});
    }
  });
}

exports.routes = [
  {
    method: 'GET',
    path: '/favicon.ico',
    handler: {
      file: './public/images/favicon.png'
    },
    config: {
      cache: { expiresIn: 86400000, privacy: 'public' }
    }
  },
  {
    path: '/',
    method: 'GET',
    handler: (request, reply) => {
      reply({}).type('application/json');
    }
  },
  {
    method: 'POST',
    path: '/api/create_issue',
    handler: (request, reply) => {
      if (APPLICATIONS.hasOwnProperty(request.payload.key)) {
        const ctx = {
          key: request.payload.key,
          error_id: request.payload.error_id,
          project_key: request.payload.project_key,
          summary: request.payload.summary,
          description: request.payload.description
        };
        Joi.validate(ctx, schema, (err, value) => {
          const good_object = {
            "fields": {
              "project": {
                "key": ctx.project_key
              },
              "summary": ctx.summary,
              "description": ctx.description,
              "issuetype": {
                "name": "Bug"
              },
              "customfield_10400": request.payload.error_id
            }
          }
          if (!err) {
            checkIfErrorId(good_object, (error, data) => {
              if (error) {
                reply({ error: error }).type('application/json').code(401);
              }else {
                reply(data).type('application/json').code(200);
              }
            });
          } else {
            reply({ error: err.details }).type('application/json').code(401);
          }
        });
      } else {
        reply({ error: 'Bad Request' }).type('application/json').code(400);
      }
    }
  }
];
