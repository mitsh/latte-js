function varFilter(s, ldelim, rdelim)
{
  ldelim = ldelim != null ? ldelim : '{';
  rdelim = rdelim != null ? rdelim : '}';

  var prev = '',
      re = new RegExp('(' + ldelim + '{1})(var{1})(\\s)(.*)(' + rdelim + '{1})', 'img');

  while (prev !== s)
  {
    s = (prev = s).replace(re, "$1$4$5");
  }

  return s;
}

module.exports = varFilter;
