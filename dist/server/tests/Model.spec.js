'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _serverCoreModel = require('server/core/Model');

var _serverCoreModel2 = _interopRequireDefault(_serverCoreModel);

var _serverHandlersMongooseHandler = require('server/handlers/MongooseHandler');

var _serverHandlersMongooseHandler2 = _interopRequireDefault(_serverHandlersMongooseHandler);

var _serverErrors = require('server/errors');

var _serverConstants = require('server/constants');

var _serverConstants2 = _interopRequireDefault(_serverConstants);

_chai2['default'].should();

var MODEL_NAME = 'ModelExample';
var HANDLER = _serverHandlersMongooseHandler2['default'];

describe('Model', function () {
  describe('#constructor()', function () {
    var model = new _serverCoreModel2['default']({
      name: MODEL_NAME,
      routes: _serverConstants2['default']
    }, HANDLER);

    it('requires a model name if not a subclass', function () {
      (0, _chai.expect)(model.modelName).to.equal(MODEL_NAME);

      try {
        /*eslint-disable no-new*/
        new _serverCoreModel2['default']({ routes: _serverConstants2['default'] }, HANDLER);
        /*eslint-enable no-new*/
      } catch (err) {
        (0, _chai.expect)(err).to.be.an.instanceOf(_serverErrors.ModelError);
      }
    });

    it('creates a handler instance from supplied Handler class', function () {
      (0, _chai.expect)(model.handler).to.be.an.instanceOf(HANDLER);
    });

    it('assigns handler functions to itself', function () {
      var hProps = Object.getOwnPropertyNames(model.handler.__proto__);
      hProps.forEach(function (prop) {
        if (prop !== 'constructor') {
          (0, _chai.expect)(model[prop]).to.be.a('function');
          (0, _chai.expect)(model[prop]).to.equal(model.handler[prop]);
        }
      });
    });

    it('holds a reference to the handler\'s router instance', function () {
      (0, _chai.expect)(model.router).to.equal(model.handler.router);
    });
  });
});