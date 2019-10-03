function varFilter(s, ldelim, rdelim) {
  ldelim = ldelim != null ? ldelim : '{';
  rdelim = rdelim != null ? rdelim : '}';

  var re = new RegExp('(' + ldelim + '{1})(var{1})(\\s)(.*)(' + rdelim + '{1})', 'img');
  return s.replace(re, "$1$4$5");
}

module.exports = varFilter;
