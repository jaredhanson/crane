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
    
    it('should have path property', function() {
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
  
});
