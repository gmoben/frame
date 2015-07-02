/* jshint -W033 */
/* jshint -W030 */
import mongoose, {Schema} from 'mongoose';
import relationship from 'mongoose-relationship';
import express from 'express';
import {forEach, flatten, merge, transform, isObject, isEmpty} from 'lodash';

import ModelError from './errors';

export const DEFAULT_ROUTES = [
  ['/', {
    get: 'index',
    post: 'create'
  }],
  ['/:id', {
    get: 'get',
    put: 'update',
    patch: 'update',
    delete: 'delete',
  }]
];

/**
 * Construct a new model by passing configuration options directly.
 */
export function ModelFactory(name, schema, routes, virtuals) {
  return new Model(schema, {name, routes, virtuals});
}

export default class Model {
  /**
   * @param  {Object}         schema              Schema configuration.
   * @param  {Object}         options
   * @param  {Object}         [options.name]      Model name. Must specify if not using a subclass.
   * @param  {Array.<Array>}  [options.routes]    `express` route definitions.
   * @param  {Array.<string>} [options.virtuals]  Class properties to assign as schema virtuals.
   * @param  {Object}         [options.populate]  Schema `doc.toObject` options.
   *                                              Default: `{getters: true}`
   */
  constructor(schema, {name, routes, virtuals, populate}={}) {
    this.modelName = name || this.constructor.name;
    this.routes = routes || DEFAULT_ROUTES;

    if (this.modelName == 'Model')
      throw new ModelError('Must specify model name if not using a subclass');

    this.setSchema(schema, virtuals, populate || { getters: true });
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
   * @param {Object}         [populate] Schema `doc.toObject` options
   * @return {mongoose.Schema}
   */
  setSchema(schema, virtuals, populate) {
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

    if (populate) this.schema.set

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

  /** @type {string} */
  get routes() {
    return this._routes;
  }
  set routes(obj) {
    if (this._routes && this._router)
      throw new ModelError('Router already in use. Unable to set routes.');
    this._routes = obj;
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
          forEach(methods, (callbackName, restMethod) => {
            this._router[restMethod](route, this._handle(callbackName));
          });
        });
      });
    }
    return this._router;
  }

  /**
   * Set `socket.io` instance and mongoose pre/post hooks.
   * @param  {socketio.Socket}   [options.socket]    Socket.io instance
   * @param  {Object}   [options.emitOn]    Mongoose hooks on which to emit events.
   *                                        Defaults to all hooks.
   */
  setSocket(socket, emitOn) {
    this.socket = socket;
    if (!emitOn || isEmpty(emitOn)) emitOn = {
      pre: ['init', 'validate', 'save', 'remove'],
      post: ['init', 'validate', 'save', 'remove']
    };
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
   * Generate a request handler for a given method.
   * @param  {string} method Method to assign. Must exist on the class.
   * @return {function}      Request handler.
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
    return this.model.create(props)
      .then(result => [result, 201]);
  }

  /**
   * Retrieve a document by id.
   * @param {number} id Document id.
   * @return {Promise.<Array>}  [result, responseCode]
   */
  findById(id) {
    return this.model.findById(id)
      .then(result => {
        if (!result) throw new ModelError(404);
        return [result, 200];
      });
  }

  /**
   * Retrieve documents with matching props.
   * @param  {Object} props Search criteria.
   * @return {Promise.<Array>} [result, responseCode]
   */
  find(props) {
    return this.model.find(props)
      .then(result => {
        if (!result) throw new ModelError(404);
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
    return new Promise((resolve, reject) => {
      if ('_id' in props) delete props._id;
      this.model.findByIdQ(id)
        .then(result => {
          if (!result) reject(new ModelError('Docid ' + id + ' not found'));
          merge(result, props).save((err, doc) => {
            if (err) reject(err);
            resolve([result]);
          });
        });
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
        if (!result) throw new ModelError(404);
        result.remove(err => {
          if (err) throw new ModelError(500, err);
          return [undefined, 204];
        });
      });
  }
}
