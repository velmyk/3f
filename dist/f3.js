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
/* global createInjector: false, setupModuleLoader: false, angular: false */

'use strict';

describe('injector', function() {
	beforeEach(function() {
		delete window.angular;
		setupModuleLoader(window);
	});

	it('can be created', function() {
		var injector = createInjector([]);
		expect(injector).toBeDefined();
	});

	it('has a constant that has been registered to a module', function() {
		var module = angular.module('myModule', []);
		module.constant('aConstant', 42);
		var injector = createInjector(['myModule']);
		expect(injector.has('aConstant')).toBe(true);
	});

	it('does not have a non-registered constant', function() {
		var module = angular.module('myModule' , []);
		var injector = createInjector(['myModule']);
		expect(injector.has('aConstant')).toBe(false);
	});

	it('does not allow a constant called hasOwnProperty', function() {
		var module = angular.module('myModule', []);
		module.constant('hasOwnProperty', _.constant(false));
		expect(function() {
			createInjector(['myModule']);
		}).toThrow();
	});

	it('can return a registered constant', function() {
		var module = angular.module('myModule', []);
		module.constant('aConstant', 42);
		var injector = createInjector(['myModule']);
		expect(injector.get('aConstant')).toBe(42);
	});

	it('loads multiple modules', function() {
		var module1 = angular.module('myModule', []);
		var module2 = angular.module('myOtherModule', []);
		module1.constant('aConstant', 42);
		module2.constant('anotherConstant', 43);
		var injector = createInjector(['myModule', 'myOtherModule']);
		expect(injector.has('aConstant')).toBe(true);
		expect(injector.has('anotherConstant')).toBe(true);
	});

	it('loads the required modules of a module', function() {
		var module1 = angular.module('myModule', []);
		var module2 = angular.module('myOtherModule', ['myModule']);
		module1.constant('aConstant', 42);
		module2.constant('anotherConstant', 43);
		var injector = createInjector(['myOtherModule']);
		expect(injector.has('aConstant')).toBe(true);
		expect(injector.has('anotherConstant')).toBe(true);
	});

	it('loads the transitively required modules of a module', function() {
		var module1 = angular.module('myModule', []);
		var module2 = angular.module('myOtherModule', ['myModule']);
		var module3 = angular.module('myThirdModule', ['myOtherModule']);
		module1.constant('aConstant', 42);
		module2.constant('anotherConstant', 43);
		module3.constant('aThirdConstant', 44);
		var injector = createInjector(['myThirdModule']);
		expect(injector.has('aConstant')).toBe(true);
		expect(injector.has('anotherConstant')).toBe(true);
		expect(injector.has('aThirdConstant')).toBe(true);
	});

	it('loads each module only once', function() {
		var module1 = angular.module('myModule', ['myOtherModule']);
		var module2 = angular.module('myOtherModule', ['myModule']);
		createInjector(['myModule']);
	});

	it('invokes an annotated function with dependency injection', function() {
		var module = angular.module('myModule', []);
		module.constant('a', 1);
		module.constant('b', 2);
		var injector = createInjector(['myModule']);
		var fn = function(one, two) {
			return one + two;
		};
		fn.$inject = ['a', 'b'];
		expect(injector.invoke(fn)).toBe(3);
	});

	it('does not accept non-strings as injection tokens', function() {
		var module = angular.module('myModule', []);
		module.constant('a', 1);
		var injector = createInjector(['myModule']);
		var fn = function(one, two) {
			return one + two;
		};
		fn.$inject = ['a', 2];
		expect(function() {
			injector.invoke(fn);
		}).toThrow();
	});

	it('invokes a function with the given this context', function() {
		var module = angular.module('myModule', []);
		module.constant('a', 1);
		var injector = createInjector(['myModule']);
		var obj = {
			two: 2,
			fn: function(one) {
				return one + this.two;
			}
		};
		obj.fn.$inject = ['a'];
		expect(injector.invoke(obj.fn, obj)).toBe(3);
	});

	it('overrides dependencies with locals when invoking', function() {
		var module = angular.module('myModule', []);
		module.constant('a', 1);
		module.constant('b', 2);
		var injector = createInjector(['myModule']);
		var fn = function(one, two) {
			return one + two;
		};
		fn.$inject = ['a', 'b'];
		expect(injector.invoke(fn, undefined, {b: 3})).toBe(4);
	});

	describe('annotate', function() {
		it('returns the $inject annotation of a function when it has one', function() {
			var injector = createInjector([]);
			var fn = function() { };
			fn.$inject = ['a', 'b'];
			expect(injector.annotate(fn)).toEqual(['a', 'b']);
		});

		it('returns the array-style annotations of a function', function() {
			var injector = createInjector([]);
			var fn = ['a', 'b', function() { }];
			expect(injector.annotate(fn)).toEqual(['a', 'b']);
		});

		it('returns an empty array for a non-annotated 0-arg function', function() {
			var injector = createInjector([]);
			var fn = function() { };
			expect(injector.annotate(fn)).toEqual([]);
		});

		it('returns annotations parsed from function args when not annotated', function() {
			var injector = createInjector([]);
			var fn = function(a, b) { };
			expect(injector.annotate(fn)).toEqual(['a', 'b']);
		});

		it('strips comments from argument lists when parsing', function() {
			var injector = createInjector([]);
			var fn = function(a, /*b,*/ c) { };
			expect(injector.annotate(fn)).toEqual(['a', 'c']);
		});

		it('strips several comments from argument lists when parsing', function() {
			var injector = createInjector([]);
			var fn = function(a, /*b,*/ c/*, d*/) { };
			expect(injector.annotate(fn)).toEqual(['a', 'c']);
		});

		it('strips // comments from argument lists when parsing', function() {
			var injector = createInjector([]);
			var fn = function(a, //b,
												c) { };
			expect(injector.annotate(fn)).toEqual(['a', 'c']);
		});

		it('strips surrounding underscores from argument names when parsing', function() {
			var injector = createInjector([]);
			var fn = function(a, _b_, c_, _d, an_argument) { };
			expect(injector.annotate(fn)).toEqual(['a', 'b', 'c_', '_d', 'an_argument']);
		});

		it('throws when using a non-annotated fn in strict mode', function() {
			var injector = createInjector([], true);
			var fn = function(a, b, c) { };
			expect(function() { 
				njector.annotate(fn);
			}).toThrow();
		});

		it('invokes an array-annotated function with dependency injection', function() {
			var module = angular.module('myModule', []);
			module.constant('a', 1);
			module.constant('b', 2);
			var injector = createInjector(['myModule']);
			var fn = ['a', 'b', function(one, two) {
				return one + two;
			}];
			expect(injector.invoke(fn)).toBe(3);
		});

		it('invokes a non-annotated function with dependency injection', function() {
			var module = angular.module('myModule', []);
			module.constant('a', 1);
			module.constant('b', 2);
			var injector = createInjector(['myModule']);
			var fn = function(a, b) {
				return a + b;
			};
			expect(injector.invoke(fn)).toBe(3);
		});

		it('instantiates an annotated constructor function', function() {
			var module = angular.module('myModule', []);
			module.constant('a', 1);
			module.constant('b', 2);
			var injector = createInjector(['myModule']);
			function Type(one, two) {
				this.result = one + two;
			}
			Type.$inject = ['a', 'b'];
			var instance = injector.instantiate(Type);
			expect(instance.result).toBe(3);
		});

		it('instantiates an array-annotated constructor function', function() {
			var module = angular.module('myModule', []);
			module.constant('a', 1);
			module.constant('b', 2);
			var injector = createInjector(['myModule']);
			function Type(one, two) {
			this.result = one + two; }
			var instance = injector.instantiate(['a', 'b', Type]);
			expect(instance.result).toBe(3);
		});

		it('instantiates a non-annotated constructor function', function() {
			var module = angular.module('myModule', []);
			module.constant('a', 1);
			module.constant('b', 2);
			var injector = createInjector(['myModule']);
			function Type(a, b) {
				this.result = a + b;
			}
			var instance = injector.instantiate(Type);
			expect(instance.result).toBe(3);
		});

		it('uses the prototype of the constructor when instantiating', function() {
			function BaseType() { }
			BaseType.prototype.getValue = _.constant(42);
			function Type() {
				this.v = this.getValue();
			}
			Type.prototype = BaseType.prototype;
			var module = angular.module('myModule', []);
			var injector = createInjector(['myModule']);
			var instance = injector.instantiate(Type);
			expect(instance.v).toBe(42);
		});

		it('supports locals when instantiating', function() {
			var module = angular.module('myModule', []);
			module.constant('a', 1);
			module.constant('b', 2);
			var injector = createInjector(['myModule']);
			function Type(a, b) {
			this.result = a + b; }
			var instance = injector.instantiate(Type, {b: 3});
			expect(instance.result).toBe(4);
		});

	});

});
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


/* global setupModuleLoader: false */
/* global window: false */

'use strict';

beforeEach(function() {
	delete window.angular;
});

describe('setupModuleLoader', function() {

	it('exposes angular on the window', function() {
		setupModuleLoader(window);
		expect(window.angular).toBeDefined();
	});

	it('creates angular just once', function() {
		setupModuleLoader(window);
		var ng = window.angular;
		setupModuleLoader(window);
		expect(window.angular).toBe(ng);
	});

	it('exposes the angular module function', function() {
		setupModuleLoader(window);
		expect(window.angular.module).toBeDefined();
	});

	it('exposes the angular module function just once', function() {
		setupModuleLoader(window);
		var module = window.angular.module;
		setupModuleLoader(window);
		expect(window.angular.module).toBe(module);
	});

});

describe('modules', function() {
	beforeEach(function() {
		setupModuleLoader(window);
	});

	it('allows registering a module', function() {
		var myModule = window.angular.module('myModule', []);
		expect(myModule).toBeDefined();
		expect(myModule.name).toEqual('myModule');
	});

	it('replaces a module when registered with same name again', function() {
		var myModule = window.angular.module('myModule', []);
		var myNewModule = window.angular.module('myModule', []);
		expect(myNewModule).not.toBe(myModule);
	});

	it('attaches the requires array to the registered module', function() {
		var myModule = window.angular.module('myModule', ['myOtherModule']);
		expect(myModule.requires).toEqual(['myOtherModule']);
	});

	it('allows getting a module', function() {
		var myModule = window.angular.module('myModule', []);
		var gotModule = window.angular.module('myModule');
		expect(gotModule).toBeDefined();
		expect(gotModule).toBe(myModule);
	});

	it('throws when trying to get a nonexistent module', function() {
		expect(function() {
			window.angular.module('myModule');
		}).toThrow();
	});

	it('does not allow a module to be called hasOwnProperty', function() {
		expect(function() {
			window.angular.module('hasOwnProperty', []);
		}).toThrow();
	});
	
});


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
/* global setupModuleLoader: false */
/* global window: false */

'use strict';

describe('router', function() {
	var myModule,
			angular;

	beforeEach(function() {

		spyOn(crossroads, 'addRoute');
		spyOn(crossroads, 'parse');

		delete window.angular;
		setupModuleLoader(window);
		myModule = window.angular.module('myModule', []);
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