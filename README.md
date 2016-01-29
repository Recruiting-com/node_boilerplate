# jira_service

A Jira reporting service for recruiting ventures

# Example post

```
{   
    "key": "9fa6aba2-28cc-4552-a540-ea294e6aa14a",
    "error_id": "test-jira-service",
    "project_key": "CRM",
    "summary": "REST EXAMPLE",
    "description": "Creating an issue via REST API",
    "issuetype": {
        "name": "Bug"
    }
}
```

Key is an assigned uuid to your application. look in `src/server/index.js`

### Setting up development

install nvm:

use `4` or later

`npm install`

install foreman:

`sudo gem install foreman`

run:

`make dev`


### Testing

`make test`


### Production

`make deploy`
