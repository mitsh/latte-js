var isArrayLikeObject = require('es5-util/js/isArrayLikeObject');
var toArray           = require('es5-util/js/toArray');
var array_reverse     = require('locutus/php/array/array_reverse');
var strrev            = require('locutus/php/strings/strrev');

Latte.prototype.registerPlugin(
  'modifier',
  'reverse',
  function (s, preserveKeys)
  {
    if (isArrayLikeObject(s))
    {
      return array_reverse(toArray(s), !!preserveKeys);
    }

    return strrev(String(s));
  });
