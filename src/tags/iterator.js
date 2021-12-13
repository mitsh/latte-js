Latte.prototype.registerFilter('pre', function (s)
{
  return s.replace(new RegExp('\\$iterator->', 'g'), '$iterator@');
});
