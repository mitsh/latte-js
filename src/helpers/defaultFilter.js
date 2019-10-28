var getNestedParts = require('./getNestedParts');
var replaceParts = require('./replaceParts');
var explode = require('es5-util/js/toArray');
var implode = require('es5-util/js/toString');

function defaultFilter(s, ldelim, rdelim) {
  var str = s, a, z;

  ldelim = ldelim != null ? ldelim : '{';
  rdelim = rdelim != null ? rdelim : '}';

  var re = new RegExp('([\\S\\s]*)(' + ldelim + '{1})(default{1})(\\s)([^' + rdelim + ']*?)(' + rdelim + '{1})([\\S\\s]*)', 'img');
  a = str.replace(re, "$1");
  s = str.replace(re, "$5");
  z = str.replace(re, "$7");

  if (s === str) {
    return s;
  }

  var braces = replaceParts(s, getNestedParts(s, '[', ']'), 24);
  var parens = replaceParts(braces.s, getNestedParts(braces.s, '(', ')'), 24);
  var paramParts = explode(parens.s, ',');

  paramParts.forEach(function (param, index, paramParts) {
    var equalPos = param.indexOf('=');
    var variable = param.slice(0, equalPos).trim();
    var value = param.slice(equalPos + 1).trim();
    paramParts[index] = ldelim + variable + ' = ' + variable + '|default:' + value + rdelim;
  });

  return defaultFilter(a + braces.returnParts(parens.returnParts(implode(paramParts, ''))) + z, ldelim, rdelim);
}

module.exports = defaultFilter;
