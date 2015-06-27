
var TrackerInstance = Class(function() {

  this.MAX_HISTORY = 2000;

  this.init = function(name) {
    this.name = name;

    this.started = false;
    this.startedAt = 0;
    this.count = 0;
    this.totalTime = 0;

    this.times = [];
  };

  this.addElapsed = function(ms) {
    this.count++;
    this.totalTime += ms;

    this.times.push(ms);

    while (this.times.length > this.MAX_HISTORY) {
      this.times.shift();
    }
  };

  this.getAverage = function() {
    var sum = 0;
    var len = this.times.length
    for (var i = 0; i < len; i++) {
      sum += this.times[i];
    }
    return sum / len;
  };

});

var PerformanceTracker = Class(function() {

  this.DO_TRACKING = true;
  this.now = window.performance.now ? window.performance.now.bind(window.performance) : Date.now;

  this.init = function() {
    this.tracking = {};
  };

  this.start = function(name) {
    if (!this.DO_TRACKING) return;

    var tracking = this.tracking;
    var tracked = tracking[name];
    if (!tracked) {
      tracking[name] = tracked = new TrackerInstance(name);
    }

    if (tracked.started) {
      throw new Error('Tracker already started');
    }

    tracked.started = true;
    tracked.startedAt = this.now();
  };

  this.stop = function(name) {
    if (!this.DO_TRACKING) return;

    var endTime = this.now();

    var tracking = this.tracking;
    var tracked = tracking[name];
    if (!tracked) {
      throw new Error('Tracker doesnt exist');
    }

    if (!tracked.started) {
      throw new Error('Tracker already started');
    }

    tracked.started = false;
    tracked.addElapsed(endTime - tracked.startedAt);
  };

  this.dump = function() {
    if (!this.DO_TRACKING) return;

    var tracking = this.tracking;
    var trackedStats = {};
    for (var name in this.tracking) {
      var tracked = this.tracking[name];
      trackedStats[name] = {
        count: tracked.count,
        total:  tracked.totalTime,
        average: tracked.getAverage()
      };
    }

    console.log(trackedStats);

    return trackedStats;
  };

});

exports = new PerformanceTracker();
