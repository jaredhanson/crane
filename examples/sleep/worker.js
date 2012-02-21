var crane = require('crane')
  , util = require('util')
  , Adapter = require('crane-amqp').Adapter;

console.log('Sleep Worker');


crane.connect({ adapter: new Adapter(), host: '172.16.176.175' });

crane.work('testing:my-queue:sleep', function(job, done) {
  console.log('Job: ' + job.id);
  console.log('  info: ' + util.inspect(job.info));
  
  setTimeout(function() { done() }, job.info.seconds * 1000);
});
