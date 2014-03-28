var crane = require('..');


describe('application', function() {
  
  describe('newly initialized app', function() {
    var app = crane();
    
    it('should have root topic', function() {
      expect(app.topic).to.equal('');
    });
    
    it('should have default settings', function() {
      expect(app.get('env')).to.equal('development');
      expect(app.get('case sensitive routing')).to.equal(true);
    });
  });
  
  describe('settings', function() {
    var app = crane();
    
    it('should get and set settings', function() {
      app.set('foo', 'bar');
      expect(app.get('foo')).to.equal('bar');
    });
    
    it('should enable flags', function() {
      app.enable('baz');
      expect(app.get('baz')).to.be.true;
      expect(app.enabled('baz')).to.be.true;
      expect(app.disabled('baz')).to.be.false;
    });
    
    it('should disable flags', function() {
      app.disable('baz');
      expect(app.get('baz')).to.be.false;
      expect(app.enabled('baz')).to.be.false;
      expect(app.disabled('baz')).to.be.true;
    });
  });
  
});
