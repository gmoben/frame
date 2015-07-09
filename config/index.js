import defaults from 'lodash/object/defaults';
import path from 'path';

let constants = {
  ROOT: path.join(__dirname, '..'),
  PARENT: path.join(__dirname, '../..')
};

let dir = require('require-dir')('.', {
  recurse: true,
  camelcase: true
});

export default defaults(constants, dir);
