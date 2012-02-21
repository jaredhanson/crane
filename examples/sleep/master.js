var crane = require('crane')
  , Adapter = require('crane-amqp').Adapter;

console.log('Sleep Master');


crane.connect({ adapter: new Adapter(), host: '172.16.176.175' });

function submitJob()  {
  console.log('submitting job...')
  crane.job('testing:my-queue:sleep', { seconds: 5 })
    .delay(2000)
    .submit();
}

// declare job types
crane.job('testing:my-queue:sleep', function() {
  submitJob();
});
