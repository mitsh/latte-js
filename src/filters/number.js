var toNumber = require('es5-util/js/toNumber');
var number_format = require('locutus/php/strings/number_format');

Latte.prototype.registerPlugin(
	'modifier',
	'number',
	function (s, decimals, dec_point, thousands_sep) {
		decimals = decimals != null ? decimals : 0;
		dec_point = dec_point != null ? dec_point : '.';
		thousands_sep = thousands_sep != null ? thousands_sep : ',';
		return number_format(toNumber(s), decimals, dec_point, thousands_sep);
	}
);
