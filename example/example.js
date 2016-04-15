


var __example = (function() {
	'use strict';

	var events = require('events');

	var $pubsub = new events.EventEmitter();
	var IIRC = require('../iirc.js');

	var $data = {
		iirc: null
	};

	var $func = {
		connect: function() {
			console.log('connecting to server...');
			var iirc = $data.iirc = new IIRC({
				host: 'chat.freenode.net',
				port: 6667
			});

			$data.iirc.connect(function(err) {
				if (err) $pubsub.emit('/error', err);
				$pubsub.emit('/connect/done');
			});

		},
		interact: function() {
			console.log('interacting with server...');
			$pubsub.emit('/interact/done');
		},
		join: function() {
			console.log('joining channel #iirc...');
			$data.iirc.join('#iirc', function(err, data) {
				if (err) $pubsub.emit('/error', err);
				$pubsub.emit('/join/done');
			});

		}
	};

	var _init = (function() {
		console.log('initializing server...');
		$pubsub.on('/error', function(error) {
			console.log('==>['+error+']');
		});
		$pubsub.on('/init/done', function() {
			$func.connect();
		});
		$pubsub.on('/connect/done', function() {
			$func.interact();
		});

		$pubsub.emit('/init/done');
	})();
})();