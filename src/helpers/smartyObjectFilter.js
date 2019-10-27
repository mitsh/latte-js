var isArrayLikeObject = require('es5-util/js/isArrayLikeObject');
var isObject = require('es5-util/js/isObject');

function smartyObjectFilter(input) {
  if (!isObject(input)) {
    return input == null ? '""' : JSON.stringify(input);
  }

  var items = [];

  for (var key in input) {
    if (input.hasOwnProperty(key) || typeof input[key] !== 'function') {
      items.push((isArrayLikeObject(input) ? '' : '"' + key + '"=>') + smartyObjectFilter(input[key]));
    }
  }

  return '[' + items.join(',') + ']';
}

module.exports = smartyObjectFilter;
