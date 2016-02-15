/* jshint globalstrict: true */
/* global angular: false */

'use strict';

function createInjector(modulesToLoad, strictDi) {
	var cache = {};
	var loadedModules = {};
	strictDi = (strictDi === true);
	var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
	var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
	var STRIP_COMMENTS = /(\/\/.*$)|(\/\*.*?\*\/)/mg;

	var $provide = {
		constant: function(key, value) {
			if (key === 'hasOwnProperty') {
				throw 'hasOwnProperty is not a valid constant name!';
			}
			cache[key] = value;
		}
	};

	function annotate(fn) {
		if(_.isArray(fn)) {
			return fn.slice(0, fn.length - 1);
		} else if (fn.$inject) {
			return fn.$inject; 
		} else if (!fn.length) {
			return [];
		} else {
			if (strictDi) {
				throw 'fn is not using explicit annotation and ' +
					'cannot be invoked in strict mode';
			}
			var source = fn.toString().replace(STRIP_COMMENTS, '');
			var argDeclaration = source.match(FN_ARGS);
			return _.map(argDeclaration[1].split(','), function(argName) {
				return argName.match(FN_ARG)[2];
			});
		}
	}

	function invoke(fn, self, locals) {
		var args = _.map(annotate(fn), function(token) {
			if (_.isString(token)) {
				return locals && locals.hasOwnProperty(token)
									? locals[token]
									: cache[token];
			} else {
				throw 'Incorrect injection token! Expected a string, got' + token;
			}
		});
		if (_.isArray(fn)) {
			fn = _.last(fn);
		}
		return fn.apply(self, args);
	}

	function instantiate(Type, locals) {
		var UnwrappedType = _.isArray(Type) ? _.last(Type) : Type;
		var instance = Object.create(UnwrappedType.prototype);
		invoke(Type, instance, locals);
		return instance;
	}

	_.forEach(modulesToLoad, function loadModule(moduleName) {
		if (!loadedModules.hasOwnProperty(moduleName)) {
			loadedModules[moduleName] = true;
			var module = angular.module(moduleName);
			_.forEach(module.requires, loadModule);
			_.forEach(module._invokeQueue, function(invokeArgs) {
				var method = invokeArgs[0];
				var args = invokeArgs[1];
				$provide[method].apply($provide, args);
			});
		}
	});

	return {	// [MP hw1] example of revealing module pattern
		has: function(key) {
			return cache.hasOwnProperty(key);
		},
		get: function(key) {
			return cache[key];
		},
		annotate: annotate,
		invoke: invoke,
		instantiate: instantiate
	};
}
/* jshint globalstrict: true */

'use strict';

function setupModuleLoader(window) {
	var ensure = function(obj, name, factory) {	// [MP hw1] example of singleton pattern
		return obj[name] || (obj[name] = factory());
	};
	var angular = ensure(window, 'angular', Object);

	ensure(angular, 'module', function() {
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
			var handler = function(config) {
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