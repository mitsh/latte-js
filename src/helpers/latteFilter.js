var encodeTemplate = require('./encodeTemplate');
var replaceParts   = require('./replaceParts');
var explode        = require('es5-util/js/toArray');
var implode        = require('es5-util/js/toString');

function latteFilter(s, ldelim, rdelim)
{
  //  force comma after template name
  s = s.replace(/({include ["']{1}[A-Za-z0-9]+["']{1})(,?)/g, "$1,");

  ldelim = ldelim != null ? ldelim : '{';
  rdelim = rdelim != null ? rdelim : '}';

  var es    = encodeTemplate(s, ldelim, rdelim);
  var re    = new RegExp(ldelim + '{1}(include){1}\\s[^' + rdelim + ']*?' + rdelim + '{1}', 'img');
  var found = es.s.match(re);

  if (!found)
  {
    return s;
  }

  var replace = [];

  found.forEach(function (foundItem, i)
  {
    var foundItemInner = foundItem.slice(ldelim.length, -ldelim.length);
    var foundParts     = explode(foundItemInner, ',');
    var replacedParts  = [];

    foundParts.forEach(function (foundPart)
    {
      foundPart = foundPart.replace('=>', '=').trim();
      if (foundPart.length > 0)
      {
        replacedParts.push(foundPart);
      }
    });

    replace[i] = ldelim + implode(replacedParts, ' ').trim() + rdelim;
  });

  var ep = replaceParts(es.s, found, 24);

  return es.decode(ep.returnParts(ep.s, replace));
}

module.exports = latteFilter;
