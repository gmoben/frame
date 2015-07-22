'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _modelsMongooseModel = require('../models/MongooseModel');

var _modelsMongooseModel2 = _interopRequireDefault(_modelsMongooseModel);

var _utils = require('../utils');

var schemas = {
  'Album': [{ title: String, photos: [(0, _utils.ref)('Photo')] }],
  'Photo': [{ url: String, album: (0, _utils.ref)('Album', 'photos') }]
};

var models = _modelsMongooseModel2['default'].factory(schemas);

exports.models = models;
var config = {
  express: function express() {}
};

exports.config = config;
exports['default'] = { models: models, config: config };
//# sourceMappingURL=../tests/fixtures.js.map