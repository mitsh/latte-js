var toString = require('es5-util/js/toString');

Latte.prototype.registerPlugin(
  'modifier',
  'implode',
  function (arr, glue, keyGlue)
  {
    return toString(arr, glue != null ? glue : '', keyGlue);
  }
);
