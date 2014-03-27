/* global describe, it, expect */

var crane = require('..');

describe('crane', function() {
  
  it('should export function', function() {
    expect(crane).to.be.a('function');
  });
  
  it('should export create', function() {
    expect(crane.create).to.be.a('function');
    expect(crane.create).to.equal(crane);
  });
  
});
