var Route = require('../lib/route');


describe('Route', function() {
  
  describe('with topic', function() {
    var route = new Route('welcome', [ function(){} ]);
    
    it('should have topic property', function() {
      expect(route.topic).to.equal('welcome');
    });
    
    it('should have fns property', function() {
      expect(route.fns).to.be.instanceof(Array);
      expect(route.fns).to.have.length(1);
    });
    
    it('should match correctly', function() {
      expect(route.match('welcome')).to.be.true;
      expect(route.match('not-welcome')).to.be.false;
    });
  });
  
  describe('with parameterized topic', function() {
    var route = new Route('news/:year/:month/:day', [ function(){} ]);
    
    it('should have topic property', function() {
      expect(route.topic).to.equal('news/:year/:month/:day');
    });
    
    it('should have fns property', function() {
      expect(route.fns).to.be.instanceof(Array);
      expect(route.fns).to.have.length(1);
    });
    
    it('should match correctly', function() {
      var params = [];
      expect(route.match('news/2013/04/18', params)).to.be.true;
      expect(Object.keys(params)).to.have.length(3);
      expect(params.year).to.equal('2013');
      expect(params.month).to.equal('04');
      expect(params.day).to.equal('18');
      
      expect(route.match('news/2013/04')).to.be.false;
      expect(route.match('not-news/2013/04/18')).to.be.false;
    });
  });
  
  describe('with regular expression parameterized topic', function() {
    var route = new Route(/^commits\/(\w+)(?:\.\.(\w+))?$/, [ function(){} ]);
    
    it('should have topic property', function() {
      expect(route.topic).to.be.an.instanceOf(RegExp);
    });
    
    it('should have fns property', function() {
      expect(route.fns).to.be.instanceof(Array);
      expect(route.fns).to.have.length(1);
    });
    
    it('should match correctly', function() {
      var params = [];
      expect(route.match('commits/71dbb9c..4c084f9', params)).to.be.true;
      expect(Object.keys(params)).to.have.length(2);
      expect(params[0]).to.equal('71dbb9c');
      expect(params[1]).to.equal('4c084f9');
      
      expect(route.match('commits/71dbb9c..')).to.be.false;
      expect(route.match('not-commits/71dbb9c..4c084f9')).to.be.false;
    });
  });
  
});
