function Scheduler() {
}

Scheduler.prototype.schedule = function(job, ms, cb) {
  setTimeout(function() {
    job.delay(0).submit();
  }, ms);
  
  return cb();
}


module.exports = Scheduler;
