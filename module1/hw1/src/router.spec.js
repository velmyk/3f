/* global setupModuleLoader: false */
/* global window: false */

'use strict';

describe('router', function() {
	var myModule;

	beforeEach(function() {
		delete window.angular;
		setupModuleLoader(window);
		myModule = angular.module('myModule', []);
	});

	it('TODO', function() {
		
	});
});