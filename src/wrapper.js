(function () {
	var factory = function (lodash, crossroads, hasher) {
		<%= contents %>
		return f3;
	};

	window['f3'] = factory(window['lodash'], window['crossroads'], window['hasher']);
}

}());