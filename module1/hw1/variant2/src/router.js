/* jshint globalstrict: true */

'use strict';

function createRouter(obj) {
	var ensure = function(obj, name, factory) {	// [MP hw1] example of singleton pattern
		return obj[name] || (obj[name] = factory());
	};

	ensure(obj, 'router', function() {
		var routes = {};
		return {
			routes: routes,
			add: add
		};

		function add(url, config) {
			routes[url] = config;
			crossroads.addRoute(url);
		}
	});
}