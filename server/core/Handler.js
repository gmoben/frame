import express from 'express';
import {flatten, forEach, property} from 'lodash';

/**
 * Build an `express.Router`.
 * @param {Array[]} routeDefs Route definitions.
 * @return {express.Router} `express.Router` instance
 */
function createRouter(routeDefs) {
  let router = express.Router();
  (new Map(routeDefs)).forEach(def => {
    let [routes, methods] = def;
    flatten([routes]).forEach(route => {
      forEach(methods, (args, restMethod) => {
        router[restMethod](route, this.handler.handle.apply(args));
      });
    });
  });
  return router;
}

export default class Handler {
  constructor(model, routes) {
    this.model = model;
    this.routes = routes;
    this.router = createRouter(routes);
  }

  /**
   * Generate a request handler for a given method.
   * @param  {string} method Method to assign. Must exist on the class.
   * @return {function}      Request handler.
   * @private
   */
  handle(method, args) {
    return (req, res) => {
      if (!this[method]) throw new Error('Unknown method', method);
      args = args.map(arg => property(arg)(req));
      this[method].apply(args)
        .then((result, code) => {
          if (result) return res.json(code, result);
          return res.send(code, result);
        }).catch((err, code) => {
          return res.send(code, err);
        });
    };
  }
}
