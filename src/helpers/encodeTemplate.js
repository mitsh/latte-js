var getNestedParts = require('./getNestedParts');
var replaceParts   = require('./replaceParts');
var replaceDelims  = require('./replaceDelims').replaceDelims;
var returnDelims   = require('./replaceDelims').returnDelims;

function encodeTemplate(str, ldelim, rdelim, length, getUID)
{
  ldelim = ldelim != null ? ldelim : '{';
  rdelim = rdelim != null ? rdelim : '}';
  length = length != null ? length : 24;

  var delims = replaceDelims(str, ldelim, rdelim);
  var braces = replaceParts(delims, getNestedParts(delims, '[', ']'), length, getUID);
  var parens = replaceParts(braces.s, getNestedParts(braces.s, '(', ')'), length, getUID);

  return {
    s     : parens.s,
    decode: function (newStr)
    {
      newStr = newStr != null ? newStr : parens.s;
      return returnDelims(braces.returnParts(parens.returnParts(newStr)));
    },
  };
}

module.exports = encodeTemplate;
