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

  describe('with route containing multiple callbacks some of which are skipped', function() {
    var router = new Router();
    
    router.route('foo',
      function(msg, next) {
        msg.routedTo = [ 'a1' ];
        next();
      },
      function(msg, next) {
        msg.routedTo.push('a2');
        next('route');
      },
      function(msg, next) {
        msg.routedTo.push('a3');
        next();
      });
      
    router.route('foo', function(msg, next) {
      msg.routedTo.push('b1');
      next();
    });
    
    it('should dispatch foo', function(done) {
      var msg = {};
      msg.topic = 'foo'
      
      router.middleware(msg, function(err) {
        if (err) { return done(err); }
        expect(msg.routedTo).to.be.an.instanceOf(Array);
        expect(msg.routedTo).to.have.length(3);
        expect(msg.routedTo[0]).to.equal('a1');
        expect(msg.routedTo[1]).to.equal('a2');
        expect(msg.routedTo[2]).to.equal('b1');
        done();
      })
    });
  });
  
  describe('with route that is parameterized', function() {
    var router = new Router();
    
    router.route('news/:year/:month/:day/:slug', function(msg, next) {
      msg.gotParams = [];
      msg.gotParams.push(msg.params['year']);
      msg.gotParams.push(msg.params['month']);
      msg.gotParams.push(msg.params['day']);
      msg.gotParams.push(msg.params['slug']);
      next();
    });
    
    router.route('news/2013/04/20/foo', function(msg, next) {
      msg.blogPage = true;
      next();
    });
    
    it('should dispatch news', function(done) {
      var msg = {};
      msg.topic = 'news/2013/04/20/foo'
      
      router.middleware(msg, function(err) {
        if (err) { return done(err); }
        expect(msg.gotParams).to.have.length(4);
        expect(msg.gotParams[0]).to.equal('2013');
        expect(msg.gotParams[1]).to.equal('04');
        expect(msg.gotParams[2]).to.equal('20');
        expect(msg.gotParams[3]).to.equal('foo');
        expect(msg.blogPage).to.be.true;
        done();
      })
    });
  });
  
  describe('with route that encounters an error', function() {
    var router = new Router();
    
    router.route('foo', function(msg, next) {
      next(new Error('something went wrong'));
    });
    
    it('should dispatch foo', function(done) {
      var msg = {};
      msg.topic = 'foo'
      
      router.middleware(msg, function(err) {
        expect(err).to.not.be.undefined;
        expect(err.message).to.equal('something went wrong');
        done();
      })
    });
  });
  
  describe('with route that throws an exception', function() {
    var router = new Router();
    
    router.route('foo', function(msg, next) {
      throw new Error('something went horribly wrong');
    });
    
    it('should dispatch foo', function(done) {
      var msg = {};
      msg.topic = 'foo'
      
      router.middleware(msg, function(err) {
        expect(err).to.not.be.undefined;
        expect(err.message).to.equal('something went horribly wrong');
        done();
      })
    });
  });
  
  describe('with route containing error handling that is not called', function() {
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
      function(err, msg, next) {
        msg.routedTo.push('error');
        next();
      });
    
    it('should dispatch foo', function(done) {
      var msg = {};
      msg.topic = 'foo'
      
      router.middleware(msg, function(err) {
        if (err) { return done(err); }
        expect(msg.routedTo).to.be.an.instanceOf(Array);
        expect(msg.routedTo).to.have.length(2);
        expect(msg.routedTo[0]).to.equal('1');
        expect(msg.routedTo[1]).to.equal('2');
        done();
      })
    });
  });
  
  describe('with route containing error handling that is called', function() {
    var router = new Router();
    
    router.route('foo',
      function(msg, next) {
        msg.routedTo = [ '1' ];
        next(new Error('1 error'));
      },
      function(msg, next) {
        msg.routedTo.push('2');
        next();
      },
      function(err, msg, next) {
        msg.routedTo.push(err.message);
        next();
      });
    
    it('should dispatch foo', function(done) {
      var msg = {};
      msg.topic = 'foo'
      
      router.middleware(msg, function(err) {
        if (err) { return done(err); }
        expect(msg.routedTo).to.be.an.instanceOf(Array);
        expect(msg.routedTo).to.have.length(2);
        expect(msg.routedTo[0]).to.equal('1');
        expect(msg.routedTo[1]).to.equal('1 error');
        done();
      })
    });
  });

});
