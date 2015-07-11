import Handler from 'server/core/Handler';
import {ModelError} from 'server/errors';
import {merge, has, forEach} from 'lodash';

import DEFAULT_ROUTES from 'server/constants';

export default class MongooseHandler extends Handler {
  constructor(model, routes) {
    super(model, routes || DEFAULT_ROUTES);
    this._model = model; // Save a reference
    this.model = model.model; // Change for simplicity.
  }

  /**
   * Retrieve all documents.
   * @return {Promise.<Array>}  [result, responseCode]
   */
  index() {
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
        if (!has(this._model.schemaDefinition, prop))
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
    return this.find({_id: id});
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
