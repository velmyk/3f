/* jshint globalstrict: true */

'use strict';

function setupModuleLoader(window) {	// [MP hw1] example of singleton pattern
	var ensure = function(obj, name, factory) {
		return obj[name] || (obj[name] = factory());
	};
	var angular = ensure(window, 'angular', Object);

	var createModule = function(name, requires) {
		var moduleInstance = {
			name: name
		};

		return moduleInstance;
	};

	ensure(angular, 'module', function() {
		return function(name, requires) {
			return createModule(name, requires);
		};
	});
}

