export const DEFAULT_ROUTES = [
  ['/', {
    get: ['index', 'query.schema'],
    post: ['create', 'body']
  }],
  ['/:id', {
    get: ['findById', 'params.id'],
    put: ['update', 'params.id', 'body'],
    patch: ['update', 'params.id', 'body'],
    delete: ['delete', 'params.id']
  }]
];
