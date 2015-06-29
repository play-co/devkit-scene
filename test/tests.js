var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

// TODO: how to install devkit fuzz test?
var devkitFuzz = require('devkitFuzzTest/');

var TMP_DIR = './tmp';


// See: http://www.geedew.com/remove-a-directory-that-is-not-empty-in-nodejs/
var deleteFolderRecursive = function(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};


/// SETUP ///

// Get a list of all examples
var examples = fs.readdirSync('./examples')
  .filter(function(value) {
    return value.match('.*?\.js');
  });

// Set up the template-scene project in a temp folder
var cloneTemplate = function(cb) {
  console.log('Cloning template-scene');
  if (fs.existsSync(TMP_DIR)) {
    deleteFolderRecursive(TMP_DIR);
  }

  var cmd = 'git clone https://github.com/gameclosure/template-scene ' + TMP_DIR;
  exec(cmd, function (error, stdout, stderr) {
    if (error) throw error;

    console.log('Running devkit-install');
    cmd = 'devkit install';
    exec(cmd, {cwd: TMP_DIR}, function (error, stdout, stderr) {
      if (error) throw error;
      cb();
    });
  });
};

var setTemplateExample = function(exampleName) {
  console.log('Setting example: ' + exampleName);
  var examplePath = path.join(__dirname, '..', 'examples', exampleName);
  var destPath = path.join(TMP_DIR, 'src', 'Application.js');
  // Remove the old one
  if (fs.existsSync(destPath)) {
    fs.unlinkSync(destPath);
  }
  // Copy
  fs.writeFileSync(destPath, fs.readFileSync(examplePath, 'utf8'));
}

var testExample = function(exampleName, cb) {
  console.log('Testing example: ' + exampleName);
  // link into the template project
  setTemplateExample(exampleName);
  // run 'devkit debug browser-mobile'
  console.log('Running devkit browser-mobile build');
  exec('devkit debug browser-mobile', {cwd: TMP_DIR}, function(err){
    if (err) throw err;

    var test = new devkitFuzz.PhantomTest({
      url: path.join(TMP_DIR, 'build', 'debug', 'browser-mobile', 'index.html'),
      name: 'testgame',
      tests: [
        devkitFuzz.tests.FuzzTest
      ]
    });
    test.runTest()
      .then(function() {
        console.log('> Test passed, continuing');
        cb();
      }, function() {
        console.error('> Test failed!');
        cb(new Error('Fuzz failed:' + exampleName));
      });
  });
}

/// --- ///



describe('examples', function() {
  this.timeout(0);

  it('fuzz', function(done) {
    // Bit of a hack, need to clone the template and then synchronously go through each example
    cloneTemplate(function() {
      var untestedExamples = examples.splice(0);
      var fn = function(err) {
        if (err) throw err;

        if (untestedExamples.length > 0) {
          testExample(untestedExamples.shift(), fn);
        } else {
          done();
          return;
        }
      }
      fn();
    });
  });

});

