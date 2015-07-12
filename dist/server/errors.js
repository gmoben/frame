'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var ModelError = (function (_Error) {
  function ModelError(msg) {
    _classCallCheck(this, ModelError);

    _get(Object.getPrototypeOf(ModelError.prototype), 'constructor', this).call(this, msg);
    this.message = msg;
    this.name = 'ModelError';
  }

  _inherits(ModelError, _Error);

  return ModelError;
})(Error);

exports.ModelError = ModelError;

var AppError = (function (_Error2) {
  function AppError(msg) {
    _classCallCheck(this, AppError);

    _get(Object.getPrototypeOf(AppError.prototype), 'constructor', this).call(this, msg);
    this.message = msg;
    this.name = 'AppError';
  }

  _inherits(AppError, _Error2);

  return AppError;
})(Error);

exports.AppError = AppError;
exports['default'] = { ModelError: ModelError, AppError: AppError };