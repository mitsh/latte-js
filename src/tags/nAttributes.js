var nAttributesFilter = require('./../helpers/nAttributesFilter');

Latte.prototype.registerFilter('pre', function (s) {
  return nAttributesFilter(s, Latte.prototype.left_delimiter || this.ldelim || '{', Latte.prototype.right_delimiter || this.rdelim || '}');
});
