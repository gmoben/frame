import express from 'express';
import {flatten, forEach, property} from 'lodash';

var debug = require('debug')('phrame:handler');

/**
 * Build an `express.Router`.
 * @param {Array[]} routeDefs Route definitions.
 * @return {express.Router} `express.Router` instance
 */
function createRouter(handler, routeDefs) {
  let router = express.Router();
  for (let [routes, methods] of new Map(routeDefs)) {
    flatten([routes]).forEach(route => {
      forEach(methods, (args, restMethod) => {
        router[restMethod](route, handler.handle(...args));
      });
    });
  }
  return router;
}

export default class Handler {
  constructor(model, routes) {
    this.model = model;
    this.routes = routes;
    this.router = createRouter(this, routes);
  }

  /**
   * Generate a request handler for a given method.
   * @param  {string} method Method to assign. Must exist on the class.
   * @return {function}      Request handler.
   * @private
   */
  handle(method, args=[]) {
    debug('Building handler for ' + method);
    return (req, res) => {
      debug('Handling ' + method, args);
      if (!this[method]) throw new Error('Unknown method', method);
      args = flatten([args]).map(arg => property(arg)(req));
      this[method](args)
        .then(([result, code]) => {
          if (result) return res.status(code).json(result);
          return res.status(code).send(result);
        }).catch(([err, code]) => {
          debug('ERROR ' + err);
          res.status(code).send(err.name + ': ' + err.message);
        });
    };
  }
}
