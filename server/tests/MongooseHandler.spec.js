/*eslint-disable no-unused-expressions*/
import chai, {expect} from 'chai';
chai.should();

import {keys} from 'lodash';

import App from 'server/core/App';
import MongooseHandler from 'server/handlers/MongooseHandler';
import {ModelError} from 'server/errors';
import {models, config} from './fixtures';

import DEFAULT_ROUTES from 'server/constants';

const HOSTNAME = '127.0.0.1';
const DB = 'test';

describe('MongooseHandler', () => {
  let app = new App({}, config);
  let albumHandler = new MongooseHandler(models.Album);
  let photoHandler = new MongooseHandler(models.Photo);

  before(done => {
    app.connectDB(HOSTNAME, DB)
      .then(() => done())
      .catch(done);
  });

  after(done => {
    app.disconnectDB().then(() => done()).catch(done);
  });

  beforeEach(done => {
    [albumHandler, photoHandler].forEach(handler => {
      handler.model.remove().exec(err => {
        if (err) done(err);
        handler.index()
          .then(([result]) => {
            expect(result).to.be.empty;
            done();
          }).catch(done);
      });
    });

  });

  it('automatically creates parent-child relationships', (done) => {
    let title = 'Kittens';
    albumHandler.create({title})
      .then(([album]) => {
        let photos = ['gizmo.jpg', 'luna.png'].map(url => {
          return photoHandler.create({url, album: album._id});
        });
        return Promise.all(photos)
          .then(() => {
            return albumHandler.find({title})
              .then(([[result]]) => {
                expect(result.photos).to.be.an('array');
                expect(result.photos).to.have.length(2);
                album.photos.forEach(photo => {
                  expect(photo.album._id).to.equal(album._id);
                });
                done();
              });
          });
      }).catch(done);
  });

  it('returns promises for all instance methods');

  describe('#constructor()', () => {
    it('uses DEFAULT_ROUTES if none supplied', () => {
      let h2 = new MongooseHandler(models.Album);
      expect(h2.routes).to.equal(DEFAULT_ROUTES);
    });
  });

  describe('#index()', () => {
    it('returns all documents via #find()');

    // it('returns all documents via #find()', done => {
    //   handler.index()
    //     .then(result => {
    //       expect(result).to.equal();//whatever);
    //       done();
    //     }).catch(done);
    // });
  });

  describe('#create()', () => {

    it('creates a model from given props', done => {
      let TITLE = 'Cool Album!';
      albumHandler.create({title: TITLE})
        .then(([result, code]) => {
          expect(result.toObject()).to.contain.keys('title', 'photos');
          expect(result.title).to.equal(TITLE);
          expect(code).to.equal(201);
          done();
        }).catch(done);
    });
  });

  describe('#find()', () => {
    let albumProps = {title: 'Album1'};
    let photoPropsList = [for (i of Array(10).keys()) {url: i + '.jpg'}];

    beforeEach(done => {
      albumHandler.create(albumProps)
        .then(([album]) => {
          return Promise.all([
            for (props of photoPropsList)
              photoHandler.create({album, ...props})
          ]);
        })
        .then(photos => {
          expect(photos).to.have.length(photoPropsList.length);
          done();
        })
        .catch(done);
    });

    it('returns documents matching given props', done => {
      albumHandler.find(albumProps)
        .then(([results]) => {
          expect(results).to.have.length(1);
          let album = results[0];
          [for (k of keys(albumProps))
            expect(album[k]).to.equal(albumProps[k])];
          done();
        })
        .catch(([err]) => {
          done(err);
        });
    });

    it('returns all documents if no props', done => {
      photoHandler.find()
        .then(([results]) => {
          expect(results).to.have.length(photoPropsList.length);
          done();
        })
        .catch(done);
    });

    it('returns nothing if no models are found', done => {
      albumHandler.find({'title': 'Not an album title'})
        .then(([result]) => {
          expect(result).to.be.empty;
          done();
        });
    });

    it('throws if property doesnt exist in model\'s schema definition', done => {
      albumHandler.find({lololol: 'this isn\'t a prop'})
        .then(() => done("This shoudn't have worked!"))
        .catch(([err, code]) => {
          expect(err).to.be.an.instanceof(ModelError);
          expect(code).to.equal(404);
          done();
        });
    });
  });

  describe('#findById()', () => {
    it('returns documents by ID via #find()');
  });

  describe('#update()', () => {
    it('updates a document if present');
    it('throws if not found');
  });

  describe('#remove()', () => {
    it('removes a document if present');
    it('throws if not found');
  });
});
