import chai, {expect} from 'chai';
chai.should();

import Handler from '../core/Handler';
import DEFAULT_ROUTES from '../constants';

describe('Handler', () => {
  let handler = new Handler(DEFAULT_ROUTES);
  handler.testFunc = () => 'Hi!';

  describe('#constructor()', () => {
    it('builds and sets the router', () => {
      expect(handler.router).to.be.a('function');
    });
  });

  describe('#handle()', () => {
    it('returns a request handler', () => {
      let func = handler.handle('testFunc', ['body', 'params.id']);
      expect(func).to.be.a('function');
    });
  });
});
