
/* core */
const events       = require('events');
const net          = require('net');
const tls          = require('tls');
const util         = require('util');
/* auxiliary */
var Channel      = require('./channel.js');

var Connection = function( config ) {
	if (typeof(config.host) === 'undefined') throw new Error('Connection: Empty host parameter');
	if (typeof(config.port) === 'undefined') throw new Error('Connection: Empty port parameter');
	if (typeof(config.ssl) === 'undefined') throw new Error('Connection: Empty ssl paramter');
	this.socket = null;
	this.id = config.id;
	this.port = config.port;
	this.ready = false;
	this.host = config.host;
	this.ssl = config.ssl;
};

// grab methods from EventEmitter
util.inherits(Connection, events.EventEmitter);

Connection.prototype.connect = function( callback ) {
	var self = this;

	this.socket = false;

	var options = {
		host: this.host,
		port: this.port
	};

// @debug1
console.log('--> Connection.connect: connecting socket now...');

	// attempt to connect...
	try {
		this.socket = this.ssl ? tls.connect(options) : net.connect(options);
	} catch(e) {
		throw new Error('Connection.connect: '+e.message);
	}

	this.socket.on('connect', function() {
		//@debug1
		console.log('--> Connection.connect: SOCKET HANDLER! AMAZING SHIT IS HAPPENING!');
		self.ready = true;
		self.emit('connect');
		typeof(callback) === 'function' && callback();
	});
	this.socket.on('error', function( error ) {
		//@debug1
		console.log('--> Connection.connect: error event emitted: '+error);
		self.emit('error', error);
	});
	this.socket.on('lookup', function( error, addr, family ) {
		if (error) self.emit('error', error);
	});
	this.socket.on('data', function( data ) {
		// var inbound = $util.parseInput(data);
		// switch (inbound.command) {
		// 	case 352:
		// 		$log.debug('352 (WHO list): Adding user to channel ['+inbound.params[5]+']');
		// 		// this.channels[inbound.params[1]].join(inbound.params[5]);
		// 		break;
		// 	case 353:
		// 		$log.debug('353 (WHO list supplmental): Getting user list ['+inbound.trailing+']');
		// 		// this.channels
		// 		break;
		// 	case 'JOIN':
		// 		$log.debug('JOIN: Joining channel ['+inbound.params[0]+']');
		// 		//
		// 		break;
		// 	case 'PART':
		// 		$log.debug('PART: Parting channel ['+inbound.params[0]+']');
		// 		//
		// 		break;
		// 	case 'PRIVMSG':
		// 		$log.debug('PRIVMSG: Private message ['+JSON.stringify(inbound.params)+']');
		// 		//
		// 		break;
		// 	case 'WHO':
		// 		$log.debug('WHO: Some shit ['+JSON.stringify(inbound.params)+']');
		// 		break;
		// 	default:
		// 		$log.debug('Unhandled message: ['+JSON.stringify(inbound)+']');
		// 		break;
		// }
		//@debug1
		console.log('--> Connection.connect: SOCKET DATA: ['+data+']');
		self.emit('data', data);
	});
	this.socket.on('end', function() {
		// client hangup
		//@debug1
		console.log('--> Connection.connect: SOCKET END');
		self.emit('end');
	});
};

Connection.prototype.data = function( data, callback ) {
	// send data to the server on this connection
	if (typeof(data) !== 'string') throw new Error('Connection.data: Data parameter must be a string!');
	if (this.socket === null) throw new Error('Connection.data: Not connected!');

//@debug1
console.log('==> data->Writing: ['+data+']');

	this.socket.write(data);
	return typeof(callback) === 'function' && callback();
};

Connection.prototype.quit = function( message ) {
	message = typeof(message) === 'undefined' ? 'leaving' : message;
	this.data('QUIT :'+message);
	return this.socket.destroy();
};




// Connection.prototype.data = function( data, callback ) {
// 	// send command to server
// 	if (typeof(data) !== 'string') return false;
// 	if (this.connection === null) return false;
// 	//@debug1
// 	console.log('---===.data()->WRITING');
// 	this.socket.write(data);
// 	return typeof(callback) === 'function' && callback();
// };

// Connection.prototype.join = function( channel ) {
// 	if (typeof(channel) !== 'string') return false;
// 	this.channels.push(new Channel(channel));
// 	this.data('JOIN '+channel);
// 	return true;
// };

// Connection.prototype.part = function( channel ) {
// 	if (typeof(channel) !== 'string') return false;
	
// 	this.data('PART '+channel);
// 	return true;
// };

// Connection.prototype.quit = function( message ) {
// 	message = (typeof(message) === 'undefined') ? 'leaving' : message;
// 	this.data('QUIT :'+message);
// 	return true;
// };

module.exports = Connection;
