/* jshint -W033 */
/* jshint -W030 */
import mongoose, {Schema} from 'mongoose';
import relationship from 'mongoose-relationship';
import {forEach, merge, transform,
        isEmpty, isString, mapValues} from 'lodash';

import {ModelError} from '../errors';
import {MongooseHandler} from '../handlers';
import {Model} from '../core';

/**
 * Build a `mongoose` Schema.
 * @param {object}         schemaDefinition   Schema definition.
 * @param {Array.<string>} [virtuals] Property names of virtual functions
 * @param {Object}         [toObject] Schema `doc.toObject` options
 * @return {mongoose.Schema}
 */
function SchemaFactory(schemaDefinition, toObject) {
  let schema = new Schema(schemaDefinition);

  // Add mongoose-relationship path names
  let rpn = transform(schemaDefinition, (acc, v, k) => {
    if (v.hasOwnProperty('childPath')) acc.push(k);
  }, []);
  if (rpn) schema.plugin(relationship, {relationshipPathName: rpn});

  if (toObject) schema.set('toObject', toObject);

  return schema;
}

/**
 * Server-side data model.
 */
export default class MongooseModel extends Model {
  /**
   * @param  {Object}         schemaDefinition    `mongoose` schema definition.
   * @param  {Object}         options
   * @param  {Object}         [options.name]      Model name. Required if not using a subclass.
   * @param  {Array.<Array>}  [options.routes]    Overrides default `express` route definitions.
   * @param  {Array.<string>} [options.virtuals]  Class properties to assign as schema virtuals.
   * @param  {Object}         [options.populate]  Schema `doc.toObject` options.
   *                                              Default: `{getters: true}`
   * @param  {Object}         [handler]           Overrides default request handler.
   */
  constructor(schemaDefinition, {name, routes, virtuals, populate}={}) {
    // Schema must be defined before calling super
    let schema = SchemaFactory(schemaDefinition, populate || {getters: true});
    super({name, routes});
    this.schemaDefinition = schemaDefinition;
    this.schema = schema;
    this._setVirtuals(virtuals);
    this.setHandler(new MongooseHandler(this, routes));
    this.router = this.handler.router;
  }

  _setVirtuals(virtuals) {
    // Assign virtuals if they exist on the class
    if (virtuals) virtuals.forEach(name => {
      if (!(name in this))
        throw new ModelError('Virtual function ' + name + 'does not exist.');
      forEach(Object.getOwnPropertyDescriptor(this, name), (val, key) => {
        if (['get', 'set'].includes(key))
          schema.virtual(name)[key](val);
      });
    });

  }

  /**
   * Construct a new model by passing configuration options directly.
   *
   * @param  {string} name    Model name.
   * @param  {Object} schema  Schema configuration.
   * @param  {Object} [options] Model options.
   * @param  {Handler} [options.handler] Override default route handler.
   */
  static factory(name, schema, options={}) {
    if (!isString(name) && !isEmpty(name))
      return mapValues(name, ([sch, opt], k) => MongooseModel.factory(k, sch, opt));

    let {handler} = options;
    if (handler) delete options.handler;
    return new MongooseModel(schema, merge({name}, options), handler);
  }

  get model() {
    if (!this._model)
      this._model = mongoose.model(this.modelName, this.schema);
    return this._model;
  }

  /**
   * Add a `SocketIO.Socket` instance and emit on `mongoose` pre/post hooks.
   * @param  {SocketIO.Socket}   [options.socket]    Socket instance.
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
