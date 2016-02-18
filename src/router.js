function createRouter(obj) {
	'use strict';
	
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
			var handler = function() {
				if(config.controller) {
					config.controller.apply(null);
				}
				document.getElementsByTagName('body')[0].innerHTML = config.template ? config.template : '';
			}
			routes[url] = config;
			crossroads.addRoute(url, handler);
		}
	});
}