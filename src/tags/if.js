var isEmptyLoose = require('es5-util/js/isEmptyLoose');
var isNotEmptyLoose = require('es5-util/js/isNotEmptyLoose');
var isNotSetLoose = require('es5-util/js/isNotSetLoose');
var isSetLoose = require('es5-util/js/isSetLoose');

if (typeof Object.assign !== 'function') {
	Object.defineProperty(Object, "assign", {
		value: function assign(target, varArgs) {
			if (target === null || target === undefined) {
				throw new TypeError('Cannot convert undefined or null to object');
			}

			var to = Object(target);

			for (var index = 1; index < arguments.length; index++) {
				var nextSource = arguments[index];

				if (nextSource !== null && nextSource !== undefined) {
					for (var nextKey in nextSource) {
						// Avoid bugs when hasOwnProperty is shadowed
						if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
							to[nextKey] = nextSource[nextKey];
						}
					}
				}
			}
			return to;
		},
		writable: true,
		configurable: true
	});
}

var preserveData = function (data, repeat) {
	if (repeat.value && !data.hasOwnProperty('__orig')) {
		data.__orig = Object.assign({}, data);
	} else if (!repeat.value && data.hasOwnProperty('__orig')) {
		for (var key in data.__orig) {
			if (data.__orig.hasOwnProperty(key)) {
				data[key] = data.__orig[key];
			}
		}
		delete data.__orig;
	}
	return '';
};

Latte.prototype.registerPlugin(
	'block',
	'ifset',
	function (params, content, data, repeat) {
		if (repeat.value || isNotSetLoose(params[0])) {
			return preserveData(data, repeat);
		}
		return content;
	}
);

Latte.prototype.registerPlugin(
	'block',
	'ifempty',
	function (params, content, data, repeat) {
		if (repeat.value || isNotEmptyLoose(params[0])) {
			return preserveData(data, repeat);
		}
		return content;
	}
);

Latte.prototype.registerPlugin(
	'block',
	'ifnotset',
	function (params, content, data, repeat) {
		if (repeat.value || isSetLoose(params[0])) {
			return preserveData(data, repeat);
		}
		return content;
	}
);

Latte.prototype.registerPlugin(
	'block',
	'ifnotempty',
	function (params, content, data, repeat) {
		if (repeat.value || isEmptyLoose(params[0])) {
			return preserveData(data, repeat);
		}
		return content;
	}
);
