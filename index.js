require('babel/register');

module.exports = require('require-dir')('.', {
  recurse: true,
  camelcase: true
});

/** Export mongoose for requiring applications to use indirectly. */
module.exports.mongoose = require('mongoose');
