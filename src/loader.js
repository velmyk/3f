function setupModuleLoader(window) {
	'use strict';
	
	var ensure = function(obj, name, factory) {	// [MP hw1] example of singleton pattern
		return obj[name] || (obj[name] = factory());
	};
	var f3 = ensure(window, 'f3', Object);

	ensure(f3, 'module', function() {
		var modules = {};
		return function(name, requires) {
			if(requires) {
				return createModule(name, requires, modules);
			} else {
				return getModule(name, modules);
			}
		};
	});

	var createModule = function(name, requires, modules) {
		if (name === 'hasOwnProperty') {
			throw 'hasOwnProperty is not a valid module name';
		}
		var invokeQueue = [];
		var moduleInstance = {
			name: name,
			requires: requires,
			constant: function(key, value) {
				invokeQueue.push(['constant', [key, value]]);
			},
			_invokeQueue: invokeQueue
		};
		modules[name] = moduleInstance;
		return moduleInstance;
	};

	var getModule = function(name, modules) {
		if (modules.hasOwnProperty(name)) {
			return modules[name];
		} else {
			throw 'Module' + name + 'is not available!';
		}
	};
}

