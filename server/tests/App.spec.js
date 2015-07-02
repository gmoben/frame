import chai, {expect, assert} from 'chai';
import SocketIOClient from 'socket.io-client';
import App from 'server/App';
import models from './fixtures';
import {ModelFactory} from 'server/Model';

chai.should();

const PORT = 5000;
const HOSTNAME = 'localhost';
const DB = 'test';

describe('App', () => {
  let app;

  before(() => {
    app = new App(models, config);
  });

  after(() => {
    app.close();
  });

  describe('interactions with other instances', () => {
    let app2;
    let 

    before(() => {
      app2 = new App();
    })
    it('allows other Apps to run simultaneously');
    it('shares a common mongoose instance');
  });

  describe('#constructor()', () => {
    it('sets up express and socket.io', () => {
      ['app', 'server', 'io'].forEach(key => {
        expect(app).to.have.key(key);
        expect(app[key]).to.exist();
      });
    });
  });

  describe('#listen()', () => {
    afterEach(done => {
      app.close()
        .then(() => done())
        .catch(err => {throw err;});
    });

    it('requires a port but not a hostname', () => {
      app.listen(PORT)
        .then(() => app.close())
        .then(() => app.listen())
        .catch(err => done())
        .then(() => {
          throw Error('Supposed to require a hostname');
        });
    })

    it('returns a promise for server.address()', () => {
      let promise = app.listen(PORT);
      promise.should.be.a.Promise();
      promise.then(address => {
        address.should.have.keys('address', 'port');
        done();
      })
    });

    it('causes server to listen on the specified port and address', done => {
      app.listen(PORT, HOSTNAME)
        .then(adr => {
          adr.port.should.equal(PORT);
          adr.address.should.equal(HOSTNAME);
          done();
        }).catch(err => done(err));
    });

    it('sets app.ioClient', done => {
      app.listen(PORT,HOSTNAME)
        .then(() => {
          should.exist(app.ioClient);
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
          msg.should.be.a.String();
          done();
        }).catch(err => {throw err;});
    });

    it('deletes app.ioClient', done => {
      app.close()
        .then(() => {
          app.should.not.have.key('ioClient');
          done();
        });
    });
  });

  describe('#connectDB()', () => {
    beforeEach(done => {
      app.listen(PORT).then(() => done());
    });

    afterEach(done => {
      mongoose.disconnect();
    });

    it('returns a promise', done => {
      let promise = app.connectDB(HOSTNAME, DB);
      promise.should.be.a.Promise();
      promise.then(() => done());
    });

    it('connects to an active mongodb instance', done => {
      app.connectDB(HOSTNAME, DB)
        .then(uri => {
          expect(uri).to.be('mongodb://' + HOSTNAME + ':' + DB);
          done();
        })
    });

    it('defaults to localhost/test', done => {
      app.connectDB()
        .then(uri => {
          expect(uri).to.be('mongodb://localhost/test');
          done();
        })
    })

    it('throws on invalid params', done => {
      app.connectDB(1029387.42, 'lolol')
        .then(uri => done('Why did this work ' + uri))
        .catch(() => done());
    });
  });

  describe('#addSocket()', () => {
    let io = SocketIOClient('ws://' + uri);
    it('adds a listener socket to all app.models', () => {

    });
  })

});
