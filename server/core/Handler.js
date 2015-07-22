'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _lodash = require('lodash');

var debug = require('debug')('phrame:handler');

/**
 * Build an `express.Router`.
 * @param {Array[]} routeDefs Route definitions.
 * @return {express.Router} `express.Router` instance
 */
function createRouter(handler, routeDefs) {
  var router = _express2['default'].Router();
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    var _loop = function () {
      var _step$value = _slicedToArray(_step.value, 2);

      var routes = _step$value[0];
      var methods = _step$value[1];

      (0, _lodash.flatten)([routes]).forEach(function (route) {
        (0, _lodash.forEach)(methods, function (args, restMethod) {
          router[restMethod](route, handler.handle.apply(handler, _toConsumableArray(args)));
        });
      });
    };

    for (var _iterator = new Map(routeDefs)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      _loop();
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator['return']) {
        _iterator['return']();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return router;
}

var Handler = (function () {
  function Handler(model, routes) {
    _classCallCheck(this, Handler);

    this.model = model;
    this.routes = routes;
    this.router = createRouter(this, routes);
  }

  _createClass(Handler, [{
    key: 'handle',

    /**
     * Generate a request handler for a given method.
     * @param  {string} method Method to assign. Must exist on the class.
     * @return {function}      Request handler.
     * @private
     */
    value: function handle(method) {
      var _this = this;

      var args = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

      debug('Building handler for ' + method);
      return function (req, res) {
        debug('Handling ' + method, args);
        if (!_this[method]) throw new Error('Unknown method', method);
        args = (0, _lodash.flatten)([args]).map(function (arg) {
          return (0, _lodash.property)(arg)(req);
        });
        _this[method](args).then(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2);

          var result = _ref2[0];
          var code = _ref2[1];

          if (result) return res.status(code).json(result);
          return res.status(code).send(result);
        })['catch'](function (_ref3) {
          var _ref32 = _slicedToArray(_ref3, 2);

          var err = _ref32[0];
          var code = _ref32[1];

          debug('ERROR ' + err);
          res.status(code).send(err.name + ': ' + err.message);
        });
      };
    }
  }]);

  return Handler;
})();

exports['default'] = Handler;
module.exports = exports['default'];
//# sourceMappingURL=../core/Handler.js.map