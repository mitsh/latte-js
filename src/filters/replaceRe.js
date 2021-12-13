var findReplace = require('es5-util/js/findReplace');

Latte.prototype.registerPlugin(
  'modifier',
  'replaceRe',
  function (s, find, replace)
  {
    return findReplace(s, find, replace);
  }
);
