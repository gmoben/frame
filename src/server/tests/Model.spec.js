
import chai, {expect} from 'chai';
chai.should();

import Model from '../core/Model';
import MongooseHandler from '../handlers/MongooseHandler';
import {ModelError} from '../errors';

import DEFAULT_ROUTES from '../constants';

const MODEL_NAME = 'ModelExample';
const HANDLER = MongooseHandler;

describe('Model', () => {
  describe('#constructor()', function() {
    let model = new Model({
      name: MODEL_NAME,
      routes: DEFAULT_ROUTES
    }, HANDLER);

    it('requires a model name if not a subclass', () => {
      expect(model.modelName).to.equal(MODEL_NAME);

      try {
        /*eslint-disable no-new*/
        new Model({routes: DEFAULT_ROUTES}, HANDLER);
        /*eslint-enable no-new*/
      } catch (err) {
        expect(err).to.be.an.instanceOf(ModelError);
      }
    });

    it('creates a handler instance from supplied Handler class', () => {
      expect(model.handler).to.be.an.instanceOf(HANDLER);
    });

    it('assigns handler functions to itself', () => {
      let hProps = Object.getOwnPropertyNames(model.handler.__proto__);
      hProps.forEach(prop => {
        if (prop !== 'constructor') {
          expect(model[prop]).to.be.a('function');
          expect(model[prop]).to.equal(model.handler[prop]);
        }
      });
    });

    it('holds a reference to the handler\'s router instance', () => {
      expect(model.router).to.equal(model.handler.router);
    });

  });
});
