var toUpperCase = require('es5-util/js/toUpperCase');

Latte.prototype.registerPlugin(
	'modifier',
	'firstUpper',
	function (s, preserveCase) {
		return toUpperCase(s, 'first', !!preserveCase);
	}
);
