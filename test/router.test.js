var Router = require('../lib/router');


describe('Router', function() {
  
  describe('with two simple routes', function() {
    var router = new Router();
    
    router.route('foo', function(msg, next) {
      msg.routedToFoo = true;
      next();
    });
    
    router.route('bar', function(msg, next) {
      msg.routedToBar = true;
      next();
    });
    
    it('should have two routes', function() {
      expect(router.arr).to.have.length(2);
    });
    
    it('should dispatch foo', function(done) {
      var msg = {};
      msg.topic = 'foo'
      
      router.middleware(msg, function(err) {
        if (err) { return done(err); }
        expect(msg.routedToFoo).to.be.true;
        expect(msg.routedToBar).to.be.undefined;
        done();
      })
    });
    
    it('should dispatch bar', function(done) {
      var msg = {};
      msg.topic = 'bar'
      
      router.middleware(msg, function(err) {
        if (err) { return done(err); }
        expect(msg.routedToFoo).to.be.undefined;
        expect(msg.routedToBar).to.be.true;
        done();
      })
    });
    
    it('should not dispatch baz', function(done) {
      var msg = {};
      msg.topic = '/baz'
      
      router.middleware(msg, function(err) {
        if (err) { return done(err); }
        expect(msg.routedToFoo).to.be.undefined;
        expect(msg.routedToBar).to.be.undefined;
        done();
      })
    });
  });
  
  describe('with route containing multiple callbacks', function() {
    var router = new Router();
    
    router.route('foo',
      function(msg, next) {
        msg.routedTo = [ '1' ];
        next();
      },
      function(msg, next) {
        msg.routedTo.push('2');
        next();
      },
      function(msg, next) {
        msg.routedTo.push('3');
        next();
      });
      
    it('should dispatch foo', function(done) {
      var msg = {};
      msg.topic = 'foo'
    
      router.middleware(msg, function(err) {
        if (err) { return done(err); }
        expect(msg.routedTo).to.be.an.instanceOf(Array);
        expect(msg.routedTo).to.have.length(3);
        expect(msg.routedTo[0]).to.equal('1');
        expect(msg.routedTo[1]).to.equal('2');
        expect(msg.routedTo[2]).to.equal('3');
        done();
      })
    });
  });

});
