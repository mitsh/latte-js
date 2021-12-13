var latteObjectFilter = require('./latteObjectFilter');

function getDefaultTags(obj)
{
  var s = [];

  for (var key in obj)
  {
    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(String(key)))
    {
      s.push('{$' + String(key) + ' = $' + String(key) + '|default:' + latteObjectFilter(obj[key]) + '}')
    }
  }

  return s.join('');
}

module.exports = getDefaultTags;
