/* global setupModuleLoader: false */
/* global window: false */

'use strict';

beforeEach(function() {
	delete window.f3;
});

describe('setupModuleLoader', function() {

	it('exposes f3 on the window', function() {
		setupModuleLoader(window);
		expect(window.f3).toBeDefined();
	});

	it('creates f3 just once', function() {
		setupModuleLoader(window);
		var ng = window.f3;
		setupModuleLoader(window);
		expect(window.f3).toBe(ng);
	});

	it('exposes the f3 module function', function() {
		setupModuleLoader(window);
		expect(window.f3.module).toBeDefined();
	});

	it('exposes the f3 module function just once', function() {
		setupModuleLoader(window);
		var module = window.f3.module;
		setupModuleLoader(window);
		expect(window.f3.module).toBe(module);
	});

});

describe('modules', function() {
	beforeEach(function() {
		setupModuleLoader(window);
	});

	it('allows registering a module', function() {
		var myModule = window.f3.module('myModule', []);
		expect(myModule).toBeDefined();
		expect(myModule.name).toEqual('myModule');
	});

	it('replaces a module when registered with same name again', function() {
		var myModule = window.f3.module('myModule', []);
		var myNewModule = window.f3.module('myModule', []);
		expect(myNewModule).not.toBe(myModule);
	});

	it('attaches the requires array to the registered module', function() {
		var myModule = window.f3.module('myModule', ['myOtherModule']);
		expect(myModule.requires).toEqual(['myOtherModule']);
	});

	it('allows getting a module', function() {
		var myModule = window.f3.module('myModule', []);
		var gotModule = window.f3.module('myModule');
		expect(gotModule).toBeDefined();
		expect(gotModule).toBe(myModule);
	});

	it('throws when trying to get a nonexistent module', function() {
		expect(function() {
			window.f3.module('myModule');
		}).toThrow();
	});

	it('does not allow a module to be called hasOwnProperty', function() {
		expect(function() {
			window.f3.module('hasOwnProperty', []);
		}).toThrow();
	});
	
});

