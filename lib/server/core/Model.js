import {isEqual, isFunction, includes} from 'lodash';
import {ModelError} from 'server/errors';

/**
 * Server-side data model.
 */
export default class Model {
  /**
   * @param  {Object}         options
   * @param  {Object}         [options.name]      Model name. Must specify if not using a subclass.
   * @param  {Array.<Array>}  [options.routes]    `express` route definitions.
   * @param  {Object}         HandlerClass         Request handler.
   */
  constructor({name, routes}, HandlerClass) {
    this.modelName = name || this.constructor.name;
    if (isEqual(this.modelName, 'Model'))
      throw new ModelError('Must specify model name if not using a subclass');

    if (HandlerClass) {
      this.setHandler(new HandlerClass(this, routes));
      this.router = this.handler.router;
    }
  }

  // only allow getter
  get handler() {
    return this._handler;
  }

  setHandler(handler) {
    this._handler = handler;

    // Map handler functions to `this`.
    // Allows requiring scripts to call handler functions directly from instance.
    Object.getOwnPropertyNames(this.handler.__proto__).forEach(prop => {
      if (!includes(['constructor', 'routes', 'router'], prop)) {
        if (isFunction(this.handler[prop]))
          this[prop] = this.handler[prop];
      }
    });
  }

}
