/*eslint-disable no-process-exit*/
import path from 'path';

import gulp from 'gulp';
import gulpHelp from 'gulp-help';
import shell from 'gulp-shell';
import mocha from 'gulp-mocha';

import config from 'config';

// Add `gulp help` and inline descriptions
gulpHelp(gulp);

gulp.task('test', 'Run all tests.', ['test:server'], () => {});

gulp.task('test:server', 'Run server tests.', () => {
  gulp.src('server/**/*.spec.js')
    .pipe(mocha({
      reporter: 'spec',
      compilers: 'js:babel/register'
    }))
    .once('end', () => process.exit())
    .once('error', err => {
      throw err;
    });
});

gulp.task('mongo', () => {
  gulp.src('')
    .pipe(shell([
      'mongod',
      '--dbpath=' + path.join(config.ROOT, '.data/db')
    ].join(' '), {
      cwd: config.ROOT
    }));
});

export default gulp;
