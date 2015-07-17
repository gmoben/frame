/* jshint -W033 */
/* jshint -W030 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _mongooseRelationship = require('mongoose-relationship');

var _mongooseRelationship2 = _interopRequireDefault(_mongooseRelationship);

var _lodash = require('lodash');

var _serverErrors = require('server/errors');

var _serverErrors2 = _interopRequireDefault(_serverErrors);

var _serverHandlersMongooseHandler = require('server/handlers/MongooseHandler');

var _serverHandlersMongooseHandler2 = _interopRequireDefault(_serverHandlersMongooseHandler);

var _serverCoreModel = require('server/core/Model');

var _serverCoreModel2 = _interopRequireDefault(_serverCoreModel);

/**
 * Build a `mongoose` Schema.
 * @param {object}         schemaDefinition   Schema definition.
 * @param {Array.<string>} [virtuals] Property names of virtual functions
 * @param {Object}         [toObject] Schema `doc.toObject` options
 * @return {mongoose.Schema}
 */
function SchemaFactory(schemaDefinition, virtuals, toObject) {
  var _this = this;

  var schema = new _mongoose.Schema(schemaDefinition);

  // Add mongoose-relationship path names
  var rpn = (0, _lodash.transform)(schemaDefinition, function (acc, v, k) {
    if (v.hasOwnProperty('childPath')) acc.push(k);
  }, []);
  if (rpn) schema.plugin(_mongooseRelationship2['default'], { relationshipPathName: rpn });

  // Assign virtuals if they exist on the class
  if (virtuals) virtuals.forEach(function (name) {
    if (!(name in _this)) throw new _serverErrors2['default']('Virtual function ' + name + 'does not exist.');
    (0, _lodash.forEach)(Object.getOwnPropertyDescriptor(_this, name), function (val, key) {
      if (['get', 'set'].includes(key)) schema.virtual(name)[key](val);
    });
  });

  if (toObject) schema.set('toObject', toObject);

  return schema;
}

/**
 * Server-side data model.
 */

var MongooseModel = (function (_Model) {
  _inherits(MongooseModel, _Model);

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

  function MongooseModel(schemaDefinition, _ref) {
    var name = _ref.name;
    var routes = _ref.routes;
    var virtuals = _ref.virtuals;
    var populate = _ref.populate;

    _classCallCheck(this, MongooseModel);

    // Schema must be defined before calling super
    var schema = SchemaFactory(schemaDefinition, virtuals, populate || { getters: true });
    _get(Object.getPrototypeOf(MongooseModel.prototype), 'constructor', this).call(this, { name: name, routes: routes });
    this.schemaDefinition = schemaDefinition;
    this.schema = schema;
    this.setHandler(new _serverHandlersMongooseHandler2['default'](this, routes));
    this.router = this.handler.router;
  }

  _createClass(MongooseModel, [{
    key: 'addSocket',

    /**
     * Add a `SocketIO.Socket` instance and emit on `mongoose` pre/post hooks.
     * @param  {SocketIO.Socket}   [options.socket]    Socket instance.
     * @param  {Object}   [options.events]    Mongoose hooks on which to emit events.
     *                                        Defaults to all hooks.
     */
    value: function addSocket(socket, events) {
      var _this2 = this;

      this.socket = socket;
      if (!events || (0, _lodash.isEmpty)(events)) events = {
        pre: ['init', 'validate', 'save', 'remove'],
        post: ['init', 'validate', 'save', 'remove']
      };

      // Emit events on specified `mongoose` hooks
      if (this.socket && events) {
        (0, _lodash.forEach)(events, function (hooknames, state) {
          hooknames.forEach(function (name) {
            _this2.schema[state](name, function (doc) {
              _this2.socket.emit([state, name].join(''), {
                model: _this2.modelName,
                doc: doc
              });
            });
          });
        });
      }
    }
  }, {
    key: 'model',
    get: function get() {
      if (!this._model) this._model = _mongoose2['default'].model(this.modelName, this.schema);
      return this._model;
    }
  }], [{
    key: 'factory',

    /**
     * Construct a new model by passing configuration options directly.
     *
     * @param  {string} name    Model name.
     * @param  {Object} schema  Schema configuration.
     * @param  {Object} [options] Model options.
     * @param  {Handler} [options.handler] Override default route handler.
     */
    value: function factory(name, schema) {
      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      if (!(0, _lodash.isString)(name) && !(0, _lodash.isEmpty)(name)) return (0, _lodash.mapValues)(name, function (_ref2, k) {
        var _ref22 = _slicedToArray(_ref2, 2);

        var sch = _ref22[0];
        var opt = _ref22[1];
        return MongooseModel.factory(k, sch, opt);
      });

      var handler = options.handler;

      if (handler) delete options.handler;
      return new MongooseModel(schema, (0, _lodash.merge)({ name: name }, options), handler);
    }
  }]);

  return MongooseModel;
})(_serverCoreModel2['default']);

exports['default'] = MongooseModel;
module.exports = exports['default'];