/*eslint-disable no-unused-expressions*/
'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _lodash = require('lodash');

var _coreApp = require('../core/App');

var _coreApp2 = _interopRequireDefault(_coreApp);

var _handlersMongooseHandler = require('../handlers/MongooseHandler');

var _handlersMongooseHandler2 = _interopRequireDefault(_handlersMongooseHandler);

var _errors = require('../errors');

var _fixtures = require('./fixtures');

var _constants = require('../constants');

_chai2['default'].should();

var HOSTNAME = '127.0.0.1';
var DB = 'test';

describe('MongooseHandler', function () {
  var app = new _coreApp2['default']({}, _fixtures.config);
  var albumHandler = new _handlersMongooseHandler2['default'](_fixtures.models.Album);
  var photoHandler = new _handlersMongooseHandler2['default'](_fixtures.models.Photo);

  before(function (done) {
    app.connectDB(HOSTNAME, DB).then(function () {
      return done();
    })['catch'](done);
  });

  after(function (done) {
    app.disconnectDB().then(function () {
      return done();
    })['catch'](done);
  });

  beforeEach(function (done) {
    [albumHandler, photoHandler].forEach(function (handler) {
      handler.model.remove().exec(function (err) {
        if (err) done(err);
        handler.index().then(function (_ref2) {
          var _ref22 = _slicedToArray(_ref2, 1);

          var result = _ref22[0];

          (0, _chai.expect)(result).to.be.empty;
          done();
        })['catch'](done);
      });
    });
  });

  it('automatically creates parent-child relationships', function (done) {
    var title = 'Kittens';
    albumHandler.create({ title: title }).then(function (_ref3) {
      var _ref32 = _slicedToArray(_ref3, 1);

      var album = _ref32[0];

      var photos = ['gizmo.jpg', 'luna.png'].map(function (url) {
        return photoHandler.create({ url: url, album: album._id });
      });
      return Promise.all(photos).then(function () {
        return albumHandler.find({ title: title }).then(function (_ref4) {
          var _ref42 = _slicedToArray(_ref4, 1);

          var _ref42$0 = _slicedToArray(_ref42[0], 1);

          var result = _ref42$0[0];

          (0, _chai.expect)(result.photos).to.be.an('array');
          (0, _chai.expect)(result.photos).to.have.length(2);
          album.photos.forEach(function (photo) {
            (0, _chai.expect)(photo.album._id).to.equal(album._id);
          });
          done();
        });
      });
    })['catch'](done);
  });

  // it('returns promises for all instance methods', done => {
  //   console.log(Object.getOwnPropertyNames(albumHandler.__proto__));
  //   done();
  // });

  describe('#constructor()', function () {
    it('uses DEFAULT_ROUTES if none supplied', function () {
      var h2 = new _handlersMongooseHandler2['default'](_fixtures.models.Album);
      (0, _chai.expect)(h2.routes).to.equal(_constants.DEFAULT_ROUTES);
    });
  });

  describe('#index()', function () {
    it('returns all documents via #find()');

    // it('returns all documents via #find()', done => {
    //   handler.index()
    //     .then(result => {
    //       expect(result).to.equal();//whatever);
    //       done();
    //     }).catch(done);
    // });
  });

  describe('#create()', function () {

    it('creates a model from given props', function (done) {
      var TITLE = 'Cool Album!';
      albumHandler.create({ title: TITLE }).then(function (_ref5) {
        var _ref52 = _slicedToArray(_ref5, 2);

        var result = _ref52[0];
        var code = _ref52[1];

        (0, _chai.expect)(result.toObject()).to.contain.keys('title', 'photos');
        (0, _chai.expect)(result.title).to.equal(TITLE);
        (0, _chai.expect)(code).to.equal(201);
        done();
      })['catch'](done);
    });
  });

  describe('#find()', function () {
    var albumProps = { title: 'Album1' };
    var photoPropsList = (function () {
      var _photoPropsList = [];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = Array(10).keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var i = _step.value;

          _photoPropsList.push({ url: i + '.jpg' });
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator['return']) {
            _iterator['return']();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return _photoPropsList;
    })();

    beforeEach(function (done) {
      albumHandler.create(albumProps).then(function (_ref6) {
        var _ref62 = _slicedToArray(_ref6, 1);

        var album = _ref62[0];

        return Promise.all((function () {
          var _Promise$all = [];
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = photoPropsList[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var props = _step2.value;

              _Promise$all.push(photoHandler.create(_extends({ album: album }, props)));
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                _iterator2['return']();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }

          return _Promise$all;
        })());
      }).then(function (photos) {
        (0, _chai.expect)(photos).to.have.length(photoPropsList.length);
        done();
      })['catch'](done);
    });

    it('returns documents matching given props', function (done) {
      albumHandler.find(albumProps).then(function (_ref7) {
        var _ref72 = _slicedToArray(_ref7, 1);

        var results = _ref72[0];

        (0, _chai.expect)(results).to.have.length(1);
        var album = results[0];
        (function () {
          var _ref = [];
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = (0, _lodash.keys)(albumProps)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var k = _step3.value;

              _ref.push((0, _chai.expect)(album[k]).to.equal(albumProps[k]));
            }
          } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion3 && _iterator3['return']) {
                _iterator3['return']();
              }
            } finally {
              if (_didIteratorError3) {
                throw _iteratorError3;
              }
            }
          }

          return _ref;
        })();
        done();
      })['catch'](function (_ref8) {
        var _ref82 = _slicedToArray(_ref8, 1);

        var err = _ref82[0];

        done(err);
      });
    });

    it('returns all documents if no props', function (done) {
      photoHandler.find().then(function (_ref9) {
        var _ref92 = _slicedToArray(_ref9, 1);

        var results = _ref92[0];

        (0, _chai.expect)(results).to.have.length(photoPropsList.length);
        done();
      })['catch'](done);
    });

    it('returns nothing if no models are found', function (done) {
      albumHandler.find({ 'title': 'Not an album title' }).then(function (_ref10) {
        var _ref102 = _slicedToArray(_ref10, 1);

        var result = _ref102[0];

        (0, _chai.expect)(result).to.be.empty;
        done();
      });
    });

    it('throws if property doesnt exist in model\'s schema definition', function (done) {
      albumHandler.find({ lololol: 'this isn\'t a prop' }).then(function () {
        return done('This shoudn\'t have worked!');
      })['catch'](function (_ref11) {
        var _ref112 = _slicedToArray(_ref11, 2);

        var err = _ref112[0];
        var code = _ref112[1];

        (0, _chai.expect)(err).to.be.an['instanceof'](_errors.ModelError);
        (0, _chai.expect)(code).to.equal(404);
        done();
      });
    });
  });

  describe('#findById()', function () {
    it('returns documents by ID via #find()');
  });

  describe('#update()', function () {
    it('updates a document if present');
    it('throws if not found');
  });

  describe('#remove()', function () {
    it('removes a document if present');
    it('throws if not found');
  });
});
//# sourceMappingURL=../tests/MongooseHandler.spec.js.map