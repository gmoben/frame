/* jshint -W033 */
import Schema from 'mongoose';
import relationship from 'mongoose-relationship';
import express from 'express';
import forEach from 'lodash/collection';
import flatten from 'lodash';
import merge from 'lodash';
import filter from 'lodash';
import isObject from 'lodash';
var mongoose = require('mongoose-q')();

function handleError(res, err) {
  return res.send(500, err);
}

class ModelError extends Error {
  constructor(responseCode, message) {
    super(message);
    this.name = "ModelError";
    this.responseCode = responseCode;
  }
}

export default class ServerModel {
  /**
   * Default constructor.
   *
   * @param  {object} options
   * @param  {object} options.name Class name. Set if not using a subclass.
   * @param  {object} options.schema Mongoose schema. Alternatively, the schema
   *                                 may be set in subclass constructor prior to
   *                                 calling super().
   * @param  {Array<String>}  options.virtuals  Virtual functions for schema
   * @param  {object} options.socket    Socket.io instance
   * @param  {object} options.emitHooks Hooks on which to emit socket events.
   *                                    e.g. {pre: ['save', ...], post: [...]}
   */
  constructor({name, schema, socket, emitHooks, virtuals}) {
    this.modelName = name || this.constructor.name;
    this.schema = this.schema || schema;
    this.emitHooks = emitHooks;
    this.socket = socket;

    // Find path names for mongoose-relationship
    let rpn = Object.keys(filter(schema, (v, k) => v.hasOwnProperty('childPath')));
    if (rpn) this.schema.plugin(relationship, {relationshipPathName: rpn});

    // Assign virtuals if they exist on the class
    virtuals.forEach(name => {
      forEach(Object.getOwnPropertyDescriptor(this, name), (val, key) => {
        if (['get', 'set'].includes(key))
          this.schema.virtual(name)[key](val);
        });
    });

    /**
     * `express` route definitions.
     * Routes will not be assigned until `this.router` is accessed.
     *
     * @type {Array<Array>}
     */
    this.routes = [
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
   * @return {obj}
   */
  static get schema() {
    if (!this._schema) throw new Error('Schema not defined.');
    return this._schema;
  }
  static set schema(obj) {
    this._schema = new Schema(obj);
  }

  /**
   * `socket.io` instance.
   * @return {object}
   */
  get socket() { return this._socket }
  set socket(socket) {
    this._socket = socket;
    // Emit events on specified `mongoose` hooks
    if (this.socket && this.emitHooks) {
      forEach(this.emitHooks, (state, hooknames) => {
        hooknames.forEach(name => {
          schema[state](name, doc => {
            let eventName = [[state, name].join('_'), this.constructor.name].join(':');
            socket.emit(eventName);
          });
        });
      });
  }

  /**
   * `express.Router` instance.
   * @type {object}
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
            this._router[restMethod](route, this._handle(callbackName)));
          });
        });
      });
    }
    return this._router;
  }

  /**
   * Generate a request handler for a given method.
   * @param  {String} method Method to assign. Must exist on the class.
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
   * @return {Promise<Array>}  [result, responseCode]
   */
  index() {
    this.model.findQ().then(result => [result, 200]);
  }

  /**
   * Create a new document.
   * @param {obj} props Document property values
   * @return {Promise<Array>}  [result, responseCode]
   */
  create(props) {
    this.model.createQ(props).then(result => [result, 201]);
  }

  /**
   * Retrieve a document.
   * @param {Number} id Document id.
   * @return {Promise<object>} The requested document.
   * @return {Promise<Array>}  [result, responseCode]
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
   * @param  {Number} id    Document id.
   * @param  {object} props Properties to update.
   * @return {Promise<Array>}  [result, responseCode]
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
   * @param  {Integer} id Document id
   * @return {Promise<Array>}  [undefined, responseCode]
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
