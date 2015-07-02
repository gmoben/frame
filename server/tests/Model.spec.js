import should from 'should';

import {App, Model} from 'server';
import models from './fixtures';

describe('Model', () => {
  let app;

  before(done => {
    app = new App(models, config);
  });

  beforeEach(done => {

  });

  it('automatically creates parent-child relationships', (done) => {
    let album = Album.create({title: 'Kittens'});
    let photos = ['gizmo.jpg', 'luna.png'].map(url => {
      return Photo.create({url, album: album._id});
    });
    Album.find({title})
      .then(album => {
        album.photos.should.be.an.Array();
        album.photos.length.should.be.exactly(2);
      })
  });

  describe('relationships', done => {
    let {Album, Photo} = app.models;

    before(() => {
    });


  });

});

describe('Model relationships', () => {


})
