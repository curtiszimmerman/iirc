/**
 * @project node-irc-client
 * IRC client module
 * @file irc.js
 * primary application driver
 * @author curtis zimmerman
 * @contact curtis.zimmerman@gmail.com
 * @license GPLv3
 * @version 0.1.0-alpha
 */

/*
var IIRC = require('iirc');

var $iirc = new IIRC({
	host: 'irc.freenode.net',
	port: 6667
});

$iirc.on('error', function( err ) {
	// handle error
});
$iirc.on('message', function( data ) {
	// handle message
});

$iirc.connect();

*/
// iirc.connect('#example', 'irc.example.net', 6667, false);
// iirc.connect({
// 		channel: '#example',
// 		host: 'irc.example.net',
// 		port: 6667,
// 		ssl: false
// 	});
// iirc.connect('#example', 'irc.example.net', 6667, false)
// 	.on('error', function( error ) {
// 		// error handle
// 	})
// 	.on('end', function() {
// 		// end handle
// 	})
// 	.on('data', function( data ) {
// 		// data handle
// 	})
// 	.on('message', function( message ) {
// 		// message handle
// 	});
// iirc.connect


'use strict';

/* core */
var events        = require('events');
var util          = require('util');
/* auxiliary */
var Connection    = require('./lib/connection.js');

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
				level: 5,
				quiet: false
			},
			version: "0.1.0"
		}
	}
};

/**
 * @function $log
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
var $log = (function() {
	var _con = function( data, loglevel ) {
		var pre = [' [EROR] ', ' [WARN] ', ' [LOG ] ', ' [INFO] ', ' [DBUG] '];
		return console.log(_time()+pre[loglevel]+data);
	};
	var _debug = function( data ) { return _log(data, 4);};
	var _error = function( data ) { return _log(data, 0);};
	var _info = function( data ) { return _log(data, 3);};
	var _log = function( data, loglevel ) {
		var loglevel = typeof(loglevel) === 'undefined' ? 2 : loglevel > 4 ? 4 : loglevel;
		return $data.server.settings.logs.quiet ? false : loglevel <= $data.server.settings.logs.level && _con(data, loglevel);
	};
	var _time = function() { return new Date().toJSON();}
	var _warn = function( data ) { return _log(data, 1);};
	return {
		debug: _debug,
		error: _error,
		info: _info,
		log: _log,
		warn: _warn
	};
})();

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
			//$pubsub.emit('/iirc/error', 'inputParse(): '+e.message);
			return false;
		}
		return result;
	}
};

// var init = (function() {

// 	if (typeof(config) !== 'undefined') return false;

// 	// module initialization code
// 	if (typeof(Array.prototype.remove) === 'undefined') {
// 		Array.prototype.remove = function( element ) {
// 			var index = this.indexOf(element);
// 			return (index > -1) ? this.splice(index, 1) : false;
// 		};
// 	}
// })();









// IIRC.prototype.broadcast = function( message ) {
// 	if (typeof(message) === 'undefined') return false;
// 	for (var i=0,len=this.data.connection.channels.length; i<len; i++) {
// 		this.data.connection.channels[i].send(message);
// 	}	
// 	return true;
// };
// IIRC.prototype.command = function( data, host ) {
// 	// send a command string to the connection
// 	if (typeof(host) !== 'string') return false;
// 	if (typeof(data) !== 'string') return false;
// 	this.data.connections[host] = '';
// 	return false;
// };

// connect

// die

// IIRC.prototype.join = function( channel ) {
// 	if (typeof(channel) !== 'string') return false;
// 	if (typeof(this.data.connection) === 'undefined') return false;
// 	this.data.connection.join(channel);
// 	return this;
// };
// IIRC.prototype.message = function( nick ) {
// 	// send message to nick
// 	return false;
// };
// IIRC.prototype.part = function( channel ) {
// 	// part specified channel
// 	if (typeof(channel) !== 'string') return false;
// 	this.data.connection.part();
// 	return false;
// };
// IIRC.prototype.send = function( message, channel ) {
// 	// send message to channel
// 	if (typeof(this.data.connection) === 'undefined') return false;
// 	if (typeof(channel) === 'undefined') {
// 		var len = this.data.connection.channels.length;
// 		return (len === 0 || len > 1) ? false : channel = this.data.connection.channels[0].send(message);
// 	}
// 	for (var i=0,len=this.data.connection.channels.length; i<len; i++) {
// 		if (this.data.connection.channels[i].channel === channel) {
// 			this.data.connection.channels[i].send(message);
// 			return true;
// 		}
// 	}
// 	return false;
// };
// IIRC.prototype.set = function( key, value ) {
// 	// set a particular key to value
// 	return false;
// };

// return new IIRC();

var IIRC = function( config, callback ) {
	var self = this;

	this.data = {
		connection: null
	};
	this.__test = {
		util: {
			getID: $util.getID,
			parseInput: $util.parseInput
		}
	};

	if (typeof(config) !== 'object') throw new Error('IIRC: Constructor requires options parameter');
	if (arguments.length === 0) throw new Error('IIRC: Constructor requires options parameter');
	if (arguments.length >= 1) {
		var descriptor = arguments[0];
		var host = descriptor.host;
		var port = descriptor.port;
		var ssl = descriptor.ssl;
	}
	var host = typeof(host) !== 'undefined' ? host : 'irc.freenode.net';
	var port = typeof(port) !== 'undefined' ? port : 6667;
	var ssl = typeof(ssl) !== 'undefined' ? ssl : false;

	var config = {
		id: $util.getID($data.server.settings.idLength),
		host: host,
		port: port,
		ssl: ssl
	};
	var connection = this.data.connection = new Connection(config);
	
	// internal Connection handlers
	connection.on('connect', function() {
		self.emit('connect');
	});
	connection.on('data', function( data ) {
		// big fucking switch statement

		var inbound = $util.parseInput(data);
		switch (inbound.command) {
			case 352:
				$log.debug('352 (WHO list): Adding user to channel ['+inbound.params[5]+']');
				// this.channels[inbound.params[1]].join(inbound.params[5]);
				break;
			case 353:
				$log.debug('353 (WHO list supplmental): Getting user list ['+inbound.trailing+']');
				// this.channels
				break;
			case 'JOIN':
				$log.debug('JOIN: Joining channel ['+inbound.params[0]+']');
				self.emit('join', inbound.params[0]);
				break;
			case 'PART':
				$log.debug('PART: Parting channel ['+inbound.params[0]+']');
				//
				break;
			case 'PRIVMSG':
				$log.debug('PRIVMSG: Private message ['+JSON.stringify(inbound.params)+']');
				//
				break;
			case 'WHO':
				$log.debug('WHO: Some shit ['+JSON.stringify(inbound.params)+']');
				break;
			case '':
				$log.debug('host announcement: ['+JSON.stringify(inbound.params)+']');
			default:
				$log.debug('Unhandled message: ['+JSON.stringify(inbound)+']');
				break;
		}

//@debug1
console.log('--> Connection.connect: SOCKET DATA: ['+JSON.stringify(inbound)+']');

	});
	connection.on('end', function() {
		self.emit('end');
	});
	connection.on('error', function( error ) {
//@debug1
console.log('--> Connection.connect: error handler handler!');
		// @todo!!!!! properly handle this
		// self.emit('error', error);
	});

	// the funky monkey
	return this;
};

// grab methods from EventEmitter
util.inherits(IIRC, events.EventEmitter);

IIRC.prototype.connect = function( callback ) {
	this.data.connection.connect(callback);
	return true;
};

IIRC.prototype.die = function( callback ) {
	// destroy channels
	// destroy server
	// for (var i=0,len=this.data.connection.length; i<len; i++) {
	// 	this.data.connection[i].quit();
	// }
	this.data.connection.quit();
	return typeof(callback) === 'function' && callback();
};

// user sets up "on" event listeners
// IIRC.prototype.on = function( event, handler ) {
	
// 	//return false;
// 	return this;
// };
// we trigger them with "emit" event triggers
// IIRC.prototype.emit = function( event ) {
// 	return this;
// };


module.exports = IIRC;