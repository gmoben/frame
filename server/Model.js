/* jshint -W033 */
/* jshint -W030 */
import mongoose, {Schema} from 'mongoose';
import relationship from 'mongoose-relationship';
import express from 'express';
import {forEach, flatten, merge, transform,
        isEmpty, isString, mapValues} from 'lodash';

import ModelError from 'server/errors';
import MongooseHandler from 'server/handlers/Mongoose';

export const DEFAULT_ROUTES = [
  ['/', {
    get: 'find',
    post: 'create'
  }],
  ['/:id', {
    get: 'findById',
    put: 'update',
    patch: 'update',
    delete: 'delete',
  }]
];

/**
 * Construct a new model by passing configuration options directly.
 *
 * @param  {string} name    Model name.
 * @param  {Object} schema  Schema configuration.
 * @param  {Object} [options] Model options.
 * @param  {Handler} [options.handler] Override default route handler.
 */
export function ModelFactory(name, schema, options={}) {
  if (!isString(name) && !isEmpty(name))
    return mapValues(args, (v, k) => ModelFactory(k, v));

  let {handler} = options;
  if (handler) delete options.handler;
  return new Model(schema, merge({name}, options), handler);
}

/**
 * Server-side data model.
 */
export default class MongooseModel {
  /**
   * @param  {Object}         schema              Schema configuration.
   * @param  {Object}         options
   * @param  {Object}         [options.name]      Model name. Must specify if not using a subclass.
   * @param  {Array.<Array>}  [options.routes]    `express` route definitions.
   * @param  {Array.<string>} [options.virtuals]  Class properties to assign as schema virtuals.
   * @param  {Object}         [options.populate]  Schema `doc.toObject` options.
   *                                              Default: `{getters: true}`
   * @param  {Object}         [handler]           Override default request handler.
   */
  constructor(schema, {name, routes, virtuals, populate}, handler=MongooseHandler) {
    this.modelName = name || this.constructor.name;
    if (this.modelName == 'Model')
      throw new ModelError('Must specify model name if not using a subclass');

    this.setSchema(schema, virtuals, populate || { getters: true });
    this.routes = routes || DEFAULT_ROUTES;
    this.handler = new handler(this.model);
  }

  /**
   * `mongoose.Schema` instance.
   * @type {mongoose.Schema}
   */
  get schema() {
    if (!this._schema) throw new ModelError('Schema not defined.');
    return this._schema;
  }

  /**
   * Build and return mongoose Schema.
   * @param {object}         schema   Schema definition.
   * @param {Array.<string>} [virtuals] Property names of virtual functions
   * @param {Object}         [toObject] Schema `doc.toObject` options
   * @return {mongoose.Schema}
   */
  setSchema(schema, virtuals, toObject) {
    if (this.schema) {throw new ModelError('Schema already defined.');}
    this._schema = new Schema(schema);

    // Add mongoose-relationship path names
    let rpn = transform(schema, (acc, v, k) => {
      if (v.hasOwnProperty('childPath')) acc.push(k);
    }, []);
    if (rpn) this.schema.plugin(relationship, {relationshipPathName: rpn});

    // Assign virtuals if they exist on the class
    if (virtuals) virtuals.forEach(name => {
      if (!(name in this)) {throw new ModelError('Virtual function ' + name + 'does not exist.')}
      forEach(Object.getOwnPropertyDescriptor(this, name), (val, key) => {
        if (['get', 'set'].includes(key))
          this.schema.virtual(name)[key](val);
      });
    });

    if (toObject) this.schema.set('toObject', toObject);

    return this.schema;
  }

  /**
   * `mongoose.model` instance.
   * @type {mongoose.model}
   */
  get model() {
    if (!this._model)
      this._model = mongoose.model(this.modelName, this.schema);
    return this._model;
  }

  /** @type {express.Router} */
  get router() {
    if (!this._router) {
      this._router = express.Router();
      // Assign routes
      if (!this.routes) {throw new ModelError('Must define routes before accessing router');}
      let routeMap = this.routes ? new Map(this.routes) : [];
      routeMap.forEach(def => {
        let [routes, methods] = def;
        flatten([routes]).forEach(route => {
          forEach(methods, (methodName, restMethod) => {
            this.router[restMethod](route, this.handler.handle(methodName));
          });
        });
      });
    }
    return this._router;
  }

  /**
   * Set `socket.io` instance and mongoose pre/post hooks.
   * @param  {socketio.Socket}   [options.socket]    Socket.io instance
   * @param  {Object}   [options.events]    Mongoose hooks on which to emit events.
   *                                        Defaults to all hooks.
   */
  addSocket(socket, events) {
    this.socket = socket;
    if (!events || isEmpty(events)) events = {
      pre: ['init', 'validate', 'save', 'remove'],
      post: ['init', 'validate', 'save', 'remove']
    };
    // Emit events on specified `mongoose` hooks
    if (this.socket && events) {
      forEach(events, (hooknames, state) => {
        hooknames.forEach(name => {
          this.schema[state](name, doc => {
            this.socket.emit([state, name].join(''), {
              model: this.modelName,
              doc
            });
          });
        });
      });
    }
  }
  
}
