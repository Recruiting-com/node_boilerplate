exports.routes = [
  {
    path: '/',
    method: 'GET',
    handler: (request, reply) => {
      reply.view('index', {});
    }
  }
];
