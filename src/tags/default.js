var defaultFilter = require('./../helpers/defaultFilter');

Latte.prototype.registerFilter('pre', function (s)
{
  return defaultFilter(s);
});
