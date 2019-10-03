var smartyFilter = require('./../helpers/smartyFilter');

Latte.prototype.registerFilter('pre', function (s) {
  return smartyFilter(s);
});
