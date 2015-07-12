'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodashObjectDefaults = require('lodash/object/defaults');

var _lodashObjectDefaults2 = _interopRequireDefault(_lodashObjectDefaults);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var constants = {
  ROOT: _path2['default'].join(__dirname, '..'),
  PARENT: _path2['default'].join(__dirname, '../..'),
  BUILD_DIR: 'dist'
};

var dir = require('require-dir')('.', {
  recurse: true,
  camelcase: true
});

exports['default'] = (0, _lodashObjectDefaults2['default'])(constants, dir);
module.exports = exports['default'];