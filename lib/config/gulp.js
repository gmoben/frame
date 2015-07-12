/*eslint-disable no-process-exit*/
import path from 'path';

import del from 'del';
import gulp from 'gulp';
import gulpHelp from 'gulp-help';
import babel from 'gulp-babel';
import shell from 'gulp-shell';
import mocha from 'gulp-spawn-mocha';

import config from 'config';

// Add `gulp help` and inline descriptions
gulpHelp(gulp);

function build(src, dest=config.BUILD_DIR) {
  return gulp.src(src)
    .pipe(babel({stage: 0}))
    .pipe(gulp.dest(dest));
}

function test(src, reporter='spec', istanbul=true) {
  return gulp.src(src)
    .pipe(mocha({
      env: {
        NODE_PATH: config.ROOT
      },
      istanbul: istanbul,
      reporter: reporter,
      compilers: 'js:babel/register'
    }))
    .on('end', function() { this._child.kill('SIGHUP'); })
    .once('error', err => {
      throw err;
    });
}

gulp.task('clean', 'Clean build directory.', () => {
  return del(config.BUILD_DIR, {force: true});
});

gulp.task('build', 'Compile source.', ['clean'], () => {
  return build('lib/**/*.js');
});

gulp.task('build:tests', 'Compile tests.', () => {
  return build('lib/**/tests/**');
});

gulp.task('test', 'Run all tests.', ['test:lib', 'test:build']);

gulp.task('test:lib', 'Run uncompiled tests on uncompiled code.', () => {
  return test('lib/server/**/*.spec.js');
});

gulp.task('test:build', 'Run compiled tests on compiled code.', ['build:tests'], () => {
  return test(path.join(config.BUILD_DIR, '**/*.spec.js'), 'nyan', false);
});

gulp.task('mongo', 'Launch mongodb.', () => {
  return gulp.src('')
    .pipe(shell([
      'mongod',
      '--dbpath=' + path.join(config.ROOT, '.data/db')
    ].join(' '), {
      cwd: config.ROOT
    }));
});

export default gulp;
