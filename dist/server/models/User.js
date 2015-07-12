'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _serverModelsMongooseModel = require('server/models/MongooseModel');

var _serverModelsMongooseModel2 = _interopRequireDefault(_serverModelsMongooseModel);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var User = (function (_MongooseModel) {
  function User() {
    _classCallCheck(this, User);

    var schema = {
      name: String,
      email: { type: String, lowercase: true },
      role: {
        type: String,
        'default': 'user'
      },
      hashedPassword: String,
      provider: String,
      salt: String
    };
    _get(Object.getPrototypeOf(User.prototype), 'constructor', this).call(this, schema, { virtuals: ['password', 'profile', 'token'] });
  }

  _inherits(User, _MongooseModel);

  _createClass(User, [{
    key: 'authenticate',

    /**
     * Hash provided string and compare with hashed password.
     * @param {String} plainText
     * @return {Boolean}
     * @api public
     */
    value: function authenticate(plainText) {
      return this.encryptPassword(plainText) === this.hashedPassword;
    }
  }, {
    key: 'encryptPassword',

    /**
     * Encrypt plaintext password.
     * @param {String} password
     * @return {String}
     * @api public
     */
    value: function encryptPassword(password) {
      if (!password || !this.salt) {
        return '';
      }
      var salt = new Buffer(this.salt, 'base64');
      return _crypto2['default'].pbkdf2Sync(password, salt, 10000, 64).toString('base64');
    }
  }, {
    key: 'password',

    /**
     * Unencrypted password.
     * Password is encrypted internally and decrypted on access.
     *
     * @return {String}
     */
    get: function get() {
      return this._password;
    },
    set: function set(password) {
      this._password = password;
      this.salt = _crypto2['default'].randomBytes(16).toString('base64');
      this.hashedPassword = this.encryptPassword(password);
    }
  }, {
    key: 'profile',

    /**
     * Profile information.
     * @return {object} {role, name}
     */
    get: function get() {
      return { name: this.name, role: this.role };
    }
  }, {
    key: 'token',

    /**
     * Auth token.
     * @return {object} {_id, role}
     */
    get: function get() {
      return { _id: this._id, role: this.role };
    }
  }]);

  return User;
})(_serverModelsMongooseModel2['default']);

exports['default'] = new User();
module.exports = exports['default'];