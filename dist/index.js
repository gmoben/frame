// Relative require()
'use strict';

process.env.NODE_PATH = __dirname;
require('module').Module._initPaths();

module.exports = require('require-dir')('.', {
  recurse: true,
  camelcase: true
});

/** Export mongoose for requiring applications to use indirectly. */
module.exports.mongoose = require('mongoose');