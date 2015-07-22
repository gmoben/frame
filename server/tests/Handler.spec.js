'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _coreHandler = require('../core/Handler');

var _coreHandler2 = _interopRequireDefault(_coreHandler);

var _constants = require('../constants');

var _constants2 = _interopRequireDefault(_constants);

_chai2['default'].should();

describe('Handler', function () {
  var handler = new _coreHandler2['default'](_constants2['default']);
  handler.testFunc = function () {
    return 'Hi!';
  };

  describe('#constructor()', function () {
    it('builds and sets the router', function () {
      (0, _chai.expect)(handler.router).to.be.a('function');
    });
  });

  describe('#handle()', function () {
    it('returns a request handler', function () {
      var func = handler.handle('testFunc', ['body', 'params.id']);
      (0, _chai.expect)(func).to.be.a('function');
    });
  });
});
//# sourceMappingURL=../tests/Handler.spec.js.map