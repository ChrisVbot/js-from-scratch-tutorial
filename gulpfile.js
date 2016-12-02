const gulp = require('gulp');
const babel = require('gulp-babel');
const del = require('del');
const exec = require('child_process').exec;

const paths = {
  allSrcJs: 'src/**/*.js',
  libDir: 'lib',
};

// clean is a task that simply deletes our entire auto-generated lib folder before every build.
// This is typically useful to get rid of old compiled files after renaming or deleting some in src, 
// or to make sure the lib folder is in sync with the src folder if your build fails and you don't notice
// We use the del package to delete files in a way that integrates well with Gulp's stream
gulp.task('clean', () => {
  return del(paths.libDir);
});

// build is where Babel is called to transform all of our source files located under the src and write the transformed ones to lib
// Note, clean is a prerequisite task, i.e. will run before build
gulp.task('build', ['clean'], () => {
  return gulp.src(paths.allSrcJs)
    .pipe(babel())
    .pipe(gulp.dest(paths.libDir));
});

// main is the equivalent of running node . in the prev chapter, except this time, we want to run it on lib/index.js
// Since index.js is the default file Node looks for, we can simply write node lib (we use the libDir variable to keep things DRY)
// The require('child_process').exec and exec part in the task is a native Node function that executes a shell command. 
// We forward stdout to console.log() and return a potential error using gulp.task's callback function. 
// Essentially, just basically running node lib.
gulp.task('main', ['build'], (callback) => {
  exec(`node ${paths.libDir}`, (error, stdout) => {
    console.log(stdout);
    return callback(error);
  });
});

// watch runs the main task when filesystem changes happen in the specified files. 
gulp.task('watch', () => {
  gulp.watch(paths.allSrcJs, ['main']);
});

// default is a special task that will be run if you simply call gulp from the CLI. In our case we want it to run both watch and main (for the first execution)
gulp.task('default', ['watch', 'main']);
