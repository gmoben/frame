var path = require('path');

// Relative require()
process.env.NODE_PATH = path.join(__dirname, 'src');
require('module').Module._initPaths();

// Enable ES6
require('babel/register');

// ES6 gulpfile
require('config/gulp');
