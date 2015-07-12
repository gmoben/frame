/*eslint-disable no-process-exit*/
import path from 'path';

import del from 'del';
import gulp from 'gulp';
import gulpHelp from 'gulp-help';
import babel from 'gulp-babel';
import shell from 'gulp-shell';
import mocha from 'gulp-mocha';

import config from 'config';

// Add `gulp help` and inline descriptions
gulpHelp(gulp);

gulp.task('clean', 'Clean build directory.', () => {
  del(config.BUILD_DIR, {force: true});
});

gulp.task('build', 'Compile babel source.', ['clean'], () => {
  gulp.src(['lib/**/*.js', '^lib/**/*.spec.js'])
    .pipe(babel({stage: 0}))
    .pipe(gulp.dest(config.BUILD_DIR));
});

gulp.task('test', 'Run all tests.', ['test:server']);

gulp.task('test:server', 'Run server tests.', () => {
  gulp.src('lib/server/**/*.spec.js')
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
