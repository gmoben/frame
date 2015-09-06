import {Handler} from '../core';
import {Error as MongooseError} from 'mongoose';
import {ModelError} from '../errors';
import {merge, has, forEach, isEqual, isUndefined} from 'lodash';

import {DEFAULT_ROUTES} from '../constants';

var debug = require('debug')('phrame:handler:mongoose');

export default class MongooseHandler extends Handler {
  constructor(model, routes) {
    super(model, routes || DEFAULT_ROUTES);
    this._model = model; // Save a reference
    this.model = model.model; // Alias for simplicity.
  }

  /**
   * Retrieve all documents.
   * @return {Promise.<Array>}  [result, responseCode]
   */
  index(getSchema) {
    if (!isUndefined(getSchema)) {
      return new Promise((resolve, reject) => {
        if (isUndefined(this._model.schemaDefinition))
          reject([new Error('schema is undefined'), 500]);
        resolve([this._model.schemaDefinition, 200]);
      });
    }
    return this.find();
  }

  /**
   * Create a new document.
   * @param {obj} props Document property values
   * @return {Promise.<Array>}  [result, responseCode]
   */
  create(props) {
    return new Promise((resolve, reject) => {
      this.model.create(props, (err, result) => {
        if (err) reject([err, 500]);
        resolve([result, 201]);
      });
    });
  }

  /**
   * Retrieve documents with matching props.
   * @param  {Object} props Search criteria.
   * @return {Promise.<Array>} [result, responseCode]
   */
  find(props={}) {
    return new Promise((resolve, reject) => {
      // Reject if property not defined in schema defintion
      forEach(props, (v, prop) => {
        if (!isEqual(prop, '_id') && !has(this._model.schemaDefinition, prop))
          reject([new ModelError('Property ' + prop + ' does not exist on model'), 404]);
      });

      this.model.find(props, (err, result) => {
        if (err) reject([err, 500]);
        if (!result) reject([new ModelError('Undefined result'), 404]);
        resolve([result, 200]);
      });
    });
  }

  /**
   * Retrieve a document by id.
   * @param {number} id Document id.
   * @return {Promise.<Array>}  [result, responseCode]
   */
  findById(id) {
    return new Promise((resolve, reject) => {
      this.find({_id: id})
        .then(resolve)
        .catch(([err, code]) => {
          if (err instanceof MongooseError.CastError) reject([new ModelError('Unknown ID "' + id + '"'), 404]);
          else reject(err, code);
        });
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
      this.model.findById(id, result => {
        if (!result) reject([new ModelError('Docid ' + id + ' not found'), 404]);
        merge(result, props).save(err => {
          if (err) reject([err, 500]);
          resolve([result, 201]);
        });
      });
    });
  }

  /**
   * Delete a document.
   * @param  {number} id Document id
   * @return {Promise.<Array>}  [undefined, responseCode]
   */
  remove(id) {
    return new Promise((resolve, reject) => {
      this.model.findById(id).exec()
        .then((err, result) => {
          if (err) reject([err, 500]);
          if (!result) reject([new ModelError('Docid ' + id + ' not found.'), 404]);
          result.remove(err2 => {
            if (err2) reject([err2, 500]);
            resolve([undefined, 204]);
          });
        });
    });
  }
}
