var forFilter = require('./../helpers/forFilter');

Latte.prototype.registerFilter('pre', function (s) {
  return forFilter(s);
});
