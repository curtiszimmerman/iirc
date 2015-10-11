
var net          = require('net');
var tls          = require('tls');

var Channel      = require('./channel.js');
var Exception    = require('./exception.js');

var Connection = function( config ) {
	if (typeof(config.host) === 'undefined') throw new Exception('Connection(): Empty host parameter.');
	if (typeof(config.port) === 'undefined') throw new Exception('Connection(): Empty port parameter.');
	if (typeof(config.ssl) === 'undefined') throw new Exception('Connection(): Empty ssl paramter.');
	this.channels = [];
	this.socket = null;
	this.id = config.id;
	this.port = config.port;
	this.ready = false;
	this.host = config.host;
	this.socket = null;
	this.ssl = config.ssl;
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
		//@debug1
		console.log('---SOCKET HANDLER');
		this.ready = true;
		return typeof(callback) === 'function' && callback();
	};
	this.socket = false;
	//@debug1
	console.log('---.connect()->connecting socket');
	try {
		if (this.ssl === true) {
			this.socket = tls.connect(options, handler);
		} else {
			this.socket = net.connect(options, handler);
		}
	} catch(e) {
		throw new Exception('[!] ERROR: '+e.message);
	}
	//@debug1
	console.log('---.connect()->socket connected');
	this.socket.on('error', function( error ) {
		//@debug1
		console.log('---.connect()->ERROR event emitted: ('+error+')');
	});
	this.socket.on('data', function( data ) {
		// handle client data
		var inbound = $util.parseInput(data);
		switch (inbound.command) {
			case 352:
				_log.debug('352 (WHO list): Adding user to channel ('+inbound.params[5]+')');
				this.channels[inbound.params[1]].join(inbound.params[5]);
				break;
			case 353:
				_log.debug('353 (WHO list supplmental): Getting user list ('+inbound.trailing+')');
				this.channels[inbound.params[2]].join(inbound.trailing);
				break;
			case 'JOIN':
				_log.debug('JOIN: Joining channel ('+inbound.params[0]+')')
				this.channels[inbound.params[0]].join();
				break;
			case 'PART':
				_log.debug('PART: Parting channel ('+inbound.params[0]+')');
				this.channels[inbound.params[0]].part();
				break;
			case 'PRIVMSG':
				break;
			case 'WHO':
				break;
			default:
				break;
		}
		//
		//
		// debug
		//
		//
		console.log('---SOCKET DATA ['+inbound+']');
		return false;
	});
	this.socket.on('end', function() {
		// handle client session end
		//@debug1
		console.log('---SOCKET END');
		return false;
	});
	//@debug1
	console.log('---.connect() finished!');
};

Connection.prototype.data = function( data, callback ) {
	// send command to server
	if (typeof(data) !== 'string') return false;
	if (this.connection === null) return false;
	//@debug1
	console.log('---===.data()->WRITING');
	this.socket.write(data);
	return typeof(callback) === 'function' && callback();
};

Connection.prototype.join = function( channel ) {
	if (typeof(channel) !== 'string') return false;
	this.channels.push(new Channel(channel));
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

module.exports = Connection;
