
var Exception = require('./exception.js');

var Channel = function( channel ) {
	if (typeof(channel) === 'undefined') throw new Exception('Channel(): Empty channel paramter.');
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

module.exports = Channel;
