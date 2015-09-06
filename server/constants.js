'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var DEFAULT_ROUTES = [['/', {
  get: ['index', 'query.schema'],
  post: ['create', 'body']
}], ['/:id', {
  get: ['findById', 'params.id'],
  put: ['update', 'params.id', 'body'],
  patch: ['update', 'params.id', 'body'],
  'delete': ['delete', 'params.id']
}]];
exports.DEFAULT_ROUTES = DEFAULT_ROUTES;
//# sourceMappingURL=constants.js.map