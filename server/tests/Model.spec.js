'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _coreModel = require('../core/Model');

var _coreModel2 = _interopRequireDefault(_coreModel);

var _handlersMongooseHandler = require('../handlers/MongooseHandler');

var _handlersMongooseHandler2 = _interopRequireDefault(_handlersMongooseHandler);

var _errors = require('../errors');

var _constants = require('../constants');

var _constants2 = _interopRequireDefault(_constants);

_chai2['default'].should();

var MODEL_NAME = 'ModelExample';
var HANDLER = _handlersMongooseHandler2['default'];

describe('Model', function () {
  describe('#constructor()', function () {
    var model = new _coreModel2['default']({
      name: MODEL_NAME,
      routes: _constants2['default']
    }, HANDLER);

    it('requires a model name if not a subclass', function () {
      (0, _chai.expect)(model.modelName).to.equal(MODEL_NAME);

      try {
        /*eslint-disable no-new*/
        new _coreModel2['default']({ routes: _constants2['default'] }, HANDLER);
        /*eslint-enable no-new*/
      } catch (err) {
        (0, _chai.expect)(err).to.be.an.instanceOf(_errors.ModelError);
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
//# sourceMappingURL=../tests/Model.spec.js.map