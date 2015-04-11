var gulp = require('gulp');
var webserver = require('gulp-webserver');
var jsdoc = require("gulp-jsdoc");

var targetDir = 'src/**/*.js';

gulp.task('jsdoc', [], function(cb) {
  try {
    gulp.src(targetDir)
      .pipe(jsdoc('out'));
  }
  catch (e) {
    console.error('Error while executing jsdoc');
  }
  cb();
});

gulp.task('watch', ['jsdoc'], function() {
  gulp.watch(targetDir, ['jsdoc']);
});

gulp.task('webserver', function() {
  gulp.src('')
    .pipe(webserver({
      host: '0.0.0.0',
      livereload: true,
      directoryListing: true,
      open: false,
      defaultFile: 'index.html'
    }));
});

gulp.task('default', ['watch', 'webserver'], function() {
});
