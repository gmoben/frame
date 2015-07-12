/*eslint-disable no-unused-expressions*/
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

// import socketIOClient from 'socket.io-client';

var _serverCore = require('server/core');

var _fixtures = require('./fixtures');

_chai2['default'].should();

var PORT = 5000;
var HOSTNAME = '127.0.0.1';
var DB = 'test';

describe('App', function () {
  var app = undefined;

  before(function () {
    app = new _serverCore.App(_fixtures.models, _fixtures.config);
  });

  after(function (done) {
    app.close().then(function () {
      return done();
    })['catch'](function () {
      return done();
    });
  });

  describe('interactions with other instances', function () {
    //   let app2;
    //
    //   before(() => {
    //     app2 = new App();
    //   });
    //
    it('allows other Apps to run simultaneously');
    it('shares a common mongoose instance');
  });

  describe('#constructor()', function () {
    it('sets up express and socket.io', function () {
      ['app', 'server', 'io'].forEach(function (key) {
        (0, _chai.expect)(app[key]).to.exist;
      });
    });
  });

  describe('#listen()', function () {
    afterEach(function (done) {
      app.close().then(function () {
        return done();
      })['catch'](function (err) {
        return done(err);
      });
    });

    it('requires a port but not a hostname', function (done) {
      app.listen(PORT).then(function () {
        return done();
      })['catch'](function (err) {
        return done(err);
      });
    });

    it('returns a promise for server.address()', function (done) {
      app.listen(PORT).then(function (address) {
        (0, _chai.expect)(address.address).to.exist;
        (0, _chai.expect)(address.port).to.exist;
        done();
      })['catch'](function (err) {
        return done(err);
      });
    });

    it('causes server to listen on the specified port and address', function (done) {
      app.listen(PORT, HOSTNAME).then(function (adr) {
        adr.port.should.equal(PORT);
        adr.address.should.equal(HOSTNAME);
        done();
      })['catch'](function (err) {
        return done(err);
      });
    });
  });

  describe('#close()', function () {
    beforeEach(function (done) {
      app.listen(PORT).then(function () {
        return done();
      });
    });

    it('closes the server', function (done) {
      app.close().then(function (msg) {
        (0, _chai.expect)(msg).to.be.a.String;
        done();
      })['catch'](done);
    });
  });

  describe('#connectDB()', function () {
    beforeEach(function (done) {
      app.listen(PORT).then(function () {
        return app.disconnectDB();
      }).then(done, done);
    });

    afterEach(function (done) {
      app.close().then(function () {
        return done();
      })['catch'](done);
    });

    it('returns a promise', function (done) {
      app.connectDB(HOSTNAME, DB).then(function () {
        return done();
      })['catch'](done);
    });

    it('connects to an active mongodb instance', function (done) {
      app.connectDB(HOSTNAME, DB).then(function (uri) {
        (0, _chai.expect)(uri).to.equal('mongodb://127.0.0.1/test');
        done();
      })['catch'](done);
    });

    it('defaults to 127.0.0.1/test', function (done) {
      app.connectDB().then(function (uri) {
        (0, _chai.expect)(uri).to.equal('mongodb://127.0.0.1/test');
        done();
      })['catch'](done);
    });

    it('throws on invalid params', function (done) {
      app.connectDB(1029387.42, 'lolol').then(function (uri) {
        return done('Why did this work ' + uri);
      })['catch'](function () {
        return done();
      });
    });
  });

  describe('#addSocket()', function () {
    //   const URI = HOSTNAME + ':' + DB;
    //   let io = socketIOClient('ws://' + URI);
    it('adds a listener socket to all app.models');
  });
});