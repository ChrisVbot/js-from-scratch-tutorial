/* eslint-disable import/no-extraneous-dependencies */

import gulp from 'gulp';
import babel from 'gulp-babel';
import del from 'del';
import eslint from 'gulp-eslint';
import webpack from 'webpack-stream';
import mocha from 'gulp-mocha';
import flow from 'gulp-flowtype';
import webpackConfig from './webpack.config.babel';

const paths = {
  allSrcJs: 'src/**/*.js?(x)',
  serverSrcJs: 'src/server/**/*.js?(x)',
  sharedSrcJs: 'src/shared/**/*.js?(x)',
  clientEntryPoint: 'src/client/app.jsx',
  gulpFile: 'gulpfile.babel.js',
  webpackFile: 'webpack.config.babel.js',
  libDir: 'lib',
  distDir: 'dist',
  clientBundle: 'dist/client-bundle.js?(.map)',
  allLibTests: 'lib/test/**/*.js',
};

// clean is a task that simply deletes our entire auto-generated lib folder
// before every build.
// This is typically useful to get rid of old compiled files after renaming or
// deleting some in src,
// or to make sure the lib folder is in sync with the src folder if your build
// fails and you don't notice
// We use the del package to delete files in a way that integrates well with Gulp's stream
gulp.task('clean', () => del([
  paths.libDir,
  paths.clientBundle,
]));

// build is where Babel is called to transform all of our source files located under
// the src and write the transformed ones to lib
// Note, clean is a prerequisite task, i.e. will run before build
gulp.task('build', ['lint', 'clean'], () =>
  gulp.src(paths.allSrcJs)
    .pipe(babel())
    .pipe(gulp.dest(paths.libDir)),
);

// main is the equivalent of running node . in the prev chapter,
// except this time, we want to run it on lib/index.js
// Since index.js is the default file Node looks for, we can simply
// write node lib (we use the libDir variable to keep things DRY)
// The require('child_process').exec and exec part in the task is
// a native Node function that executes a shell command.
// We forward stdout to console.log() and return a potential
// error using gulp.task's callback function.
// Essentially, just basically running node lib.
gulp.task('main', ['test'], () =>
  gulp.src(paths.clientEntryPoint)
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest(paths.distDir)),
);

// watch runs the main task when filesystem changes happen in the specified files.
gulp.task('watch', () => {
  gulp.watch(paths.allSrcJs, ['main']);
});

// Here we tell Gulp that for this task, we want to include gulpfile.babel.js,
// and the JS files located under src.
gulp.task('lint', () =>
  gulp.src([
    paths.allSrcJs,
    paths.gulpFile,
    paths.webpackFile,
  ])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .pipe(flow({ abort: true })),
);

gulp.task('test', ['build'], () =>
  gulp.src(paths.allLibTests)
    .pipe(mocha()),
);

// default is a special task that will be run if you simply call gulp from the CLI.
// In our case we want it to run both watch and main (for the first execution)
gulp.task('default', ['watch', 'main']);
