/* jshint -W033 */
/* jshint -W030 */
import {Schema} from 'mongoose';
import relationship from 'mongoose-relationship';
import express from 'express';
import {forEach, flatten, merge, transform, isObject} from 'lodash';
import mongoose from 'mongoose';

import ModelError from './errors';

export const DEFAULT_ROUTES = [
  ['/', {
    get: 'index',
    post: 'create'
  }],
  ['/:id', {
    get: 'read',
    put: 'update',
    patch: 'update',
    delete: 'delete',
  }]
];

export default class ServerModel {
  /**
   * @param  {Object}   schema              Mongoose schema configuration.
   * @param  {Object}   options
   * @param  {mongoose} mongoose            mongoose instance
   * @param  {Object}   [options.name]      Class name. Set if not using a subclass.
   * @param  {string[]} [options.virtuals]  Virtual functions for schema
   */
  constructor(schema, {name, virtuals, routes, mongoose}={}) {
    this.schema = schema;
    this.modelName = name || this.constructor.name;
    this.mongoose = mongoose;

    // Find path names for mongoose-relationship
    let rpn = transform(schema, (acc, v, k) => {
      if (v.hasOwnProperty('childPath')) acc.push(k);
    }, []);
    if (rpn) this.schema.plugin(relationship, {relationshipPathName: rpn});

    // Assign virtuals if they exist on the class
    if (virtuals) virtuals.forEach(name => {
      forEach(Object.getOwnPropertyDescriptor(this, name), (val, key) => {
        if (['get', 'set'].includes(key))
          this.schema.virtual(name)[key](val);
        });
    });

    /**
     * `express` route definitions.
     * Routes will not be assigned until `this.router` is accessed.
     *
     * @type {Array[]}
     */
    this.routes = routes || DEFAULT_ROUTES;
  }

  /**
   * `mongoose.model` instance.
   * @return {mongoose.model}
   */
  get model() {
    if (!this._model)
      this._model = mongoose.model(this.modelName, this.schema);
    return this._model;
  }

  /**
   * `mongoose.Schema` instance.
   * @return {mongoose.Schema}
   */
  get schema() {
    if (!this._schema) throw new Error('Schema not defined.');
    return this._schema;
  }
  set schema(obj) {
    this._schema = new Schema(obj);
  }

  /**
   * Set `socket.io` instance and mongoose pre/post hooks.
   * @param  {Object}   [options.socket]    Socket.io instance
   * @param  {Object}   [options.emitOn]    Emit events on mongoose hooks.
   *                                        e.g. `{pre: ['save', ...], post: [...]}`
   */
  setSocket(socket, emitOn) {
    this.socket = socket;
    // Emit events on specified `mongoose` hooks
    if (this.socket && emitOn) {
      forEach(this.emitOn, (hooknames, state) => {
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

  /**
   * `express.Router` instance.
   * @type {express.Router}
   */
  get router() {
    if (!this._router) {
      this._router = express.Router();
      // Assign routes
      let routeMap = this.routes ? new Map(this.routes) : [];
      routeMap.forEach(def => {
        let [routes, methods] = def;
        flatten([routes]).forEach(route => {
          forEach(methods, (callbackName, restMethod) => {
            this._router[restMethod](route, this._handle(callbackName));
          });
        });
      });
    }
    return this._router;
  }

  /**
   * Generate a request handler for a given method.
   * @param  {string} method Method to assign. Must exist on the class.
   * @return {function}      Express request handler.
   * @private
   */
  _handle(method) {
    if (!this[method]) throw new Error('Unknown method', method);
    return (req, res) => {
      this[method](args).then(([result, code]) => {
        if (result) return res.json(code, result);
        return res.send(code);
      }).catch(err => {
        return res.send(500, err);
      });
    };
  }

  /**
   * Retrieve all documents.
   * @return {Promise.<Array>}  [result, responseCode]
   */
  index() {
    return this.model.findQ().then(result => [result, 200]);
  }

  /**
   * Create a new document.
   * @param {obj} props Document property values
   * @return {Promise.<Array>}  [result, responseCode]
   */
  create(props) {
    // return this.model.createQ(props).then(result => [result, 201]);
    return new Promise((resolve, reject) => {
      this.model.create(props, (err, result) => {
        console.log(result);
        if (err) reject(err);
        resolve(result);
      })
    });
  }

  /**
   * Retrieve a document.
   * @param {number} id Document id.
   * @return {Promise.<Array>}  [result, responseCode]
   */
  get(id) {
    return this.model.findByIdQ(id)
      .then(result => {
        if (!result) throw ModelError(404);
        return [result, 200];
      });
  }

  /**
   * Update an existing document.
   * @param  {number} id    Document id.
   * @param  {Object} props Properties to update.
   * @return {Promise.<Array>}  [result, responseCode]
   */
  update(id, props) {
    if ('_id' in props) delete props._id;
    return this.model.findByIdQ(id)
      .then(result => {
        if (!result) throw ModelError(404);
        merge(result, props).saveQ()
          .then(doc => { return [result, 200] })
          .catch(err => { throw new ModelError(500, err) });
      });
  }

  /**
   * Delete a document.
   * @param  {number} id Document id
   * @return {Promise.<Array>}  [undefined, responseCode]
   */
  delete(id) {
    return this.model.findByIdQ(id)
      .then(result => {
        if (!result) throw ModelError(404);
        result.remove(err => {
          if (err) throw ModelError(500, err);
          return [undefined, 204];
        });
      });
  }
}
