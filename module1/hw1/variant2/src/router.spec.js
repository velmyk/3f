/* global setupModuleLoader: false */
/* global window: false */

'use strict';

describe('router', function() {
	var myModule,
			angular;

	beforeEach(function() {
		
		spyOn(crossroads, 'addRoute');

		delete window.angular;
		setupModuleLoader(window);
		angular = window.angular;
		createRouter(angular);
	});

	it('should crete instance of Router', function() {
		expect(angular.router).toBeDefined();
	});

	it('should create only one router', function() {
		var router = window.angular.router;
		createRouter(angular);
		expect(window.angular.router).toEqual(router);
	});

	it('should register route on router', function() {
		var url = Math.random() + '',
				config = {};
		angular.router.add(url, config);
		expect(angular.router.routes[url]).toEqual(config);
	});

	it('should rewrite route with same url', function() {
		var url = Math.random() + '',
				config1 = {},
				config2 = {};
		angular.router.add(url, config1);
		angular.router.add(url, config2);
		expect(angular.router.routes[url]).toEqual(config2);
	});

	it('should register route with crossroads', function() {
		var url = Math.random() + '',
				config = {};
		createRouter(angular);
		angular.router.add(url, config);
		expect(crossroads.addRoute).toHaveBeenCalledWith(url);
	});
});