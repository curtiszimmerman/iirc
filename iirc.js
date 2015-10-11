/**
 * @project node-irc-client
 * IRC client module
 * @file irc.js
 * primary application driver
 * @author curtis zimmerman
 * @contact curtis.zimmerman@gmail.com
 * @license GPLv3
 * @version 0.0.1a
 */

/*
iirc.connect('#example', 'irc.example.net', 6667, false);
iirc.connect({
		channel: '#example',
		host: 'irc.example.net',
		port: 6667,
		ssl: false
	});
iirc.connect('#example', 'irc.example.net', 6667, false)
	.on('error', function( error ) {
		// error handle
	})
	.on('end', function() {
		// end handle
	})
	.on('data', function( data ) {
		// data handle
	})
	.on('message', function( message ) {
		// message handle
	});
iirc.connect
*/

module.exports = exports = __iirc = (function() {
	"use strict";

	var events        = require('events');

	var Connection    = require('./lib/connection.js');
	var Exception     = require('./lib/exception.js');

	var pubsub = new events.EventEmitter();

	/*\
	|*| done.abcde ("async pattern") utility closure
	\*/
	var _done = (function() {
		var cache = {};
		function _after( num, callback ) {
			for (var i=0,id='';i<10;i++,id+=Math.floor(Math.random()*10));
			return (!cache[id]) ? (cache[id] = {id:id,count:num,callback:callback}, id) : _after(num,callback);
		};
		function _bump( id ) {
			return (!cache[id]) ? false : (--cache[id].count == 0) ? cache[id].callback.apply() && _del(cache[id]) : true;
		};
		function _count( id ) {
			return (cache[id]) ? cache[id].count : -1;
		};
		function _dump( id ) {
			return (cache[id]) ? delete cache[id] : false;
		};
		function _empty() {
			cache = {};
		};
		function _flag( id, func ) {
			// flag a function with the async id
			return (!cache[id]) ? true : false;
		};
		function _go( id, callback ) {
			// execute all flagged functions, then execute callback when it's done
			return false;
		};
		return {
			after: _after,
			bump: _bump,
			count: _count,
			dump: _dump,
			empty: _empty
		};
	})();

		/**
	 * @function _log
	 * Exposes logging functions.
	 * @method debug
	 * Log a debug message if debugging is on.
	 * @param (string) data - The data to log.
	 * @return (boolean) Success indicator.
	 * @method error
	 * Log an error.
	 * @param (string) data - The data to log.
	 * @return (boolean) Success indicator.
	 * @method info
	 * Log an informational message.
	 * @param (string) data - The data to log.
	 * @return (boolean) Success indicator.
	 * @method log
	 * Log a message.
	 * @param (string) data - The data to log.
	 * @param (integer) [loglevel] - Loglevel of data. Default 1.
	 * @return (boolean) Success indicator.
	 * @method warn
	 * Log a warning.
	 * @param (string) data - The data to log.
	 * @return (boolean) Success indicator.
	 */
	var _log = (function() {
		var _con = function( data, loglevel ) {
			var pre = ['[!] ERROR: ', '[+] ', '[i] WARN: ', '[i] INFO: ', '[i] DEBUG: '];
			return console.log(pre[loglevel]+data);
		};
		var _debug = function( data ) { return _con(data, 4);};
		var _error = function( data ) { return _con(data, 0);};
		var _info = function( data ) { return _con(data, 3);};
		var _log = function( data, loglevel ) {
			var loglevel = typeof(loglevel) === 'undefined' ? 1 : loglevel > 4 ? 4 : loglevel;
			return $data.server.settings.logs.quiet ? loglevel === 0 && _con(data, 0) : loglevel <= $data.server.settings.logs.level && _con(data, loglevel);
		};
		var _warn = function( data ) { return _con(data, 2);};
		return {
			debug: _debug,
			error: _error,
			info: _info,
			log: _log,
			warn: _warn
		};
	})();

	var $data = {
		server: {
			settings: {
				defaults: {
					altnick: "iirc_",
					idLength: 4,
					nickname: "iirc",
					realname: "iirc",
					username: "iirc"
				},
				logs: {
					level: 1,
					quiet: false
				},
				version: "v0.0.1a"
			}
		}
	};

	var $util = {
		/**
		 * @function $util.getID
		 * Generates an alphanumeric ID key of specified length.
		 * @param (int) len - Length of the ID to create.
		 * @return (string) The generated ID.
		 */
		getID: function( len ) {
			if (typeof(len) !== 'undefined' && typeof(len) !== 'number') return false;
			for (
				var i = 0, id = '', charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
				i < (len > 0 ? len : $data.server.settings.defaults.idLength);
				i++
			) {	id += charset.substr(Math.floor(Math.random()*charset.length), 1); }
			return id;
		},
		parseInput: function( input ) {
			if (typeof(input) !== 'string') return false;
			var result = {};
			try {
				var sub = input.split(/:/);
				sub.shift();
				var message = sub.shift().split(' ');
				result.prefix = message.shift();
				result.command = message.shift();
				var params = message.filter(function(i) {
					if (i !== '') return i;
				});
				if (params.length > 0) result.params = params;
				result.trailing = sub.join(':');
			} catch(e) {
				pubsub.emit('/iirc/error', 'inputParse(): '+e.message);
				return false;
			}
			return result;
		}
	};

	var init = (function() {
		// module initialization code
		if (typeof(Array.prototype.remove) === 'undefined') {
			Array.prototype.remove = function( element ) {
				var index = this.indexOf(element);
				return (index > -1) ? this.splice(index, 1) : false;
			};
		}
	})();

	//
	//
	// so you need to take way more advantage of pubsub events as a 
	// fundamental behavior










	

	var IIRC = function() {
		this.data = {
			connection: {}
		};
		this.__test = {
			pubsub: pubsub,
			util: {
				getID: $util.getID,
				parseInput: $util.parseInput
			}
		};
	};
	IIRC.prototype.broadcast = function( message ) {
		if (typeof(message) === 'undefined') return false;
		for (var i=0,len=this.data.connection.channels.length; i<len; i++) {
			this.data.connection.channels[i].send(message);
		}	
		return true;
	};
	IIRC.prototype.command = function( data, host ) {
		// send a command string to the connection
		if (typeof(host) !== 'string') return false;
		if (typeof(data) !== 'string') return false;
		this.data.connections[host] = '';
		return false;
	};
	IIRC.prototype.connect = function( host, port, ssl ) {
		if (arguments.length === 0) return false;
		if (arguments.length === 1) {
			var descriptor = arguments[0];
			var host = descriptor.host;
			var port = descriptor.port;
			var ssl = descriptor.ssl;
		}
		var host = typeof(host) !== 'undefined' ? host : 'irc.freenode.net';
		var port = typeof(port) !== 'undefined' ? port : 6667;
		var ssl = typeof(ssl) !== 'undefined' ? ssl : false;
		//@debug1
		console.log('---first');
		var config = {
			id: $util.getID($data.server.settings.idLength),
			host: host,
			port: port,
			ssl: ssl
		};
		var connection = new Connection(config);
		this.data.connection = connection;
		this.data.connection.connect();
		//@debug1
		console.log('---last');
		return this;
	};
	IIRC.prototype.die = function( callback ) {
		// destroy channels
		// destroy server
		for (var i=0,len=this.data.connection.channels.length; i<len; i++) {
			this.data.connection.channels[i].part();
		}
		this.data.connection.quit();
		return typeof(callback) === 'function' && callback();
	};
	IIRC.prototype.join = function( channel ) {
		if (typeof(channel) !== 'string') return false;
		if (typeof(this.data.connection) === 'undefined') return false;
		this.data.connection.join(channel);
		return this;
	};
	IIRC.prototype.message = function( nick ) {
		// send message to nick
		return false;
	};
	IIRC.prototype.part = function( channel ) {
		// part specified channel
		if (typeof(channel) !== 'string') return false;
		this.data.connection.part();
		return false;
	};
	IIRC.prototype.send = function( message, channel ) {
		// send message to channel
		if (typeof(this.data.connection) === 'undefined') return false;
		if (typeof(channel) === 'undefined') {
			var len = this.data.connection.channels.length;
			return (len === 0 || len > 1) ? false : channel = this.data.connection.channels[0].send(message);
		}
		for (var i=0,len=this.data.connection.channels.length; i<len; i++) {
			if (this.data.connection.channels[i].channel === channel) {
				this.data.connection.channels[i].send(message);
				return true;
			}
		}
		return false;
	};
	IIRC.prototype.set = function( key, value ) {
		// set a particular key to value
		return false;
	};

	return new IIRC();
})();