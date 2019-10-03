Latte.prototype.registerPlugin(
	'function',
	'l',
	function (params, data) {
		return Latte.prototype.left_delimiter || data.smarty.ldelim;
	}
);

Latte.prototype.registerPlugin(
	'function',
	'r',
	function (params, data) {
		return Latte.prototype.right_delimiter || data.smarty.rdelim;
	}
);
