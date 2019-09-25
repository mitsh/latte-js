/*!
 * LatteJS template engine (v@VERSION)
 * https://github.com/pfaciana/latte-js
 *
 * https://opensource.org/licenses/MIT
 *
 * Date: @DATE
 */
(function (factory) {
  'use strict'

  if (typeof module === 'object' && module && typeof module.exports === 'object') {
    // Node.js like environment. Export Latte
    module.exports = factory()
  } else {
    if (typeof window === 'object' && window.document) {
      // Assign to browser window if window is present.
      window.Latte = factory()
    }

    if (typeof define === 'function' && define.amd) {
      // Require js is present? Lets define module.
      define('Latte', [], factory)
    }
  }

// Pass this if window is not defined yet
})(function () {
  'use strict'

  // @CODE

  String.prototype.fetch = function (data) { // eslint-disable-line no-extend-native
    var template = new Latte(this)
    return template.fetch(data)
  }

  return Latte
})
