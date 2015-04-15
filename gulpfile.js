var gulp = require('gulp');
var webserver = require('gulp-webserver');
var jsdoc = require("gulp-jsdoc");

var targetDir = ['src/**/*.js', 'docReadme.md'];

gulp.task('jsdoc', [], function(cb) {
  var preprocessSource = function() {
    // you're going to receive Vinyl files as chunks
    function transform(file, cb) {
      // read and modify file contents
      var fileContents = String(file.contents);
      fileContents = fileContents.replace(/(import .*?;)\n/g,
        function(str, group1) {
          return 'jsio("' + group1 + '");';
        });
      file.contents = new Buffer(fileContents);

      // if there was some error, just pass as the first parameter here
      cb(null, file);
    }

    // returning the map will cause your transform function to be called
    // for each one of the chunks (files) you receive. And when this stream
    // receives a 'end' signal, it will end as well.
    //
    // Additionally, you want to require the `event-stream` somewhere else.
    return require('event-stream').map(transform);
  };

  try {
    gulp.src(targetDir)
      .pipe(preprocessSource())
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
