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

module.exports = exports = __irc = (function() {
	"use strict";

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
		Connection: (function() {
			var Connection = function( channel, port, server, ssl ) {
				this.channel = channel;
				this.id = $util.getID($data.settings.defaults.idLength);
				this.port = port;
				this.server = server;
				this.ssl = ssl;
			};
			Connection.prototype.connect = function() {
				// connect to this server's instance, return id
				return false;
			};
			return Connection;
		})()
	};

	var $func = {
		broadcast: function( id, message, callback ) {
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
			getID: $util.getID
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