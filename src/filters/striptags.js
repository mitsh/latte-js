var strip_tags = require('locutus/php/strings/strip_tags');

Latte.prototype.registerPlugin(
  'modifier',
  'striptags',
  function (s)
  {
    return strip_tags(s);
  }
);
