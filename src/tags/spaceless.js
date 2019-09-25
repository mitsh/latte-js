Latte.prototype.registerPlugin(
	'block',
	'spaceless',
	function (params, content, data, repeat) {
		if (repeat.value) {
			return '';
		}
		return content.replace(/[ \t]*[\r\n]+[ \t]*/g, '');
	}
);
