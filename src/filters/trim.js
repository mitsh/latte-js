var trim = require('locutus/php/strings/trim');

Latte.prototype.registerPlugin(
  'modifier',
  'trim',
  function (s, charlist)
  {
    charlist = charlist != null ? charlist : " \t\n\r\0\x0B";
    return trim(String(s), charlist);
  }
);
