/* jshint globalstrict: true */

'use strict';

function createRouter(obj) {
	var ensure = function(obj, name, factory) {	// [MP hw1] example of singleton pattern
		return obj[name] || (obj[name] = factory());
	};

	ensure(obj, 'router', function() {

		function parseHash(newHash, oldHash){
		  crossroads.parse(newHash);
		}
		hasher.initialized.add(parseHash);
		hasher.changed.add(parseHash);
		hasher.init();

		var routes = {};
		return {
			routes: routes,
			add: add
		};

		function add(url, config) {
			routes[url] = config;
			config.controller ? crossroads.addRoute(url, config.controller) : crossroads.addRoute(url);
		}
	});
}