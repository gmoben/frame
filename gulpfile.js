// Relative require()
process.env.NODE_PATH = __dirname;
require('module').Module._initPaths();

// Enable ES6
require('babel/register');

// Setup tasks
require('config/gulp');
