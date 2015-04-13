var gulp = require('gulp');
var webserver = require('gulp-webserver');
var jsdoc = require("gulp-jsdoc");

var targetDir = ['src/**/*.js', 'docReadme.md'];

gulp.task('jsdoc', [], function(cb) {
  try {
    gulp.src(targetDir)
      .pipe(jsdoc.parser())
      .pipe(jsdoc.generator('./out', {
        path: 'ink-docstrap',
        theme: 'superhero',
        linenums: true,
        collapseSymbols: false,
        inverseNav: true,
        syntaxTheme: 'dark' // this apparently does nothing
      }));
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
