var latteFilter = require('./../helpers/latteFilter');

Latte.prototype.registerFilter('pre', function (s)
{
  return latteFilter(s);
});
