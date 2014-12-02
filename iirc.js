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
			if ($data.server.state.debug === true) return _con(data, 0);
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

	var $data = {
		connections: [],
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
				this.channel = channel;
				return this;
			};
			Channel.prototype.send = function( message ) {
				// send to the channel
				return false;
			};
			return Channel;
		})(),
		Connection: (function() {
			var Connection = function( port, server, ssl ) {
				this.channels = [];
				this.id = $util.getID($data.settings.defaults.idLength);
				this.port = port;
				this.ready = false;
				this.server = server;
				this.socket = null;
				this.ssl = ssl;
				return this;
			};
			Connection.prototype.connect = function( callback ) {
				// connect to this server's instance, return id
				var options = {
					port: this.port,
					host: this.server
				};
				var handler = function() {
					// handle this shit
					this.ready = true;
					return typeof(callback) === 'function' && callback();
				};
				var client = false;
				if (this.ssl) {
					client = tls.connect(optoins, handler);
				} else {
					client = net.connect(options, handler);
				}
				client.on('on', function( data ) {
					// handle client data
					return false;
				});
				client.on('end', function() {
					// handle client session end
					return false;
				});
			};
			Connection.prototype.join = function( channel ) {

				return true;
			};
			return Connection;
		})()
	};

	var $func = {
		broadcast: function( id, message, callback ) {
			for (var i=0,len=$data.connections.length; i<len; i++) {

			}	
			return false;
		},
		config: function( descriptor, callback ) {
			return false;
		},
		connect: function( host, port, ssl, callback ) {
			var host = typeof(host) !== 'undefined' ? host : 'irc.freenode.net';
			var port = typeof(port) !== 'undefined' ? port : 6667;
			var ssl = typeof(port) !== 'undefined' ? ssl : false;
			return false;
		},
		die: function( id, callback ) {
			return false;
		},
		message: function( id, channel, nick, callback ) {
			return false;
		},
		reconnect: function( id, callback ) {
			return false;
		},
		send: function( id, channel ) {
			return false;
		},
		set: function( id, key, value ) {
			return false;
		},
		tell: function( id, channel, nick, callback ) {
			return false;
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
				i < (len > 0 ? len : $data.settings.defaults.idLength);
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

	var $iirc = function() {
		var init = function( descriptor ) {
			if (typeof(descriptor) === 'undefined') return false;
		};
		return {
			init: init
		};
	};

	var __test = {
		util: {
			getID: $util.getID,
			parseInput: $util.parseInput
		}
	};

	return {
		broadcast: $func.broadcast,
		config: $func.config,
		connect: $func.connect,
		die: $func.die,
		message: $func.message,
		reconnect: $func.reconnect,
		send: $func.send,
		set: $func.set,
		tell: $func.tell,
		__test: __test
	};
})();