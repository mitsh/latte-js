var htmlspecialchars = require('locutus/php/strings/htmlspecialchars');

Latte.prototype.registerPlugin(
	'modifier',
	'breaklines',
	function (s) {
		if (s == null) {
			return '';
		}

		return htmlspecialchars(s, 0, 'UTF-8').replace(/(\r\n|\n\r|\r|\n)/g, '<br />\n');
	}
);
