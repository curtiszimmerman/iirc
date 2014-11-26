/**
 * @project node-irc-client
 * IRC client module
 * @file irc.test.js
 * primary application driver unit tests
 * @author curtis zimmerman
 * @contact curtis.zimmerman@gmail.com
 * @license GPLv3
 * @version 0.0.1a
 */

var __test = (function() {
	"use strict";

	var $iirc = require('../iirc.js');
	
	var expect = require('chai').expect;
	
	describe('iirc', function() {
		describe('#util.getID()', function() {
			it('should return a string', function() {
				expect(typeof($iirc.__test.util.getID())).to.equal("string");
			});
			it('should return a four-character string if given zero parameters', function() {
				expect($iirc.__test.util.getID().length).to.equal(4);
			});
			it('should return false if given a non-integer parameter', function() {
				expect($iirc.__test.util.getID('a')).to.equal(false);
			});
		});
	});
})();