'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodash = require('lodash');

var _errors = require('../errors');

/**
 * Server-side data model.
 */

var Model = (function () {
  /**
   * @param  {Object}         options
   * @param  {Object}         [options.name]      Model name. Must specify if not using a subclass.
   * @param  {Array.<Array>}  [options.routes]    `express` route definitions.
   * @param  {Object}         HandlerClass         Request handler.
   */

  function Model(_ref, HandlerClass) {
    var name = _ref.name;
    var routes = _ref.routes;

    _classCallCheck(this, Model);

    this.modelName = name || this.constructor.name;
    if ((0, _lodash.isEqual)(this.modelName, 'Model')) throw new _errors.ModelError('Must specify model name if not using a subclass');

    if (HandlerClass) {
      this.setHandler(new HandlerClass(this, routes));
      this.router = this.handler.router;
    }
  }

  _createClass(Model, [{
    key: 'setHandler',
    value: function setHandler(handler) {
      var _this = this;

      this._handler = handler;

      // Map handler functions to `this`.
      // Allows requiring scripts to call handler functions directly from instance.
      Object.getOwnPropertyNames(this.handler.__proto__).forEach(function (prop) {
        if (!(0, _lodash.includes)(['constructor', 'routes', 'router'], prop)) {
          if ((0, _lodash.isFunction)(_this.handler[prop])) _this[prop] = _this.handler[prop];
        }
      });
    }
  }, {
    key: 'handler',

    // only allow getter
    get: function get() {
      return this._handler;
    }
  }]);

  return Model;
})();

exports['default'] = Model;
module.exports = exports['default'];
//# sourceMappingURL=../core/Model.js.map