'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _serverCoreHandler = require('server/core/Handler');

var _serverCoreHandler2 = _interopRequireDefault(_serverCoreHandler);

var _serverConstants = require('server/constants');

var _serverConstants2 = _interopRequireDefault(_serverConstants);

_chai2['default'].should();

describe('Handler', function () {
  var handler = new _serverCoreHandler2['default'](_serverConstants2['default']);
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