var processDelims = require('./../helpers/replaceDelims').processDelims;

Latte.prototype.registerPlugin(
  'function',
  'l',
  function (params, data)
  {
    return Latte.prototype.left_delimiter || data.latte.ldelim;
  }
);

Latte.prototype.registerPlugin(
  'function',
  'r',
  function (params, data)
  {
    return Latte.prototype.right_delimiter || data.latte.rdelim;
  }
);

Latte.prototype.registerFilter('post', function (s)
{
  return processDelims(s, this.latte.ldelim, this.latte.rdelim);
});
