'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _lodash = require('lodash');

/**
 * Build an `express.Router`.
 * @param {Array[]} routeDefs Route definitions.
 * @return {express.Router} `express.Router` instance
 */
function createRouter(routeDefs) {
  var _this = this;

  var router = _express2['default'].Router();
  new Map(routeDefs).forEach(function (def) {
    var _def = _slicedToArray(def, 2);

    var routes = _def[0];
    var methods = _def[1];

    (0, _lodash.flatten)([routes]).forEach(function (route) {
      (0, _lodash.forEach)(methods, function (args, restMethod) {
        router[restMethod](route, _this.handler.handle.apply(args));
      });
    });
  });
  return router;
}

var Handler = (function () {
  function Handler(model, routes) {
    _classCallCheck(this, Handler);

    this.model = model;
    this.routes = routes;
    this.router = createRouter(routes);
  }

  _createClass(Handler, [{
    key: 'handle',

    /**
     * Generate a request handler for a given method.
     * @param  {string} method Method to assign. Must exist on the class.
     * @return {function}      Request handler.
     * @private
     */
    value: function handle(method, args) {
      var _this2 = this;

      return function (req, res) {
        if (!_this2[method]) throw new Error('Unknown method', method);
        args = args.map(function (arg) {
          return (0, _lodash.property)(arg)(req);
        });
        _this2[method].apply(args).then(function (result, code) {
          if (result) return res.json(code, result);
          return res.send(code, result);
        })['catch'](function (err, code) {
          return res.send(code, err);
        });
      };
    }
  }]);

  return Handler;
})();

exports['default'] = Handler;
module.exports = exports['default'];