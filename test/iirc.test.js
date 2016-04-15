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

/*

var iirc = require('iirc');
var client = iirc()
	.connect()
	.join()
	.on();


*/

var __test = (function() {
	"use strict";

	var IIRC = require('../iirc.js');
	
	var expect = require('chai').expect;

	describe ('iirc', function() {

		describe('# util.getID()', function() {
			var iirc = new IIRC({
				host: 'dummy.example.com',
				port: 6667
			});
			it('should return a string', function() {
				expect(typeof(iirc.__test.util.getID())).to.equal("string");
			});
			it('should return a four-character string if given zero parameters', function() {
				expect(iirc.__test.util.getID().length).to.equal(4);
			});
			it('should return false if given a non-integer parameter', function() {
				expect(iirc.__test.util.getID('a')).to.equal(false);
			});
		});
		describe('# util.parseInput()', function() {
			var iirc = new IIRC({
				host: 'dummy.example.com',
				port: 6667
			});
			it('should return false when called with integer', function() {
				expect(iirc.__test.util.parseInput(1)).to.equal(false);
			});
			it('should comprehend standard network messages', function() {
				var result = iirc.__test.util.parseInput(':irc.example.net 001 iirc :Welcome to IRC iirc');
				expect(result.prefix).to.not.be.an('undefined');
				expect(result.prefix).to.be.a('string').and.equal('irc.example.net');
				expect(result.command).to.not.be.an('undefined');
				expect(result.command).to.be.a('string').and.equal('001');
				expect(result.params).to.not.be.an('undefined');
				expect(result.params).to.be.an('array').and.deep.equal(['iirc']);
				expect(result.trailing).to.not.be.an('undefined');
				expect(result.trailing).to.be.a('string').and.equal('Welcome to IRC iirc');
				// prefix, command, params
			});
			it('should comprehend server announcements', function() {
				var result = iirc.__test.util.parseInput(':iirc!~default@irc.example.net QUIT :Quit: leaving');
				expect(result.prefix).to.not.be.an('undefined');
				expect(result.prefix).to.be.a('string').and.equal('iirc!~default@irc.example.net');
				expect(result.command).to.not.be.an('undefined');
				expect(result.command).to.be.a('string').and.equal('QUIT');
				expect(result.params).to.be.an('undefined');
				expect(result.trailing).to.not.be.an('undefined');
				expect(result.trailing).to.be.a('string').and.equal('Quit: leaving');
			});
			it('should comprehend whois lists', function() {
				var result = iirc.__test.util.parseInput(':irc.example.net 353 iirc = #channel :@iirc user1 user2 user3');
				expect(result.prefix).to.not.be.an('undefined');
				expect(result.prefix).to.be.a('string').and.equal('irc.example.net');
				expect(result.command).to.not.be.an('undefined');
				expect(result.command).to.be.a('string').and.equal('353');
				expect(result.params).to.not.be.an('undefined');
				expect(result.params).to.be.deep.equal([ 'iirc', '=', '#channel' ]);
				expect(result.trailing).to.not.be.an('undefined');
				expect(result.trailing).to.be.a('string').and.equal('@iirc user1 user2 user3');
			});
		});

		describe ('# iirc.connect()', function() {
			it ('should return false when called with zero arguments', function() {
				//var result = new IIRC();
				expect(function() {
					return new IIRC();
				}).to.throw();
			});
			it ('should return an instance of IIRC when called with arguments', function( done ) {
				this.timeout(1000);
				var iirc = new IIRC({
					host: 'chat.freenode.net', 
					port: 6667
				});
				iirc.connect(function() {
					done();
					iirc.die();
				});
				expect(iirc).to.be.an('object').and.be.an.instanceof(IIRC);
			});
		});

		describe ('# iirc.die()', function() {
			it ('should return true when called on an existing connection', function( done ) {
				this.timeout(1000);
				var iirc = new IIRC({
					host: 'chat.freenode.net',
					port: 6667
				});
				iirc.connect(function() {
					iirc.die(function() {
						done();
					});
				});
				expect(iirc).to.be.an('object');
			});
		});
	});
})();


		// describe('# iirc.join()', function() {
		// 	it('should return false when called with zero arguments', function() {
		// 		var result = iirc
		// 			.connect('irc.example.net', 6667, false)
		// 			.join();
		// 		expect(result).to.not.be.undefined();
		// 		expect(result).to.be.false();
		// 	});
		// 	it('should return itself when called with a string', function() {
		// 		//var result = iirc.connect().join('##iirc');
		// 		var result = iirc
		// 			.connect('irc.example.net', 6667, false)
		// 			.join('##iirc');
		// 		expect(result).to.not.be.undefined();
		// 		expect(result).to.be.an('object');
		// 		result.die();
		// 	});
		// });
		// describe('# iirc.die()', function() {
		// 	it('should true when stubbed', function() {
		// 		expect(true).to.be.true();
		// 	});
		// });

		// // test
		// describe('### testing connection', function() {
		// 	it('should connect', function() {
		// 		var result = iirc
		// 			.connect('irc.freenode.net', 6667, false)
		// 			.join('##iirc');
		// 		for (var prop in result) {
		// 			//if (result.hasOwnProperty(prop)) {
		// 				//console.log('-['+prop+']['+result[prop]+']');
		// 			//}
		// 		}
		// 		result.join('#sulfurworks');
		// 		result.send('fooooooo');
		// 		result.send('leaving');
		// 		result.die();
		// 	});
		// });