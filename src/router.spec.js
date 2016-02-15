/* global setupModuleLoader: false */
/* global window: false */

'use strict';

describe('router', function() {
	var myModule,
			f3;

	beforeEach(function() {

		spyOn(crossroads, 'addRoute');
		spyOn(crossroads, 'parse');

		delete window.f3;
		setupModuleLoader(window);
		myModule = window.f3.module('myModule', []);
		createRouter(myModule);
	});

	describe('should init hash history', function() {
		beforeEach(function() {
			crossroads.addRoute('foo');
			crossroads.addRoute('bar');
			hasher.setHash('foo');
		});

		it('should parse initial hash', function() {
			expect(crossroads.parse).toHaveBeenCalledWith('foo');
		});

		it('should parse hash changes', function() {
			hasher.replaceHash('bar');
			expect(crossroads.parse).toHaveBeenCalledWith('bar');
		});
	});

	it('should crete instance of Router', function() {
		expect(myModule.router).toBeDefined();
	});

	it('should create only one router', function() {
		var router = myModule.router;
		createRouter(myModule);
		expect(myModule.router).toEqual(router);
	});

	it('should register route on router', function() {
		var url = Math.random() + '',
				config = {};
		myModule.router.add(url, config);
		expect(myModule.router.routes[url]).toEqual(config);
	});

	it('should rewrite route with same url', function() {
		var url = Math.random() + '',
				config1 = {},
				config2 = {};
		myModule.router.add(url, config1);
		myModule.router.add(url, config2);
		expect(myModule.router.routes[url]).toEqual(config2);
	});

	it('should register route with crossroads', function() {
		var url = Math.random() + '',
				config = {};
		myModule.router.add(url, config);
		expect(crossroads.addRoute).toHaveBeenCalledWith(url, jasmine.any(Function));
	});

	it('should register route with some handler', function() {
		var url = Math.random() + '',
				config = {
					controller: function() {}
				};
		myModule.router.add(url, config);
		expect(crossroads.addRoute).toHaveBeenCalledWith(url, jasmine.any(Function));
	});

	it('should register route with some template', function() {
		var url = Math.random() + '',
				template = Math.random() + '',
				config = {
					template: template
				};
		spyOn(document, 'getElementsByTagName');
		hasher.setHash(url);
	});
});