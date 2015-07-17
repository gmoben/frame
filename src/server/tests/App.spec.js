/*eslint-disable no-unused-expressions*/
import chai, {expect} from 'chai';

// import socketIOClient from 'socket.io-client';
import {App} from 'server/core';
import {models, config} from './fixtures';

chai.should();

const PORT = 5000;
const HOSTNAME = '127.0.0.1';
const DB = 'test';

describe('App', () => {
  let app;

  before(() => {
    app = new App(models, config);
  });

  after(done => {
    app.close()
      .then(() => done())
      .catch(() => done());
  });

  describe('interactions with other instances', () => {
    //   let app2;
    //
    //   before(() => {
    //     app2 = new App();
    //   });
    //
    it('allows other Apps to run simultaneously');
    it('shares a common mongoose instance');
  });

  describe('#constructor()', () => {
    it('sets up express and socket.io', () => {
      ['app', 'server', 'io'].forEach(key => {
        expect(app[key]).to.exist;
      });
    });
  });

  describe('#listen()', () => {
    afterEach(done => {
      app.close()
        .then(() => done())
        .catch(err => done(err));
    });

    it('requires a port but not a hostname', done => {
      app.listen(PORT)
        .then(() => done())
        .catch(err => done(err));
    });

    it('returns a promise for server.address()', done => {
      app.listen(PORT)
        .then(address => {
          expect(address.address).to.exist;
          expect(address.port).to.exist;
          done();
        })
        .catch(err => done(err));
    });

    it('causes server to listen on the specified port and address', done => {
      app.listen(PORT, HOSTNAME)
        .then(adr => {
          adr.port.should.equal(PORT);
          adr.address.should.equal(HOSTNAME);
          done();
        }).catch(err => done(err));
    });

  });

  describe('#close()', () => {
    beforeEach(done => {
      app.listen(PORT).then(() => done());
    });

    it('closes the server', done => {
      app.close()
        .then(msg => {
          expect(msg).to.be.a.String;
          done();
        }).catch(done);
    });

  });

  describe('#connectDB()', () => {
    beforeEach(done => {
      app.listen(PORT)
        .then(() => app.disconnectDB())
        .then(done, done);
    });

    afterEach(done => {
      app.close().then(() => done()).catch(done);
    });

    it('returns a promise', done => {
      app.connectDB(HOSTNAME, DB)
        .then(() => done())
        .catch(done);
    });

    it('connects to an active mongodb instance', done => {
      app.connectDB(HOSTNAME, DB)
        .then(uri => {
          expect(uri).to.equal('mongodb://127.0.0.1/test');
          done();
        })
        .catch(done);
    });

    it('defaults to 127.0.0.1/test', done => {
      app.connectDB()
        .then(uri => {
          expect(uri).to.equal('mongodb://127.0.0.1/test');
          done();
        })
        .catch(done);
    });

    it('throws on invalid params', done => {
      app.connectDB(1029387.42, 'lolol')
        .then(uri => done('Why did this work ' + uri))
        .catch(() => done());
    });
  });

  describe('#addSocket()', () => {
    //   const URI = HOSTNAME + ':' + DB;
    //   let io = socketIOClient('ws://' + URI);
    it('adds a listener socket to all app.models');
  });

});
