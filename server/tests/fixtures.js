'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _serverModelsMongooseModel = require('server/models/MongooseModel');

var _serverModelsMongooseModel2 = _interopRequireDefault(_serverModelsMongooseModel);

var _serverUtils = require('server/utils');

var schemas = {
  'Album': [{ title: String, photos: [(0, _serverUtils.ref)('Photo')] }],
  'Photo': [{ url: String, album: (0, _serverUtils.ref)('Album', 'photos') }]
};

var models = _serverModelsMongooseModel2['default'].factory(schemas);

exports.models = models;
var config = {
  express: function express() {}
};

exports.config = config;
exports['default'] = { models: models, config: config };