var toUpperCase = require('es5-util/js/toUpperCase');

Latte.prototype.registerPlugin(
	'modifier',
	'capitalize',
	function (s, preserveCase) {
		return toUpperCase(s, 'words', !!preserveCase);
	}
);
