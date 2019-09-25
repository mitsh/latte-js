var hasKeys = require('es5-util/js/hasKeys');

if (hasKeys(Latte.prototype, 'filtersGlobal.params') || hasKeys(Latte.prototype, 'filters_global.params')) {
	Latte.prototype.registerFilter('params', function (actualParams) {
		if (actualParams.hasOwnProperty('expand') && typeof actualParams.expand === 'object') {
			for (var prop in actualParams.expand) {
				actualParams[prop] = actualParams.expand[prop];
			}
		}

		return actualParams;
	});
}

Latte.prototype.registerFilter('pre', function (s) {
	return s.replace(/({)(((?! \(expand\) ).)*)( \(expand\) )([^}]*)(})/img, "$1$2 expand=$5$6");
});
