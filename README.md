#IIRC

IIRC is a simple, modular Node.js IRC client.

[![Circle CI](https://circleci.com/gh/curtiszimmerman/iirc/tree/master.svg?style=svg)](https://circleci.com/gh/curtiszimmerman/iirc/tree/master)

###Details

IIRC was built with a purpose in mind: Hooking an API into IRC for notifications. CI/CD service IRC 
notifications can be pretty spammy, and also lacking in depth, functionality, and customization. 
IIRC was created to solve this (nitpicky, minor) problem. Simply pull IIRC into any web server and 
you've got an instant webhook for ultra customizable notifications. IIRC uses Node's built-in 
modules, so there's no need to worry about code bloat.

###Usage

In its simplest form, IIRC by default connects to Freenode:

```javascript
var iirc = require('iirc');

client.on('message', function(message) {
	iirc.send('Received message: ' + message, '##iirc');
});
```

But of course you can specify a variety of configuration options:

```javascript
var iirc = require('iirc').config({
	channel: "##iirc",
	host: "irc.example.com",
	port: 6697,
	ssl: true
});
client.on('message', function(message) {
	iirc.send('Received message: ' + message);
});
```

