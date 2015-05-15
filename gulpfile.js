var path = require('path');
var fs = require('fs');
var gulp = require('gulp');
var cliArgs = require("command-line-args");

var UglifyJS = require("uglify-js");

var modulesDir = path.join(__dirname, 'node_modules');

var cli = cliArgs([
  { name: "min", type: Boolean, description: "Compress output" }
]);
var argv = cli.parse();

var paths = {
  'js': 'src',
  'dest': 'dist/',

  'jsio': path.join(modulesDir, 'jsio', 'packages'),
  'squill': path.join(modulesDir, 'squill')
};

var buildPathCache = function(modules) {
  var pathCache = {};
  for (var i = 0; i < modules.length; i++) {
    var module = modules[i];

    var moduleDir = path.join(modulesDir, module);
    var modulePackageConfig = require(path.join(moduleDir, 'package.json'));
    var clientPaths = modulePackageConfig.devkit.clientPaths;

    for (var clientPathName in clientPaths) {
      var clientPath = path.join(moduleDir, clientPaths[clientPathName])
      if (clientPathName === '*') {
        var files = fs.readdirSync(clientPath);
        for (var j = 0; j < files.length; j++) {
          var file = files[j];
          var importName = file.replace(/\.[^/.]+$/, '');

          pathCache[importName] = path.join(clientPath, importName);
        }
      } else {
        pathCache[clientPathName] = clientPath;
      }
    }
  }

  return pathCache;
};

gulp.task('compile', [], function(cb) {
  var jsio = require('jsio');
  var compilerPath = path.join(jsio.__env.getPath(), '..', 'compilers');
  jsio.path.add(compilerPath);


  var pathCache = buildPathCache([
    'devkit-core',
    'timestep',
    'devkit-effects',
    'devkit-parallax',
    'devkit-entities',
    'devkit-accelerometer',
    'community-art'
  ]);
  pathCache['squill'] = paths.squill;
  pathCache['src'] = paths.js;


  console.log('jsio:', jsio.path.cache);
  var compiler = jsio('import jsio_compile.compiler');
  compiler.start(['jsio_compile', paths.js, 'import .src.index'], {
    cwd: __dirname,
    path: [paths.jsio],
    pathCache: pathCache,

    environment: 'browser',
    includeJsio: true,
    appendImport: true,
    compressSources: argv.min,
    compressResult: argv.min,
    interface: {
      setCompiler: function (compiler) { this.compiler = compiler; },
      run: function (args, opts) { this.compiler.run(args, opts); },
      onError: function (err) {
        cb && cb(err);
      },
      onFinish: function (opts, code) {
        if (!fs.existsSync(paths.dest)) {
          fs.mkdirSync(paths.dest);
        }

        var filename = path.join(paths.dest, argv.min ? 'scene.min.js' : 'scene.js');
        fs.writeFile(filename, code, cb);
      },
      compress: function (filename, src, opts, cb) {
        var result = UglifyJS.minify(src, {
          fromString: true,
          compress: {
            global_defs: {
              DEBUG: false
            }
          }
        });

        // console.log(filename, '-->', result.code)
        cb(result.code);
      }
    }
  });
});

gulp.task('help', [], function(cb) {
  console.log(cli.getUsage());
  cb();
});
