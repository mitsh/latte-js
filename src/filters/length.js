var isObjectLike        = require('es5-util/js/isObjectLike');
var toAssociativeValues = require('es5-util/js/toAssociativeValues');

Latte.prototype.registerPlugin(
  'modifier',
  'length',
  function (s)
  {
    if (s == null)
    {
      return 0;
    }

    return (isObjectLike(s) ? toAssociativeValues(s) : s).length;
  }
);
