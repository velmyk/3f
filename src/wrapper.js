(function () {
	var factory = function (lodash, crossroads, hasher) {
		<%= contents %>

		setupModuleLoader(window);

		window.f3.createInjector = createInjector;
		window.f3.createRouter = createRouter;
	};

	factory(window['lodash'], window['crossroads'], window['hasher']);

}());