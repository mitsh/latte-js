var encodeTemplate = require('./encodeTemplate');
var replaceParts = require('./replaceParts');
var explode = require('locutus/php/strings/explode');

function forFilter(s, ldelim, rdelim) {
  ldelim = ldelim != null ? ldelim : '{';
  rdelim = rdelim != null ? rdelim : '}';

  var es = encodeTemplate(s, ldelim, rdelim);
  var re = new RegExp(ldelim + '{1}(?:for ){1}([^};]*?);{1}([^};]*?);{1}([^}]*?)' + rdelim + '{1}', 'mg');
  var found = es.s.match(re);

  if (!found) {
    return s;
  }

  var replace = [];

  found.forEach(function (foundItem, i) {
    var parts, expr1, expr2, expr3, variable, step = '1';
    foundItem = foundItem.slice(ldelim.length + 'for '.length, -ldelim.length);

    if ((parts = explode(';', foundItem, 3)).length !== 3) {
      return replace[i] = foundItem;
    }

    expr1 = parts[0].trim() || '$i = 0';
    expr2 = parts[1].trim();
    expr3 = parts[2].trim();

    var expr3match = expr3.match(/([+-]{1})([+-=]{1})([^, ;}]*)/) || [];
    if (expr3match[2] === '=') {
      step = expr3match[3] || '1';
    }
    if (expr3match[1] === '-') {
      step = '-' + step;
    }

    var expr2match = expr2.match(/([<>]{1})(=?) *(.*)/) || [];
    var glt = expr2match[1] || '<';
    var glte = expr2match[2] || '';
    var condition = expr2match[3] || '2';

    if (glte !== '=') {
      condition += glt === '<' ? '-1' : '+1';
    }

    replace[i] = '{for ' + expr1 + ' to ' + condition + (step != '1' ? ' step ' + step : '') + '}';
  });

  var ep = replaceParts(es.s, found, 24);

  return es.decode(ep.returnParts(ep.s, replace));
}

module.exports = forFilter;
