var ternaryFilter = require('./../helpers/ternaryFilter');

Latte.prototype.registerFilter('pre', function (s)
{
  return ternaryFilter(s);
});
