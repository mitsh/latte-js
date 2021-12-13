var substr = require('es5-util/js/substr');

var substring = function (s, start, length, validatePositions)
{
  return substr(s, start, length, !!validatePositions);
};

Latte.prototype.registerPlugin('modifier', 'substring', substring);
Latte.prototype.registerPlugin('modifier', 'substr', substring);
