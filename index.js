require('babel/register');

module.exports = require('require-dir')('.', {
  recurse: true,
  camelcase: true,
});
