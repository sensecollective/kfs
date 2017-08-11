'use strict';

var BlockStream = require('../lib/block-stream');
var expect = require('chai').expect;

describe('BlockStream', function() {

  describe('#_flush', function() {

    it('should pad the last chunk with zeros', function(done) {
      var bs = new BlockStream({ chunkSize: 12, padLastChunk: true });
      var buf = Buffer.from([]);
      bs.on('data', function(data) {
        buf = Buffer.concat([buf, data]);
      });
      bs.on('end', function() {
        expect(buf).to.have.lengthOf(24);
        expect(Buffer.compare(buf.slice(18), Buffer(6).fill(0))).to.equal(0);
        done();
      });
      bs.write(Buffer(6).fill(1));
      bs.write(Buffer(6).fill(1));
      bs.write(Buffer(6).fill(1));
      bs.end();
    });

  });

  describe('#_transform', function() {

    it('should return N-sized chunks', function(done) {
      const bs = new BlockStream({ chunkSize: 12, padLastChunk: false });
      const ar = [];
      bs.on('data', data => ar.push(data));
      bs.once('end', function() {
        expect(Buffer.compare(ar.shift(), Buffer.from('ABCDEFGHIJKL')))
        .to
        .equal(0);

        expect(Buffer.compare(ar.shift(), Buffer.from('MNOPQRSTUVWX')))
        .to
        .equal(0);

        expect(Buffer.compare(ar.shift(), Buffer.from('YZ')))
        .to
        .equal(0);

        done();
      });
      bs.write('AB');      
      bs.write('CDEFGHIJKL');
      bs.write('MNOPQRSTUVWXY');
      bs.write('Z');
      bs.end();
    });

  });  

});
