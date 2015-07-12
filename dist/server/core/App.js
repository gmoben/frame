'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _socketIo = require('socket.io');

var _socketIo2 = _interopRequireDefault(_socketIo);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _lodash = require('lodash');

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var App = (function () {
  /**
   * Initalize express application and socket.io.
   * @param  {object} models Models to use.
   * @param  {object} config Configuration to use.
   */

  function App(models, config) {
    var _this = this;

    _classCallCheck(this, App);

    this.models = models;
    this.config = config;

    this.debug = (0, _debug2['default'])(this.constructor.name);

    /**
     * @member {express.Application} app
     * @member {http.Server} server
     * @member {socketio.Server} io
     */
    this.app = (0, _express2['default'])();
    this.server = _http2['default'].Server(this.app);
    this.io = (0, _socketIo2['default'])(this.server);

    this.config.express(this.app);

    this.io.on('connection', function (socket) {
      _this.debug('[socket.io]', 'Client connected');
      _this.socket = socket;
      var events = _this.config.socket ? _this.config.socket.events : undefined;
      _this.setSocket(_this.socket, events);
    });
  }

  _createClass(App, [{
    key: 'listen',

    /**
     * Listen to incoming requests.
     * @param  {number} port      Server port
     * @param  {string} [hostname=localhost]  Server hostname
     * @return {Promise.<Object>} {address, port}
     */
    value: function listen(port) {
      var _this2 = this;

      var hostname = arguments.length <= 1 || arguments[1] === undefined ? '127.0.0.1' : arguments[1];

      return new Promise(function (resolve, reject) {
        _this2.server.listen(port, hostname, function (err) {
          if (err) reject(err);
          var addr = _this2.server.address();
          var uri = addr.address + ':' + addr.port;
          _this2.debug('[express]', 'Listening @ ', uri);

          // /** @member {socket.io-client.Manager} */
          // this.ioClient = SocketIOClient('ws://' + uri);

          _this2.connectDB(addr.address).then(function () {
            return resolve(addr);
          })['catch'](function (e) {
            return reject(e);
          });
        });
      });
    }
  }, {
    key: 'close',

    /**
     * Close the server.
     * @return {Promise.<string>} Success message
     */
    value: function close() {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        _this3.server.close(function (err) {
          if (err) reject(err);
          _this3.disconnectDB().then(resolve)['catch'](reject);
        });
      });
    }
  }, {
    key: 'connectDB',

    /**
     * Connect mongoose to mongodb instance.
     * @param {Object} [options]
     * @param {string} [options.db=test]  Database name
     * @param {string} [options.hostname=localhost]   Host name
     * @param {Object} [options.options]  `mongoose.connect` options
     * @return {Promise.<string>}  URI of mongodb instance.
     */
    value: function connectDB(hostname, db, options) {
      var _this4 = this;

      db = db || 'test';
      hostname = hostname || '127.0.0.1';
      options = options || {};

      return new Promise(function (resolve, reject) {
        var uri = ['mongodb://', hostname, '/', db].join('');
        _mongoose2['default'].connect(uri, options, function (err) {
          if (err) reject(err);else {
            _this4.debug('[mongoose] Connected to', uri);
            resolve(uri);
          }
        });
      });
    }
  }, {
    key: 'disconnectDB',
    value: function disconnectDB() {
      var _this5 = this;

      return new Promise(function (resolve, reject) {
        _mongoose2['default'].disconnect(function (err) {
          if (err) reject(err);
          _this5.debug('[mongoose]', 'Disconnected');
          resolve();
        });
      });
    }
  }, {
    key: 'addSocket',

    /**
     * Add a new socket to all models.
     * @param  {socketio.Socket} socket    Socket.io instance.
     * @param  {Object} [events]           `mongoose` hooks to listen to.
     */
    value: function addSocket(socket, events) {
      (0, _lodash.values)(this.models).forEach(function (model) {
        return model.addSocket(socket, events);
      });
    }
  }]);

  return App;
})();

exports['default'] = App;
module.exports = exports['default'];