var getNestedParts = require('./../helpers/getNestedParts');
var replaceParts = require('./../helpers/replaceParts');
var explode = require('es5-util/js/toArray');
var implode = require('es5-util/js/toString');

function smartyFilter(s, ldelim, rdelim) {
  //  force comma after template name
  s = s.replace(/({include ["']{1}[A-Za-z0-9]+["']{1})(,?)/g, "$1,");

  var str = s, a, z;

  ldelim = ldelim != null ? ldelim : '{';
  rdelim = rdelim != null ? rdelim : '}';

  var re = new RegExp('([\\S\\s]*)(' + ldelim + '{1})(include{1})(\\s)(.*)(' + rdelim + '{1})([\\S\\s]*)', 'img');
  a = str.replace(re, "$1$2$3$4");
  s = str.replace(re, "$5");
  z = str.replace(re, "$6$7");

  if (s === str) {
    return s;
  }

  var braces = replaceParts(s, getNestedParts(s, '[', ']'), 24);
  var parens = replaceParts(braces.s, getNestedParts(braces.s, '(', ')'), 24);
  var paramParts = explode(parens.s, ',');

  paramParts.forEach(function (param, index, paramParts) {
    paramParts[index] = param.replace('=>', '=').trim();
  });

  return a + braces.returnParts(parens.returnParts(implode(paramParts, ' '))) + z;
}

module.exports = smartyFilter;
