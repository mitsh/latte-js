var varFilter = require('./../helpers/varFilter');

Latte.prototype.registerFilter('pre', function (s) {
  return varFilter(s);
});
