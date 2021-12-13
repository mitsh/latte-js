var isArrayLikeObject = require('es5-util/js/isArrayLikeObject');
var isObject          = require('es5-util/js/isObject');

function latteObjectFilter(input)
{
  if (!isObject(input))
  {
    if (input == null)
    {
      return '""';
    }

    var noStringify = '!ns ';
    if (typeof input === 'string' && input.substring(0, noStringify.length) === noStringify)
    {
      return input.slice(noStringify.length);
    }

    return JSON.stringify(input);
  }

  var items = [];

  for (var key in input)
  {
    if (input.hasOwnProperty(key) || typeof input[key] !== 'function')
    {
      items.push((isArrayLikeObject(input) ? '' : '"' + key + '"=>') + latteObjectFilter(input[key]));
    }
  }

  return '[' + items.join(',') + ']';
}

module.exports = latteObjectFilter;
