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

	var net = require('net');
	var tls = require('tls');

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
	 * Exposes three logging functions.
	 * @method dbg
	 * Log a debug message if debugging is on.
	 * @param (string) data - The data to log.
	 * @return (boolean) Success indicator.
	 * @method err
	 * Log an error.
	 * @param (string) data - The data to log.
	 * @return (boolean) Success indicator.
	 * @method log
	 * Log a message.
	 * @param (string) data - The data to log.
	 * @return (boolean) Success indicator.
	 */
	var _log = (function() {
		var _con = function( data, type ) {
			var pre = ['[i] DEBUG: ', '[!] ERROR: ', '[+] '];
			return console.log(pre[type]+data);
		};
		var _dbg = function( data ) {
			if ($app.server.state.debug === true) return _con(data, 0);
		};
		var _err = function( data ) {
			return _con(data, 1);
		};
		var _log = function( data ) {
			return _con(data, 2);
		};
		return {
			dbg: _dbg,
			err: _err,
			log: _log
		};
	})();

	/**
	 * @function _pubsub
	 * Exposes publish/subscribe pattern utility functions.
	 * @method flush
	 * Flush the pubsub cache.
	 * @method pub
	 * Publish a callback topic.
	 * @param (string) topic - The pubsub "topic" key.
	 * @param (array) args - An array of arguments to pass to callback.
	 * @param (object) scope - The callback scope. 
	 * @method sub
	 * Subscribe to a callback topic.
	 * @param (string) topic - The pubsub "topic" key.
	 * @param (function) callback - The callback to apply.
	 * @return (array} An array with topic and callback.
	 * @method unsub
	 * Unsubscribe a specific pubsub event.
	 * @param (array) handle - The pubsub handle.
	 * @param (boolean) total - Delete entire topic?
	 */
	var _pubsub = (function() {
		var cache = {};
		var flush = function() {
			return cache = {};
		};
		var publish = function( topic, args, scope ) {
			if (cache[topic]) {
				var currentTopic = cache[topic],
					topicLength = currentTopic.length;
				for (var i=0; i<topicLength; i++) {
					currentTopic[i].apply(scope || this, args || []);
				}
			}
		};
		var subscribe = function( topic, callback ) {
			if (!cache[topic]) cache[topic] = [];
			cache[topic].push(callback);
			return [topic, callback];
		};
		var unsubscribe = function( handle, total ) {
			var topic = handle[0],
				cacheLength = cache[topic].length;
			if (cache[topic]) {
				for (var i=0; i<cacheLength; i++) {
					if (cache[topic][i] === handle) {
						cache[topic].splice(cache[topic][i], 1);
						if (total) delete cache[topic];
					}
				}
			}
		};
		return {
			flush: flush,
			pub: publish,
			sub: subscribe,
			unsub: unsubscribe
		};
	})();

	var $app = {
		settings: {
			defaults: {
				altnick: "iirc_",
				idLength: 4,
				nickname: "iirc",
				realname: "iirc",
				username: "iirc"
			},
			version: "v0.0.1a"
		}
	};

	var $classes = {
		Channel: (function() {
			var Channel = function( channel ) {
				if (typeof(channel) === 'undefined') throw new $classes.Exception('Channel(): Empty channel paramter.');
				this.channel = channel;
				this.users = [];
				return this;
			};
			Channel.prototype.join = function( user ) {
				// actually join the channel
				this.users.push(user);
				return true;
			};
			Channel.prototype.part = function( user ) {
				// dirty work of parting channel
				this.users.remove(user);
				return true;
			};
			return Channel;
		})(),
		Connection: (function() {
			var Connection = function( host, port, ssl ) {
				if (typeof(host) === 'undefined') throw new $classes.Exception('Connection(): Empty host parameter.');
				if (typeof(port) === 'undefined') throw new $classes.Exception('Connection(): Empty port parameter.');
				if (typeof(ssl) === 'undefined') throw new $classes.Exception('Connection(): Empty ssl paramter.');
				this.channels = [];
				this.socket = null;
				this.id = $util.getID($app.settings.defaults.idLength);
				this.port = port;
				this.ready = false;
				this.host = host;
				this.socket = null;
				this.ssl = ssl;
				return this;
			};
			Connection.prototype.connect = function( callback ) {
				// connect to this server's instance, return id
				var options = {
					port: this.port,
					host: this.host
				};
				var handler = function() {
					// handle this shit
					this.ready = true;
					return typeof(callback) === 'function' && callback();
				};
				this.socket = false;
				try {
					if (this.ssl === true) {
						this.socket = tls.connect(options, handler);
					} else {
						this.socket = net.connect(options, handler);
					}
				} catch(e) {
					throw new $classes.Exception('[!] ERROR: '+e.message);
				}
				this.socket.on('on', function( data ) {
					// handle client data
					var inbound = $util.parseInput(data);
					switch (inbound.command) {
						case 352:
							_log.dbg('352 (WHO list): Adding user to channel ('+inbound.params[5]+')');
							this.channels[inbound.params[1]].join(inbound.params[5]);
							break;
						case 353:
							_log.dbg('353 (WHO list supplmental): Getting user list ('+inbound.trailing+')');
							this.channels[inbound.params[2]].join(inbound.trailing);
							break;
						case 'JOIN':
							_log.dbg('JOIN: Joining channel ('+inbound.params[0]+')')
							this.channels[inbound.params[0]].join();
							break;
						case 'PART':
							_log.dbg('PART: Parting channel ('+inbound.params[0]+')');
							this.channels[inbound.params[0]].part();
							break;
						case 'PRIVMSG':
							break;
						case 'WHO':
							break;
						default:
							break;
					}
					return false;
				});
				this.socket.on('end', function() {
					// handle client session end
					return false;
				});
			};
			Connection.prototype.data = function( data, callback ) {
				// send command to server
				if (typeof(data) !== 'string') return false;
				if (this.connection === null) return false;
				this.socket.write(data);
				return typeof(callback) === 'function' && callback();
			};
			Connection.prototype.join = function( channel ) {
				if (typeof(channel) !== 'string') return false;
				this.channels.push(new $classes.Channel(channel));
				this.data('JOIN '+channel);
				return true;
			};
			Connection.prototype.part = function( channel ) {
				if (typeof(channel) !== 'string') return false;
				
				this.data('PART '+channel);
				return true;
			};
			Connection.prototype.quit = function( message ) {
				message = (typeof(message) === 'undefined') ? 'leaving' : message;
				this.data('QUIT :'+message);
				return true;
			};
			return Connection;
		})(),
		Exception: (function() {
			var Exception = function( message ) {
				this.message = message;
				this.name = 'Exception';
			};
			return Exception;
		})()
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
				i < (len > 0 ? len : $app.settings.defaults.idLength);
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
				_pubsub.pub('/iirc/error', 'inputParse(): '+e.message);
				return false;
			}
			return result;
		}
	};

	var init = (function() {
		// module initialization code
		Array.prototype.remove = function( element ) {
			var index = this.indexOf(element);
			return (index > -1) ? this.splice(index, 1) : false;
		};
	})();

	var IIRC = function() {
		this.data = {
			connection: {}
		};
		this.__test = {
			util: {
				getID: $util.getID,
				parseInput: $util.parseInput
			}
		};
	};
	IIRC.prototype.broadcast = function( message ) {
		for (var i=0,len=this.data.connections.length; i<len; i++) {
			}	
		return false;
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
		var connection = new $classes.Connection(host, port, ssl);
		this.data.connection = connection;
		connection.connect();
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
	IIRC.prototype.join = function( channel, host ) {
		if (typeof(channel) !== 'string') return false;
		if (typeof(host) === 'undefined') {
			var hosts = 0;
			for (var cx in this.data.connection) {
				if (this.data.connection.hasOwnProperty(cx)) {
					//@debug1
					console.log('----------->['+JSON.stringify(this.data.connection)+']');
					host = cx;
					hosts++;
				}
			}
			console.log('==============>['+hosts+']['+connection+']');
			if (hosts !== 1) return false;
		}
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
	IIRC.prototype.send = function( channel, message ) {
		// send message to channel
		return false;
	};
	IIRC.prototype.set = function( key, value ) {
		// set a particular key to value
		return false;
	};

	return new IIRC();
})();