var isNotSetLoose = require('es5-util/js/isNotSetLoose');
var toUnixTime = require('es5-util/js/toUnixTime');
var strftime = require('locutus/php/datetime/strftime');

Latte.prototype.registerPlugin(
	'modifier',
	'date',
	function (time, format, defaultDate) {
		if (isNotSetLoose(time) || !time) {
			if (isNotSetLoose(defaultDate)) {
				return '';
			}
			time = defaultDate;
		}

		return strftime(format != null ? format : '%b %e, %Y', toUnixTime(time));
	}
);
