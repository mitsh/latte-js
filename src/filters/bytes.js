var toBytes = require('es5-util/js/toBytes');

Latte.prototype.registerPlugin(
	'modifier',
	'bytes',
	function (s, precision) {
		precision = precision != null ? precision : 2;
		return toBytes(s, precision);
	}
);
