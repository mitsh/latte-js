var str_repeat = require('locutus/php/strings/str_repeat');

Latte.prototype.registerPlugin(
  'modifier',
  'repeat',
  function (s, count)
  {
    return str_repeat(String(s), ~~count);
  }
);
