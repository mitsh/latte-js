var encodeTemplate = require('./encodeTemplate');
var replaceParts   = require('./replaceParts');
var explode        = require('locutus/php/strings/explode');

function ternaryFilter(s, ldelim, rdelim)
{
  ldelim = ldelim != null ? ldelim : '{';
  rdelim = rdelim != null ? rdelim : '}';

  var es    = encodeTemplate(s, ldelim, rdelim);
  var re    = new RegExp(ldelim + '{1}([^?' + rdelim + ']+?)\\?([^:?' + rdelim + ']*?)[:?]{1}([^' + rdelim + ']*?)' + rdelim + '{1}', 'mg');
  var found = es.s.match(re);

  if (!found)
  {
    return s;
  }

  var replace = [];

  found.forEach(function (foundItem, i)
  {
    var variable = null,
        condition,
        truthy,
        falsy,
        parts;

    condition = foundItem.slice(ldelim.length, -ldelim.length);
    parts     = explode(' = ', condition, 2);

    if (parts.length === 2)
    {
      variable  = parts[0].trim();
      condition = parts[1].trim();
    }

    if ((parts = explode(' ?? ', condition, 2)).length === 2)
    {
      truthy    = parts[0].trim();
      falsy     = parts[1].trim();
      condition = truthy + ' !== ' + "''";
    }
    else if ((parts = explode(' ?: ', condition, 2)).length === 2)
    {
      condition = truthy = parts[0].trim();
      falsy     = parts[1].trim();
    }
    else
    {
      if ((parts = explode(' ? ', condition, 2)).length < 2)
      {
        return replace[i] = foundItem;
      }

      if (parts.length === 2)
      {
        condition = parts[0].trim();
        truthy    = parts[1].trim();
      }

      if ((parts = explode(' : ', truthy, 2)).length < 2)
      {
        return replace[i] = foundItem;
      }

      if (parts.length === 2)
      {
        truthy = parts[0].trim();
        falsy  = parts[1].trim();
      }
    }

    if (!variable)
    {
      return replace[i] = '{if ' + condition + '}{' + truthy + '}{else}{' + falsy + '}{/if}';
    }

    replace[i] = '{if ' + condition + '}{' + variable + ' = ' + truthy + '}{else}{' + variable + ' = ' + falsy + '}{/if}';
  });

  var ep = replaceParts(es.s, found, 24);

  return es.decode(ep.returnParts(ep.s, replace));
}

module.exports = ternaryFilter;
