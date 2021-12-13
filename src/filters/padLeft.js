var str_pad = require('locutus/php/strings/str_pad');

Latte.prototype.registerPlugin(
  'modifier',
  'padLeft',
  function (s, length, pad)
  {
    return str_pad(String(s), length, pad != null ? pad : ' ', 'STR_PAD_LEFT');
  }
);
