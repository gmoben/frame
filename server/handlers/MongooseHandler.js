'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _core = require('../core');

var _mongoose = require('mongoose');

var _errors = require('../errors');

var _lodash = require('lodash');

var _constants = require('../constants');

var debug = require('debug')('phrame:handler:mongoose');

var MongooseHandler = (function (_Handler) {
  _inherits(MongooseHandler, _Handler);

  function MongooseHandler(model, routes) {
    _classCallCheck(this, MongooseHandler);

    _get(Object.getPrototypeOf(MongooseHandler.prototype), 'constructor', this).call(this, model, routes || _constants.DEFAULT_ROUTES);
    this._model = model; // Save a reference
    this.model = model.model; // Alias for simplicity.
  }

  _createClass(MongooseHandler, [{
    key: 'index',

    /**
     * Retrieve all documents.
     * @return {Promise.<Array>}  [result, responseCode]
     */
    value: function index(getSchema) {
      var _this = this;

      if (!(0, _lodash.isUndefined)(getSchema)) {
        return new Promise(function (resolve, reject) {
          if ((0, _lodash.isUndefined)(_this._model.schemaDefinition)) reject([new Error('schema is undefined'), 500]);
          resolve([_this._model.schemaDefinition, 200]);
        });
      }
      return this.find();
    }
  }, {
    key: 'create',

    /**
     * Create a new document.
     * @param {obj} props Document property values
     * @return {Promise.<Array>}  [result, responseCode]
     */
    value: function create(props) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        _this2.model.create(props, function (err, result) {
          if (err) reject([err, 500]);
          resolve([result, 201]);
        });
      });
    }
  }, {
    key: 'find',

    /**
     * Retrieve documents with matching props.
     * @param  {Object} props Search criteria.
     * @return {Promise.<Array>} [result, responseCode]
     */
    value: function find() {
      var _this3 = this;

      var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      return new Promise(function (resolve, reject) {
        // Reject if property not defined in schema defintion
        (0, _lodash.forEach)(props, function (v, prop) {
          if (!(0, _lodash.isEqual)(prop, '_id') && !(0, _lodash.has)(_this3._model.schemaDefinition, prop)) reject([new _errors.ModelError('Property ' + prop + ' does not exist on model'), 404]);
        });

        _this3.model.find(props, function (err, result) {
          if (err) reject([err, 500]);
          if (!result) reject([new _errors.ModelError('Undefined result'), 404]);
          resolve([result, 200]);
        });
      });
    }
  }, {
    key: 'findById',

    /**
     * Retrieve a document by id.
     * @param {number} id Document id.
     * @return {Promise.<Array>}  [result, responseCode]
     */
    value: function findById(id) {
      var _this4 = this;

      return new Promise(function (resolve, reject) {
        _this4.find({ _id: id }).then(resolve)['catch'](function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2);

          var err = _ref2[0];
          var code = _ref2[1];

          if (err instanceof _mongoose.Error.CastError) reject([new _errors.ModelError('Unknown ID "' + id + '"'), 404]);else reject(err, code);
        });
      });
    }
  }, {
    key: 'update',

    /**
     * Update an existing document.
     * @param  {number} id    Document id.
     * @param  {Object} props Properties to update.
     * @return {Promise.<Array>}  [result, responseCode]
     */
    value: function update(id, props) {
      var _this5 = this;

      return new Promise(function (resolve, reject) {
        if ('_id' in props) delete props._id;
        _this5.model.findById(id, function (result) {
          if (!result) reject([new _errors.ModelError('Docid ' + id + ' not found'), 404]);
          (0, _lodash.merge)(result, props).save(function (err) {
            if (err) reject([err, 500]);
            resolve([result, 201]);
          });
        });
      });
    }
  }, {
    key: 'remove',

    /**
     * Delete a document.
     * @param  {number} id Document id
     * @return {Promise.<Array>}  [undefined, responseCode]
     */
    value: function remove(id) {
      var _this6 = this;

      return new Promise(function (resolve, reject) {
        _this6.model.findById(id).exec().then(function (err, result) {
          if (err) reject([err, 500]);
          if (!result) reject([new _errors.ModelError('Docid ' + id + ' not found.'), 404]);
          result.remove(function (err2) {
            if (err2) reject([err2, 500]);
            resolve([undefined, 204]);
          });
        });
      });
    }
  }]);

  return MongooseHandler;
})(_core.Handler);

exports['default'] = MongooseHandler;
module.exports = exports['default'];
//# sourceMappingURL=../handlers/MongooseHandler.js.map