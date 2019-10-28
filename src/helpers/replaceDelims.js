function replaceDelims(s, ldelim, rdelim) {
  ldelim = ldelim != null ? ldelim : '{';
  rdelim = rdelim != null ? rdelim : '}';

  s = s.replace(new RegExp(ldelim + 'l' + rdelim, 'g'), '__ldelim__');
  s = s.replace(new RegExp(ldelim + 'r' + rdelim, 'g'), '__rdelim__');

  return s;
}

function returnDelims(s, ldelim, rdelim) {
  ldelim = ldelim != null ? ldelim : '{';
  rdelim = rdelim != null ? rdelim : '}';

  s = s.replace(new RegExp('__ldelim__', 'g'), ldelim + 'l' + rdelim);
  s = s.replace(new RegExp('__rdelim__', 'g'), ldelim + 'r' + rdelim);

  return s;
}


module.exports.replaceDelims = replaceDelims;

module.exports.returnDelims = returnDelims;
