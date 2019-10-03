function nAttributesFilter(s, ldelim, rdelim) {
  ldelim = ldelim != null ? ldelim : '{';
  rdelim = rdelim != null ? rdelim : '}';

  var re = new RegExp('(n:[A-Za-z0-9 ]+=[\\s]*)(["\'])(' + ldelim + '?)((?:(?!\\2)[^}])*)(' + rdelim + '?)(\\2)', 'img');
  return s.replace(re, "$1$2" + ldelim + "$4" + rdelim + "$2");
}

module.exports = nAttributesFilter;
