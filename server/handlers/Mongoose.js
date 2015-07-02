import Handler from 'server/handlers/Handler';

export default class MongooseHandler extends Handler {
  constructor(model) {
    this.model = model
    super();
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
    // return this.model.createQ(props).then(result => [result, 201]);
    return new Promise((resolve, reject) => {
      this.model.create(props)
        .then((err, result) => {
          if (err) reject(err);
          resolve(result, 201)
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
      this.model.find(props)
        .then((err, result) => {
          if (err) reject(err);
          if (!result) reject('No models found.', 404);
          resolve(result, 200);
        });
    });
  }

  /**
   * Retrieve a document by id.
   * @param {number} id Document id.
   * @return {Promise.<Array>}  [result, responseCode]
   */
  findById(id) {
    return this.find(props={_id: id})
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
            if (err) reject(err, 500);
            resolve(result, 201);
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
    return new Promise((resolve, reject) => {
      this.model.findById(id)
        .then((err, result) => {
          if (err) reject(err, 500);
          if (!result) reject('Model id ' + id + ' not found.', 404);
          result.remove(err => {
            if (err) reject(err, 500);
            resolve(undefined, 204);
          });
        });
    });
  }
}
