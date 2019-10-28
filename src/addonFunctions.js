(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
function findReplace(string, find, replace) {
	replace = replace != null ? replace : '';

	if (typeof string !== 'string') {
		return string;
	}

	var pattern, regex;
	if ((pattern = find.match(/^ *\/(.*)\/(.*) *$/))) {
		regex = new RegExp(pattern[1], 'g' + (pattern.length > 1 ? pattern[2] : ''));
	} else {
		regex = new RegExp(find, 'g');
	}

	return string.replace(regex, replace);
}

module.exports = findReplace;
},{}],2:[function(require,module,exports){
function getUID(length, characters) {
	var charactersLength, result = '';

	length = length != null ? length : 7;
	characters = characters != null ? characters : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	charactersLength = characters.length;

	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}

	return result;
}

function getiUID(length) {
	return getUID(length, 'abcdefghijklmnopqrstuvwxyz0123456789');
}

function getUID16(length) {
	return getUID(length, '0123456789abcdef')
}

module.exports = getUID;

module.exports.getiUID = getiUID;

module.exports.getUID16 = getUID16;

},{}],3:[function(require,module,exports){
function hasKeys(object, path) {
	var keys = path.split('.');

	for (var index in keys) {
		object = object[keys[index]];
		if (typeof object === 'undefined') {
			return false;
		}
	}

	return true;
}

module.exports = hasKeys;
},{}],4:[function(require,module,exports){
function isArrayLikeObject(value) {
	function isLength(length) {
		return typeof length == 'number' && length > -1;
	}

	return value !== null && typeof value == 'object' && isLength(value.length);
}

module.exports = isArrayLikeObject;
},{}],5:[function(require,module,exports){
var isEmptyStrict = require('./isEmptyStrict');

function isEmptyLoose(value) {
	if (isEmptyStrict(value)) {
		return true;
	}

	return ['undefined', 'null', 'false'].indexOf(String(value)) > -1;
}

module.exports = isEmptyLoose;
},{"./isEmptyStrict":6}],6:[function(require,module,exports){
function isEmptyStrict(value) {
	if (typeof value === 'object') {
		for (var key in value) {
			if (value.hasOwnProperty(key) || typeof value[key] !== 'function') {
				return false;
			}
		}
		return true;
	}

	return [undefined, false, 0, '0', ''].indexOf(value) > -1;
}

module.exports = isEmptyStrict;
},{}],7:[function(require,module,exports){
var isEmptyLoose = require('./isEmptyLoose');

function isNotEmptyLoose(value) {
	return !isEmptyLoose(value);
}

module.exports = isNotEmptyLoose;
},{"./isEmptyLoose":5}],8:[function(require,module,exports){
var isSetLoose = require('./isSetLoose');

function isNotSetLoose(value) {
	return !isSetLoose(value);
}

module.exports = isNotSetLoose;
},{"./isSetLoose":12}],9:[function(require,module,exports){
var isSetTag = require('./isSetTag');

function isNotSetTag(value) {
	return !isSetTag(value);
}

module.exports = isNotSetTag;
},{"./isSetTag":13}],10:[function(require,module,exports){
function isObject(value) {
	return (typeof value == 'object' || typeof value == 'function') && value !== null;
}

module.exports = isObject;
},{}],11:[function(require,module,exports){
function isObjectLike(value) {
	return typeof value == 'object' && value !== null;
}

module.exports = isObjectLike;
},{}],12:[function(require,module,exports){
function isSetLoose(value) {
	return ['undefined', 'null'].indexOf(String(value)) === -1;
}

module.exports = isSetLoose;
},{}],13:[function(require,module,exports){
function isSetTag(value) {
	return ['undefined', 'null'].indexOf(String(value)) === -1 && value !== '';
}

module.exports = isSetTag;
},{}],14:[function(require,module,exports){
function round(value, precision) {
	precision |= 0;

	if (precision === 0) {
		return Math.round(value);
	}

	var m = Math.pow(10, precision);
	return Math.round(value * m) / m;
}

module.exports = round;
},{}],15:[function(require,module,exports){
var toString = require('./toString');

function substr(string, start, length, validatePositions) {
	length = length != null ? length : null;
	validatePositions = validatePositions != null ? validatePositions : false;

	string = toString(string);
	start |= 0;
	length = ~~(length) || undefined;
	var end = string.length;

	if (start < 0) {
		start += end;
	}

	if (length != null) {
		end = length + (length > 0 ? start : end);
	}

	validatePositions && start > end && (start = [end, end = start][0]);

	return string.slice(start, end);
}

module.exports = substr;
},{"./toString":20}],16:[function(require,module,exports){
function toArray(value, delimiter) {
	if (typeof value === 'undefined' || value === null) {
		return [];
	}

	if (typeof value === 'string') {
		return value.length > 0 ? value.split(delimiter != null ? delimiter : '') : [value];
	}

	if (Array.isArray(value) || typeof value === 'object') {
		var arr = [];
		for (var key in value) {
			if (Array.isArray(value) || value.hasOwnProperty(key) || typeof value.constructor === 'function') {
				arr.push(value[key]);
			}
		}
		return arr;
	}

	return [value];
}

module.exports = toArray;
},{}],17:[function(require,module,exports){
function toAssociativeValues(value) {
	if (typeof value === 'undefined') {
		return [];
	}

	if (typeof value !== 'object' || value === null) {
		return [value];
	}

	var arr = [];

	for (var key in value) {
		if (value.hasOwnProperty(key) || typeof value[key] !== 'function') {
			arr.push(value[key]);
		}
	}

	return arr;
}

module.exports = toAssociativeValues;
},{}],18:[function(require,module,exports){
var toNumber = require('./toNumber');

function toBytes(value, precision) {
	if (value == null || +value == 0) {
		return '0 B';
	}

	if (value === true || typeof value === 'function') {
		return '1 B';
	}

	if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'bigint') {
		for (var key in value) {
			if (value.hasOwnProperty(key)) {
				return '1 B';
			}
		}
		return '0 B';
	}

	var bytes = +(String(value).replace(/^\s+|\s+$/g, ''));

	if (isNaN(bytes)) {
		return '1 B';
	}

	var units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
	var end = units.slice(-1)[0];
	var unit = units[0];

	for (var i = 0, len = units.length; i < len; i++) {
		unit = units[i];
		if ((Math.abs(bytes) || 0) < 1024 || unit === end) {
			break;
		}
		bytes = bytes / 1024;
	}

	return toNumber(bytes, (precision != null ? precision : 2)) + ' ' + unit;
}

module.exports = toBytes;
},{"./toNumber":19}],19:[function(require,module,exports){
var round = require('./round');

function toNumber(value, precision) {
	precision = precision != null ? precision : null;

	if (['number', 'boolean', 'string'].indexOf(typeof value) > -1) {
		if (typeof value == 'string') {
			value = value.replace(/^\s+|\s+$/g, '');
		}

		return precision != null ? round(+value, precision) : +value;
	}

	return value === null ? 0 : NaN;
}

module.exports = toNumber;
},{"./round":14}],20:[function(require,module,exports){
function toString(value, glue, keyGlue) {
	if (typeof value === 'string') {
		return value;
	}

	if (value == null) {
		return '';
	}

	glue = glue != null ? glue : ',';
	keyGlue = typeof keyGlue != 'undefined' ? keyGlue : '=';

	if (typeof value === 'object' || typeof value === 'function') {
		var str = '', currentGlue = '';
		for (var key in value) {
			if (value.hasOwnProperty(key) || typeof value[key] !== 'function') {
				str += currentGlue + ((keyGlue && key != ~~key ? key + keyGlue : '') + value[key]);
				currentGlue = glue;
			}
		}
		return str;
	}

	if (String(value) == '0' && (1 / value) == -(1 / 0)) {
		return '-0';
	}

	return String(value);
}

module.exports = toString;
},{}],21:[function(require,module,exports){
var strtotime = require('locutus/php/datetime/strtotime');

function toUnixTime(date, preserveJsMs) {
	date = ['undefined', 'null', 'false', 'true'].indexOf(String(date)) > -1 ? new Date() : date;
	var divisor = preserveJsMs ? 1 : 1000;

	if (date instanceof Date) {
		return parseInt((date.getTime() / divisor).toFixed(0));
	}

	if (typeof date !== 'string' && typeof date !== 'number') {
		return NaN;
	}

	if (isNaN(date)) {
		date = strtotime(date);
		return isNaN(date) || date === false ? NaN : date;
	}

	if (String(date).length === 14) { // mysql timestamp format of YYYYMMDDHHMMSS
		date = String(date);
		return Math.floor((new Date(date.substr(0, 4), date.substr(4, 2) - 1, date.substr(6, 2), date.substr(8, 2), date.substr(10, 2)).getTime() / divisor));
	}

	return isNaN(date) || date === Infinity ? NaN : ~~date;
}

module.exports = toUnixTime;
},{"locutus/php/datetime/strtotime":26}],22:[function(require,module,exports){
function toUpperCase(s, option, preserveCase) {
	option = option != null ? option : null;
	s = preserveCase || preserveCase == null ? String(s) : String(s).toLowerCase();

	if (['first', false, 0, '0'].indexOf(option) > -1) {
		var first = s.charAt(0).toUpperCase();
		var rest = s.slice(1);

		return first + rest;
	}

	if (['words', true, 1, '1'].indexOf(option) > -1) {

		return s.replace(/^(.)|\s+(.)/g, function ($1) {
			return $1.toUpperCase();
		});
	}

	return s.toUpperCase();
}

module.exports = toUpperCase;
},{}],23:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

module.exports = function _phpCastString(value) {
  // original by: Rafał Kukawski
  //   example 1: _phpCastString(true)
  //   returns 1: '1'
  //   example 2: _phpCastString(false)
  //   returns 2: ''
  //   example 3: _phpCastString('foo')
  //   returns 3: 'foo'
  //   example 4: _phpCastString(0/0)
  //   returns 4: 'NAN'
  //   example 5: _phpCastString(1/0)
  //   returns 5: 'INF'
  //   example 6: _phpCastString(-1/0)
  //   returns 6: '-INF'
  //   example 7: _phpCastString(null)
  //   returns 7: ''
  //   example 8: _phpCastString(undefined)
  //   returns 8: ''
  //   example 9: _phpCastString([])
  //   returns 9: 'Array'
  //   example 10: _phpCastString({})
  //   returns 10: 'Object'
  //   example 11: _phpCastString(0)
  //   returns 11: '0'
  //   example 12: _phpCastString(1)
  //   returns 12: '1'
  //   example 13: _phpCastString(3.14)
  //   returns 13: '3.14'

  var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);

  switch (type) {
    case 'boolean':
      return value ? '1' : '';
    case 'string':
      return value;
    case 'number':
      if (isNaN(value)) {
        return 'NAN';
      }

      if (!isFinite(value)) {
        return (value < 0 ? '-' : '') + 'INF';
      }

      return value + '';
    case 'undefined':
      return '';
    case 'object':
      if (Array.isArray(value)) {
        return 'Array';
      }

      if (value !== null) {
        return 'Object';
      }

      return '';
    case 'function':
    // fall through
    default:
      throw new Error('Unsupported value type');
  }
};

},{}],24:[function(require,module,exports){
'use strict';

module.exports = function array_reverse(array, preserveKeys) {
  // eslint-disable-line camelcase
  //  discuss at: http://locutus.io/php/array_reverse/
  // original by: Kevin van Zonneveld (http://kvz.io)
  // improved by: Karol Kowalski
  //   example 1: array_reverse( [ 'php', '4.0', ['green', 'red'] ], true)
  //   returns 1: { 2: ['green', 'red'], 1: '4.0', 0: 'php'}

  var isArray = Object.prototype.toString.call(array) === '[object Array]';
  var tmpArr = preserveKeys ? {} : [];
  var key;

  if (isArray && !preserveKeys) {
    return array.slice(0).reverse();
  }

  if (preserveKeys) {
    var keys = [];
    for (key in array) {
      keys.push(key);
    }

    var i = keys.length;
    while (i--) {
      key = keys[i];
      // @todo: don't rely on browsers keeping keys in insertion order
      // it's implementation specific
      // eg. the result will differ from expected in Google Chrome
      tmpArr[key] = array[key];
    }
  } else {
    for (key in array) {
      tmpArr.unshift(array[key]);
    }
  }

  return tmpArr;
};

},{}],25:[function(require,module,exports){
(function (global){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

module.exports = function strftime(fmt, timestamp) {
  //       discuss at: http://locutus.io/php/strftime/
  //      original by: Blues (http://tech.bluesmoon.info/)
  // reimplemented by: Brett Zamir (http://brett-zamir.me)
  //         input by: Alex
  //      bugfixed by: Brett Zamir (http://brett-zamir.me)
  //      improved by: Brett Zamir (http://brett-zamir.me)
  //           note 1: Uses global: locutus to store locale info
  //        example 1: strftime("%A", 1062462400); // Return value will depend on date and locale
  //        returns 1: 'Tuesday'

  var setlocale = require('../strings/setlocale');

  var $global = typeof window !== 'undefined' ? window : global;
  $global.$locutus = $global.$locutus || {};
  var $locutus = $global.$locutus;

  // ensure setup of localization variables takes place
  setlocale('LC_ALL', 0);

  var _xPad = function _xPad(x, pad, r) {
    if (typeof r === 'undefined') {
      r = 10;
    }
    for (; parseInt(x, 10) < r && r > 1; r /= 10) {
      x = pad.toString() + x;
    }
    return x.toString();
  };

  var locale = $locutus.php.localeCategories.LC_TIME;
  var lcTime = $locutus.php.locales[locale].LC_TIME;

  var _formats = {
    a: function a(d) {
      return lcTime.a[d.getDay()];
    },
    A: function A(d) {
      return lcTime.A[d.getDay()];
    },
    b: function b(d) {
      return lcTime.b[d.getMonth()];
    },
    B: function B(d) {
      return lcTime.B[d.getMonth()];
    },
    C: function C(d) {
      return _xPad(parseInt(d.getFullYear() / 100, 10), 0);
    },
    d: ['getDate', '0'],
    e: ['getDate', ' '],
    g: function g(d) {
      return _xPad(parseInt(this.G(d) / 100, 10), 0);
    },
    G: function G(d) {
      var y = d.getFullYear();
      var V = parseInt(_formats.V(d), 10);
      var W = parseInt(_formats.W(d), 10);

      if (W > V) {
        y++;
      } else if (W === 0 && V >= 52) {
        y--;
      }

      return y;
    },
    H: ['getHours', '0'],
    I: function I(d) {
      var I = d.getHours() % 12;
      return _xPad(I === 0 ? 12 : I, 0);
    },
    j: function j(d) {
      var ms = d - new Date('' + d.getFullYear() + '/1/1 GMT');
      // Line differs from Yahoo implementation which would be
      // equivalent to replacing it here with:
      ms += d.getTimezoneOffset() * 60000;
      var doy = parseInt(ms / 60000 / 60 / 24, 10) + 1;
      return _xPad(doy, 0, 100);
    },
    k: ['getHours', '0'],
    // not in PHP, but implemented here (as in Yahoo)
    l: function l(d) {
      var l = d.getHours() % 12;
      return _xPad(l === 0 ? 12 : l, ' ');
    },
    m: function m(d) {
      return _xPad(d.getMonth() + 1, 0);
    },
    M: ['getMinutes', '0'],
    p: function p(d) {
      return lcTime.p[d.getHours() >= 12 ? 1 : 0];
    },
    P: function P(d) {
      return lcTime.P[d.getHours() >= 12 ? 1 : 0];
    },
    s: function s(d) {
      // Yahoo uses return parseInt(d.getTime()/1000, 10);
      return Date.parse(d) / 1000;
    },
    S: ['getSeconds', '0'],
    u: function u(d) {
      var dow = d.getDay();
      return dow === 0 ? 7 : dow;
    },
    U: function U(d) {
      var doy = parseInt(_formats.j(d), 10);
      var rdow = 6 - d.getDay();
      var woy = parseInt((doy + rdow) / 7, 10);
      return _xPad(woy, 0);
    },
    V: function V(d) {
      var woy = parseInt(_formats.W(d), 10);
      var dow11 = new Date('' + d.getFullYear() + '/1/1').getDay();
      // First week is 01 and not 00 as in the case of %U and %W,
      // so we add 1 to the final result except if day 1 of the year
      // is a Monday (then %W returns 01).
      // We also need to subtract 1 if the day 1 of the year is
      // Friday-Sunday, so the resulting equation becomes:
      var idow = woy + (dow11 > 4 || dow11 <= 1 ? 0 : 1);
      if (idow === 53 && new Date('' + d.getFullYear() + '/12/31').getDay() < 4) {
        idow = 1;
      } else if (idow === 0) {
        idow = _formats.V(new Date('' + (d.getFullYear() - 1) + '/12/31'));
      }
      return _xPad(idow, 0);
    },
    w: 'getDay',
    W: function W(d) {
      var doy = parseInt(_formats.j(d), 10);
      var rdow = 7 - _formats.u(d);
      var woy = parseInt((doy + rdow) / 7, 10);
      return _xPad(woy, 0, 10);
    },
    y: function y(d) {
      return _xPad(d.getFullYear() % 100, 0);
    },
    Y: 'getFullYear',
    z: function z(d) {
      var o = d.getTimezoneOffset();
      var H = _xPad(parseInt(Math.abs(o / 60), 10), 0);
      var M = _xPad(o % 60, 0);
      return (o > 0 ? '-' : '+') + H + M;
    },
    Z: function Z(d) {
      return d.toString().replace(/^.*\(([^)]+)\)$/, '$1');
    },
    '%': function _(d) {
      return '%';
    }
  };

  var _date = typeof timestamp === 'undefined' ? new Date() : timestamp instanceof Date ? new Date(timestamp) : new Date(timestamp * 1000);

  var _aggregates = {
    c: 'locale',
    D: '%m/%d/%y',
    F: '%y-%m-%d',
    h: '%b',
    n: '\n',
    r: 'locale',
    R: '%H:%M',
    t: '\t',
    T: '%H:%M:%S',
    x: 'locale',
    X: 'locale'
  };

  // First replace aggregates (run in a loop because an agg may be made up of other aggs)
  while (fmt.match(/%[cDFhnrRtTxX]/)) {
    fmt = fmt.replace(/%([cDFhnrRtTxX])/g, function (m0, m1) {
      var f = _aggregates[m1];
      return f === 'locale' ? lcTime[m1] : f;
    });
  }

  // Now replace formats - we need a closure so that the date object gets passed through
  var str = fmt.replace(/%([aAbBCdegGHIjklmMpPsSuUVwWyYzZ%])/g, function (m0, m1) {
    var f = _formats[m1];
    if (typeof f === 'string') {
      return _date[f]();
    } else if (typeof f === 'function') {
      return f(_date);
    } else if ((typeof f === 'undefined' ? 'undefined' : _typeof(f)) === 'object' && typeof f[0] === 'string') {
      return _xPad(_date[f[0]](), f[1]);
    } else {
      // Shouldn't reach here
      return m1;
    }
  });

  return str;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../strings/setlocale":30}],26:[function(require,module,exports){
'use strict';

var reSpace = '[ \\t]+';
var reSpaceOpt = '[ \\t]*';
var reMeridian = '(?:([ap])\\.?m\\.?([\\t ]|$))';
var reHour24 = '(2[0-4]|[01]?[0-9])';
var reHour24lz = '([01][0-9]|2[0-4])';
var reHour12 = '(0?[1-9]|1[0-2])';
var reMinute = '([0-5]?[0-9])';
var reMinutelz = '([0-5][0-9])';
var reSecond = '(60|[0-5]?[0-9])';
var reSecondlz = '(60|[0-5][0-9])';
var reFrac = '(?:\\.([0-9]+))';

var reDayfull = 'sunday|monday|tuesday|wednesday|thursday|friday|saturday';
var reDayabbr = 'sun|mon|tue|wed|thu|fri|sat';
var reDaytext = reDayfull + '|' + reDayabbr + '|weekdays?';

var reReltextnumber = 'first|second|third|fourth|fifth|sixth|seventh|eighth?|ninth|tenth|eleventh|twelfth';
var reReltexttext = 'next|last|previous|this';
var reReltextunit = '(?:second|sec|minute|min|hour|day|fortnight|forthnight|month|year)s?|weeks|' + reDaytext;

var reYear = '([0-9]{1,4})';
var reYear2 = '([0-9]{2})';
var reYear4 = '([0-9]{4})';
var reYear4withSign = '([+-]?[0-9]{4})';
var reMonth = '(1[0-2]|0?[0-9])';
var reMonthlz = '(0[0-9]|1[0-2])';
var reDay = '(?:(3[01]|[0-2]?[0-9])(?:st|nd|rd|th)?)';
var reDaylz = '(0[0-9]|[1-2][0-9]|3[01])';

var reMonthFull = 'january|february|march|april|may|june|july|august|september|october|november|december';
var reMonthAbbr = 'jan|feb|mar|apr|may|jun|jul|aug|sept?|oct|nov|dec';
var reMonthroman = 'i[vx]|vi{0,3}|xi{0,2}|i{1,3}';
var reMonthText = '(' + reMonthFull + '|' + reMonthAbbr + '|' + reMonthroman + ')';

var reTzCorrection = '((?:GMT)?([+-])' + reHour24 + ':?' + reMinute + '?)';
var reDayOfYear = '(00[1-9]|0[1-9][0-9]|[12][0-9][0-9]|3[0-5][0-9]|36[0-6])';
var reWeekOfYear = '(0[1-9]|[1-4][0-9]|5[0-3])';

function processMeridian(hour, meridian) {
  meridian = meridian && meridian.toLowerCase();

  switch (meridian) {
    case 'a':
      hour += hour === 12 ? -12 : 0;
      break;
    case 'p':
      hour += hour !== 12 ? 12 : 0;
      break;
  }

  return hour;
}

function processYear(yearStr) {
  var year = +yearStr;

  if (yearStr.length < 4 && year < 100) {
    year += year < 70 ? 2000 : 1900;
  }

  return year;
}

function lookupMonth(monthStr) {
  return {
    jan: 0,
    january: 0,
    i: 0,
    feb: 1,
    february: 1,
    ii: 1,
    mar: 2,
    march: 2,
    iii: 2,
    apr: 3,
    april: 3,
    iv: 3,
    may: 4,
    v: 4,
    jun: 5,
    june: 5,
    vi: 5,
    jul: 6,
    july: 6,
    vii: 6,
    aug: 7,
    august: 7,
    viii: 7,
    sep: 8,
    sept: 8,
    september: 8,
    ix: 8,
    oct: 9,
    october: 9,
    x: 9,
    nov: 10,
    november: 10,
    xi: 10,
    dec: 11,
    december: 11,
    xii: 11
  }[monthStr.toLowerCase()];
}

function lookupWeekday(dayStr) {
  var desiredSundayNumber = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  var dayNumbers = {
    mon: 1,
    monday: 1,
    tue: 2,
    tuesday: 2,
    wed: 3,
    wednesday: 3,
    thu: 4,
    thursday: 4,
    fri: 5,
    friday: 5,
    sat: 6,
    saturday: 6,
    sun: 0,
    sunday: 0
  };

  return dayNumbers[dayStr.toLowerCase()] || desiredSundayNumber;
}

function lookupRelative(relText) {
  var relativeNumbers = {
    last: -1,
    previous: -1,
    this: 0,
    first: 1,
    next: 1,
    second: 2,
    third: 3,
    fourth: 4,
    fifth: 5,
    sixth: 6,
    seventh: 7,
    eight: 8,
    eighth: 8,
    ninth: 9,
    tenth: 10,
    eleventh: 11,
    twelfth: 12
  };

  var relativeBehavior = {
    this: 1
  };

  var relTextLower = relText.toLowerCase();

  return {
    amount: relativeNumbers[relTextLower],
    behavior: relativeBehavior[relTextLower] || 0
  };
}

function processTzCorrection(tzOffset, oldValue) {
  var reTzCorrectionLoose = /(?:GMT)?([+-])(\d+)(:?)(\d{0,2})/i;
  tzOffset = tzOffset && tzOffset.match(reTzCorrectionLoose);

  if (!tzOffset) {
    return oldValue;
  }

  var sign = tzOffset[1] === '-' ? 1 : -1;
  var hours = +tzOffset[2];
  var minutes = +tzOffset[4];

  if (!tzOffset[4] && !tzOffset[3]) {
    minutes = Math.floor(hours % 100);
    hours = Math.floor(hours / 100);
  }

  return sign * (hours * 60 + minutes);
}

var formats = {
  yesterday: {
    regex: /^yesterday/i,
    name: 'yesterday',
    callback: function callback() {
      this.rd -= 1;
      return this.resetTime();
    }
  },

  now: {
    regex: /^now/i,
    name: 'now'
    // do nothing
  },

  noon: {
    regex: /^noon/i,
    name: 'noon',
    callback: function callback() {
      return this.resetTime() && this.time(12, 0, 0, 0);
    }
  },

  midnightOrToday: {
    regex: /^(midnight|today)/i,
    name: 'midnight | today',
    callback: function callback() {
      return this.resetTime();
    }
  },

  tomorrow: {
    regex: /^tomorrow/i,
    name: 'tomorrow',
    callback: function callback() {
      this.rd += 1;
      return this.resetTime();
    }
  },

  timestamp: {
    regex: /^@(-?\d+)/i,
    name: 'timestamp',
    callback: function callback(match, timestamp) {
      this.rs += +timestamp;
      this.y = 1970;
      this.m = 0;
      this.d = 1;
      this.dates = 0;

      return this.resetTime() && this.zone(0);
    }
  },

  firstOrLastDay: {
    regex: /^(first|last) day of/i,
    name: 'firstdayof | lastdayof',
    callback: function callback(match, day) {
      if (day.toLowerCase() === 'first') {
        this.firstOrLastDayOfMonth = 1;
      } else {
        this.firstOrLastDayOfMonth = -1;
      }
    }
  },

  backOrFrontOf: {
    regex: RegExp('^(back|front) of ' + reHour24 + reSpaceOpt + reMeridian + '?', 'i'),
    name: 'backof | frontof',
    callback: function callback(match, side, hours, meridian) {
      var back = side.toLowerCase() === 'back';
      var hour = +hours;
      var minute = 15;

      if (!back) {
        hour -= 1;
        minute = 45;
      }

      hour = processMeridian(hour, meridian);

      return this.resetTime() && this.time(hour, minute, 0, 0);
    }
  },

  weekdayOf: {
    regex: RegExp('^(' + reReltextnumber + '|' + reReltexttext + ')' + reSpace + '(' + reDayfull + '|' + reDayabbr + ')' + reSpace + 'of', 'i'),
    name: 'weekdayof'
    // todo
  },

  mssqltime: {
    regex: RegExp('^' + reHour12 + ':' + reMinutelz + ':' + reSecondlz + '[:.]([0-9]+)' + reMeridian, 'i'),
    name: 'mssqltime',
    callback: function callback(match, hour, minute, second, frac, meridian) {
      return this.time(processMeridian(+hour, meridian), +minute, +second, +frac.substr(0, 3));
    }
  },

  timeLong12: {
    regex: RegExp('^' + reHour12 + '[:.]' + reMinute + '[:.]' + reSecondlz + reSpaceOpt + reMeridian, 'i'),
    name: 'timelong12',
    callback: function callback(match, hour, minute, second, meridian) {
      return this.time(processMeridian(+hour, meridian), +minute, +second, 0);
    }
  },

  timeShort12: {
    regex: RegExp('^' + reHour12 + '[:.]' + reMinutelz + reSpaceOpt + reMeridian, 'i'),
    name: 'timeshort12',
    callback: function callback(match, hour, minute, meridian) {
      return this.time(processMeridian(+hour, meridian), +minute, 0, 0);
    }
  },

  timeTiny12: {
    regex: RegExp('^' + reHour12 + reSpaceOpt + reMeridian, 'i'),
    name: 'timetiny12',
    callback: function callback(match, hour, meridian) {
      return this.time(processMeridian(+hour, meridian), 0, 0, 0);
    }
  },

  soap: {
    regex: RegExp('^' + reYear4 + '-' + reMonthlz + '-' + reDaylz + 'T' + reHour24lz + ':' + reMinutelz + ':' + reSecondlz + reFrac + reTzCorrection + '?', 'i'),
    name: 'soap',
    callback: function callback(match, year, month, day, hour, minute, second, frac, tzCorrection) {
      return this.ymd(+year, month - 1, +day) && this.time(+hour, +minute, +second, +frac.substr(0, 3)) && this.zone(processTzCorrection(tzCorrection));
    }
  },

  wddx: {
    regex: RegExp('^' + reYear4 + '-' + reMonth + '-' + reDay + 'T' + reHour24 + ':' + reMinute + ':' + reSecond),
    name: 'wddx',
    callback: function callback(match, year, month, day, hour, minute, second) {
      return this.ymd(+year, month - 1, +day) && this.time(+hour, +minute, +second, 0);
    }
  },

  exif: {
    regex: RegExp('^' + reYear4 + ':' + reMonthlz + ':' + reDaylz + ' ' + reHour24lz + ':' + reMinutelz + ':' + reSecondlz, 'i'),
    name: 'exif',
    callback: function callback(match, year, month, day, hour, minute, second) {
      return this.ymd(+year, month - 1, +day) && this.time(+hour, +minute, +second, 0);
    }
  },

  xmlRpc: {
    regex: RegExp('^' + reYear4 + reMonthlz + reDaylz + 'T' + reHour24 + ':' + reMinutelz + ':' + reSecondlz),
    name: 'xmlrpc',
    callback: function callback(match, year, month, day, hour, minute, second) {
      return this.ymd(+year, month - 1, +day) && this.time(+hour, +minute, +second, 0);
    }
  },

  xmlRpcNoColon: {
    regex: RegExp('^' + reYear4 + reMonthlz + reDaylz + '[Tt]' + reHour24 + reMinutelz + reSecondlz),
    name: 'xmlrpcnocolon',
    callback: function callback(match, year, month, day, hour, minute, second) {
      return this.ymd(+year, month - 1, +day) && this.time(+hour, +minute, +second, 0);
    }
  },

  clf: {
    regex: RegExp('^' + reDay + '/(' + reMonthAbbr + ')/' + reYear4 + ':' + reHour24lz + ':' + reMinutelz + ':' + reSecondlz + reSpace + reTzCorrection, 'i'),
    name: 'clf',
    callback: function callback(match, day, month, year, hour, minute, second, tzCorrection) {
      return this.ymd(+year, lookupMonth(month), +day) && this.time(+hour, +minute, +second, 0) && this.zone(processTzCorrection(tzCorrection));
    }
  },

  iso8601long: {
    regex: RegExp('^t?' + reHour24 + '[:.]' + reMinute + '[:.]' + reSecond + reFrac, 'i'),
    name: 'iso8601long',
    callback: function callback(match, hour, minute, second, frac) {
      return this.time(+hour, +minute, +second, +frac.substr(0, 3));
    }
  },

  dateTextual: {
    regex: RegExp('^' + reMonthText + '[ .\\t-]*' + reDay + '[,.stndrh\\t ]+' + reYear, 'i'),
    name: 'datetextual',
    callback: function callback(match, month, day, year) {
      return this.ymd(processYear(year), lookupMonth(month), +day);
    }
  },

  pointedDate4: {
    regex: RegExp('^' + reDay + '[.\\t-]' + reMonth + '[.-]' + reYear4),
    name: 'pointeddate4',
    callback: function callback(match, day, month, year) {
      return this.ymd(+year, month - 1, +day);
    }
  },

  pointedDate2: {
    regex: RegExp('^' + reDay + '[.\\t]' + reMonth + '\\.' + reYear2),
    name: 'pointeddate2',
    callback: function callback(match, day, month, year) {
      return this.ymd(processYear(year), month - 1, +day);
    }
  },

  timeLong24: {
    regex: RegExp('^t?' + reHour24 + '[:.]' + reMinute + '[:.]' + reSecond),
    name: 'timelong24',
    callback: function callback(match, hour, minute, second) {
      return this.time(+hour, +minute, +second, 0);
    }
  },

  dateNoColon: {
    regex: RegExp('^' + reYear4 + reMonthlz + reDaylz),
    name: 'datenocolon',
    callback: function callback(match, year, month, day) {
      return this.ymd(+year, month - 1, +day);
    }
  },

  pgydotd: {
    regex: RegExp('^' + reYear4 + '\\.?' + reDayOfYear),
    name: 'pgydotd',
    callback: function callback(match, year, day) {
      return this.ymd(+year, 0, +day);
    }
  },

  timeShort24: {
    regex: RegExp('^t?' + reHour24 + '[:.]' + reMinute, 'i'),
    name: 'timeshort24',
    callback: function callback(match, hour, minute) {
      return this.time(+hour, +minute, 0, 0);
    }
  },

  iso8601noColon: {
    regex: RegExp('^t?' + reHour24lz + reMinutelz + reSecondlz, 'i'),
    name: 'iso8601nocolon',
    callback: function callback(match, hour, minute, second) {
      return this.time(+hour, +minute, +second, 0);
    }
  },

  iso8601dateSlash: {
    // eventhough the trailing slash is optional in PHP
    // here it's mandatory and inputs without the slash
    // are handled by dateslash
    regex: RegExp('^' + reYear4 + '/' + reMonthlz + '/' + reDaylz + '/'),
    name: 'iso8601dateslash',
    callback: function callback(match, year, month, day) {
      return this.ymd(+year, month - 1, +day);
    }
  },

  dateSlash: {
    regex: RegExp('^' + reYear4 + '/' + reMonth + '/' + reDay),
    name: 'dateslash',
    callback: function callback(match, year, month, day) {
      return this.ymd(+year, month - 1, +day);
    }
  },

  american: {
    regex: RegExp('^' + reMonth + '/' + reDay + '/' + reYear),
    name: 'american',
    callback: function callback(match, month, day, year) {
      return this.ymd(processYear(year), month - 1, +day);
    }
  },

  americanShort: {
    regex: RegExp('^' + reMonth + '/' + reDay),
    name: 'americanshort',
    callback: function callback(match, month, day) {
      return this.ymd(this.y, month - 1, +day);
    }
  },

  gnuDateShortOrIso8601date2: {
    // iso8601date2 is complete subset of gnudateshort
    regex: RegExp('^' + reYear + '-' + reMonth + '-' + reDay),
    name: 'gnudateshort | iso8601date2',
    callback: function callback(match, year, month, day) {
      return this.ymd(processYear(year), month - 1, +day);
    }
  },

  iso8601date4: {
    regex: RegExp('^' + reYear4withSign + '-' + reMonthlz + '-' + reDaylz),
    name: 'iso8601date4',
    callback: function callback(match, year, month, day) {
      return this.ymd(+year, month - 1, +day);
    }
  },

  gnuNoColon: {
    regex: RegExp('^t' + reHour24lz + reMinutelz, 'i'),
    name: 'gnunocolon',
    callback: function callback(match, hour, minute) {
      return this.time(+hour, +minute, 0, this.f);
    }
  },

  gnuDateShorter: {
    regex: RegExp('^' + reYear4 + '-' + reMonth),
    name: 'gnudateshorter',
    callback: function callback(match, year, month) {
      return this.ymd(+year, month - 1, 1);
    }
  },

  pgTextReverse: {
    // note: allowed years are from 32-9999
    // years below 32 should be treated as days in datefull
    regex: RegExp('^' + '(\\d{3,4}|[4-9]\\d|3[2-9])-(' + reMonthAbbr + ')-' + reDaylz, 'i'),
    name: 'pgtextreverse',
    callback: function callback(match, year, month, day) {
      return this.ymd(processYear(year), lookupMonth(month), +day);
    }
  },

  dateFull: {
    regex: RegExp('^' + reDay + '[ \\t.-]*' + reMonthText + '[ \\t.-]*' + reYear, 'i'),
    name: 'datefull',
    callback: function callback(match, day, month, year) {
      return this.ymd(processYear(year), lookupMonth(month), +day);
    }
  },

  dateNoDay: {
    regex: RegExp('^' + reMonthText + '[ .\\t-]*' + reYear4, 'i'),
    name: 'datenoday',
    callback: function callback(match, month, year) {
      return this.ymd(+year, lookupMonth(month), 1);
    }
  },

  dateNoDayRev: {
    regex: RegExp('^' + reYear4 + '[ .\\t-]*' + reMonthText, 'i'),
    name: 'datenodayrev',
    callback: function callback(match, year, month) {
      return this.ymd(+year, lookupMonth(month), 1);
    }
  },

  pgTextShort: {
    regex: RegExp('^(' + reMonthAbbr + ')-' + reDaylz + '-' + reYear, 'i'),
    name: 'pgtextshort',
    callback: function callback(match, month, day, year) {
      return this.ymd(processYear(year), lookupMonth(month), +day);
    }
  },

  dateNoYear: {
    regex: RegExp('^' + reMonthText + '[ .\\t-]*' + reDay + '[,.stndrh\\t ]*', 'i'),
    name: 'datenoyear',
    callback: function callback(match, month, day) {
      return this.ymd(this.y, lookupMonth(month), +day);
    }
  },

  dateNoYearRev: {
    regex: RegExp('^' + reDay + '[ .\\t-]*' + reMonthText, 'i'),
    name: 'datenoyearrev',
    callback: function callback(match, day, month) {
      return this.ymd(this.y, lookupMonth(month), +day);
    }
  },

  isoWeekDay: {
    regex: RegExp('^' + reYear4 + '-?W' + reWeekOfYear + '(?:-?([0-7]))?'),
    name: 'isoweekday | isoweek',
    callback: function callback(match, year, week, day) {
      day = day ? +day : 1;

      if (!this.ymd(+year, 0, 1)) {
        return false;
      }

      // get day of week for Jan 1st
      var dayOfWeek = new Date(this.y, this.m, this.d).getDay();

      // and use the day to figure out the offset for day 1 of week 1
      dayOfWeek = 0 - (dayOfWeek > 4 ? dayOfWeek - 7 : dayOfWeek);

      this.rd += dayOfWeek + (week - 1) * 7 + day;
    }
  },

  relativeText: {
    regex: RegExp('^(' + reReltextnumber + '|' + reReltexttext + ')' + reSpace + '(' + reReltextunit + ')', 'i'),
    name: 'relativetext',
    callback: function callback(match, relValue, relUnit) {
      // todo: implement handling of 'this time-unit'
      // eslint-disable-next-line no-unused-vars
      var _lookupRelative = lookupRelative(relValue),
          amount = _lookupRelative.amount,
          behavior = _lookupRelative.behavior;

      switch (relUnit.toLowerCase()) {
        case 'sec':
        case 'secs':
        case 'second':
        case 'seconds':
          this.rs += amount;
          break;
        case 'min':
        case 'mins':
        case 'minute':
        case 'minutes':
          this.ri += amount;
          break;
        case 'hour':
        case 'hours':
          this.rh += amount;
          break;
        case 'day':
        case 'days':
          this.rd += amount;
          break;
        case 'fortnight':
        case 'fortnights':
        case 'forthnight':
        case 'forthnights':
          this.rd += amount * 14;
          break;
        case 'week':
        case 'weeks':
          this.rd += amount * 7;
          break;
        case 'month':
        case 'months':
          this.rm += amount;
          break;
        case 'year':
        case 'years':
          this.ry += amount;
          break;
        case 'mon':case 'monday':
        case 'tue':case 'tuesday':
        case 'wed':case 'wednesday':
        case 'thu':case 'thursday':
        case 'fri':case 'friday':
        case 'sat':case 'saturday':
        case 'sun':case 'sunday':
          this.resetTime();
          this.weekday = lookupWeekday(relUnit, 7);
          this.weekdayBehavior = 1;
          this.rd += (amount > 0 ? amount - 1 : amount) * 7;
          break;
        case 'weekday':
        case 'weekdays':
          // todo
          break;
      }
    }
  },

  relative: {
    regex: RegExp('^([+-]*)[ \\t]*(\\d+)' + reSpaceOpt + '(' + reReltextunit + '|week)', 'i'),
    name: 'relative',
    callback: function callback(match, signs, relValue, relUnit) {
      var minuses = signs.replace(/[^-]/g, '').length;

      var amount = +relValue * Math.pow(-1, minuses);

      switch (relUnit.toLowerCase()) {
        case 'sec':
        case 'secs':
        case 'second':
        case 'seconds':
          this.rs += amount;
          break;
        case 'min':
        case 'mins':
        case 'minute':
        case 'minutes':
          this.ri += amount;
          break;
        case 'hour':
        case 'hours':
          this.rh += amount;
          break;
        case 'day':
        case 'days':
          this.rd += amount;
          break;
        case 'fortnight':
        case 'fortnights':
        case 'forthnight':
        case 'forthnights':
          this.rd += amount * 14;
          break;
        case 'week':
        case 'weeks':
          this.rd += amount * 7;
          break;
        case 'month':
        case 'months':
          this.rm += amount;
          break;
        case 'year':
        case 'years':
          this.ry += amount;
          break;
        case 'mon':case 'monday':
        case 'tue':case 'tuesday':
        case 'wed':case 'wednesday':
        case 'thu':case 'thursday':
        case 'fri':case 'friday':
        case 'sat':case 'saturday':
        case 'sun':case 'sunday':
          this.resetTime();
          this.weekday = lookupWeekday(relUnit, 7);
          this.weekdayBehavior = 1;
          this.rd += (amount > 0 ? amount - 1 : amount) * 7;
          break;
        case 'weekday':
        case 'weekdays':
          // todo
          break;
      }
    }
  },

  dayText: {
    regex: RegExp('^(' + reDaytext + ')', 'i'),
    name: 'daytext',
    callback: function callback(match, dayText) {
      this.resetTime();
      this.weekday = lookupWeekday(dayText, 0);

      if (this.weekdayBehavior !== 2) {
        this.weekdayBehavior = 1;
      }
    }
  },

  relativeTextWeek: {
    regex: RegExp('^(' + reReltexttext + ')' + reSpace + 'week', 'i'),
    name: 'relativetextweek',
    callback: function callback(match, relText) {
      this.weekdayBehavior = 2;

      switch (relText.toLowerCase()) {
        case 'this':
          this.rd += 0;
          break;
        case 'next':
          this.rd += 7;
          break;
        case 'last':
        case 'previous':
          this.rd -= 7;
          break;
      }

      if (isNaN(this.weekday)) {
        this.weekday = 1;
      }
    }
  },

  monthFullOrMonthAbbr: {
    regex: RegExp('^(' + reMonthFull + '|' + reMonthAbbr + ')', 'i'),
    name: 'monthfull | monthabbr',
    callback: function callback(match, month) {
      return this.ymd(this.y, lookupMonth(month), this.d);
    }
  },

  tzCorrection: {
    regex: RegExp('^' + reTzCorrection, 'i'),
    name: 'tzcorrection',
    callback: function callback(tzCorrection) {
      return this.zone(processTzCorrection(tzCorrection));
    }
  },

  ago: {
    regex: /^ago/i,
    name: 'ago',
    callback: function callback() {
      this.ry = -this.ry;
      this.rm = -this.rm;
      this.rd = -this.rd;
      this.rh = -this.rh;
      this.ri = -this.ri;
      this.rs = -this.rs;
      this.rf = -this.rf;
    }
  },

  gnuNoColon2: {
    // second instance of gnunocolon, without leading 't'
    // it's down here, because it is very generic (4 digits in a row)
    // thus conflicts with many rules above
    // only year4 should come afterwards
    regex: RegExp('^' + reHour24lz + reMinutelz, 'i'),
    name: 'gnunocolon',
    callback: function callback(match, hour, minute) {
      return this.time(+hour, +minute, 0, this.f);
    }
  },

  year4: {
    regex: RegExp('^' + reYear4),
    name: 'year4',
    callback: function callback(match, year) {
      this.y = +year;
      return true;
    }
  },

  whitespace: {
    regex: /^[ .,\t]+/,
    name: 'whitespace'
    // do nothing
  },

  any: {
    regex: /^[\s\S]+/,
    name: 'any',
    callback: function callback() {
      return false;
    }
  }
};

var resultProto = {
  // date
  y: NaN,
  m: NaN,
  d: NaN,
  // time
  h: NaN,
  i: NaN,
  s: NaN,
  f: NaN,

  // relative shifts
  ry: 0,
  rm: 0,
  rd: 0,
  rh: 0,
  ri: 0,
  rs: 0,
  rf: 0,

  // weekday related shifts
  weekday: NaN,
  weekdayBehavior: 0,

  // first or last day of month
  // 0 none, 1 first, -1 last
  firstOrLastDayOfMonth: 0,

  // timezone correction in minutes
  z: NaN,

  // counters
  dates: 0,
  times: 0,
  zones: 0,

  // helper functions
  ymd: function ymd(y, m, d) {
    if (this.dates > 0) {
      return false;
    }

    this.dates++;
    this.y = y;
    this.m = m;
    this.d = d;
    return true;
  },
  time: function time(h, i, s, f) {
    if (this.times > 0) {
      return false;
    }

    this.times++;
    this.h = h;
    this.i = i;
    this.s = s;
    this.f = f;

    return true;
  },
  resetTime: function resetTime() {
    this.h = 0;
    this.i = 0;
    this.s = 0;
    this.f = 0;
    this.times = 0;

    return true;
  },
  zone: function zone(minutes) {
    if (this.zones <= 1) {
      this.zones++;
      this.z = minutes;
      return true;
    }

    return false;
  },
  toDate: function toDate(relativeTo) {
    if (this.dates && !this.times) {
      this.h = this.i = this.s = this.f = 0;
    }

    // fill holes
    if (isNaN(this.y)) {
      this.y = relativeTo.getFullYear();
    }

    if (isNaN(this.m)) {
      this.m = relativeTo.getMonth();
    }

    if (isNaN(this.d)) {
      this.d = relativeTo.getDate();
    }

    if (isNaN(this.h)) {
      this.h = relativeTo.getHours();
    }

    if (isNaN(this.i)) {
      this.i = relativeTo.getMinutes();
    }

    if (isNaN(this.s)) {
      this.s = relativeTo.getSeconds();
    }

    if (isNaN(this.f)) {
      this.f = relativeTo.getMilliseconds();
    }

    // adjust special early
    switch (this.firstOrLastDayOfMonth) {
      case 1:
        this.d = 1;
        break;
      case -1:
        this.d = 0;
        this.m += 1;
        break;
    }

    if (!isNaN(this.weekday)) {
      var date = new Date(relativeTo.getTime());
      date.setFullYear(this.y, this.m, this.d);
      date.setHours(this.h, this.i, this.s, this.f);

      var dow = date.getDay();

      if (this.weekdayBehavior === 2) {
        // To make "this week" work, where the current day of week is a "sunday"
        if (dow === 0 && this.weekday !== 0) {
          this.weekday = -6;
        }

        // To make "sunday this week" work, where the current day of week is not a "sunday"
        if (this.weekday === 0 && dow !== 0) {
          this.weekday = 7;
        }

        this.d -= dow;
        this.d += this.weekday;
      } else {
        var diff = this.weekday - dow;

        // some PHP magic
        if (this.rd < 0 && diff < 0 || this.rd >= 0 && diff <= -this.weekdayBehavior) {
          diff += 7;
        }

        if (this.weekday >= 0) {
          this.d += diff;
        } else {
          this.d -= 7 - (Math.abs(this.weekday) - dow);
        }

        this.weekday = NaN;
      }
    }

    // adjust relative
    this.y += this.ry;
    this.m += this.rm;
    this.d += this.rd;

    this.h += this.rh;
    this.i += this.ri;
    this.s += this.rs;
    this.f += this.rf;

    this.ry = this.rm = this.rd = 0;
    this.rh = this.ri = this.rs = this.rf = 0;

    var result = new Date(relativeTo.getTime());
    // since Date constructor treats years <= 99 as 1900+
    // it can't be used, thus this weird way
    result.setFullYear(this.y, this.m, this.d);
    result.setHours(this.h, this.i, this.s, this.f);

    // note: this is done twice in PHP
    // early when processing special relatives
    // and late
    // todo: check if the logic can be reduced
    // to just one time action
    switch (this.firstOrLastDayOfMonth) {
      case 1:
        result.setDate(1);
        break;
      case -1:
        result.setMonth(result.getMonth() + 1, 0);
        break;
    }

    // adjust timezone
    if (!isNaN(this.z) && result.getTimezoneOffset() !== this.z) {
      result.setUTCFullYear(result.getFullYear(), result.getMonth(), result.getDate());

      result.setUTCHours(result.getHours(), result.getMinutes() + this.z, result.getSeconds(), result.getMilliseconds());
    }

    return result;
  }
};

module.exports = function strtotime(str, now) {
  //       discuss at: http://locutus.io/php/strtotime/
  //      original by: Caio Ariede (http://caioariede.com)
  //      improved by: Kevin van Zonneveld (http://kvz.io)
  //      improved by: Caio Ariede (http://caioariede.com)
  //      improved by: A. Matías Quezada (http://amatiasq.com)
  //      improved by: preuter
  //      improved by: Brett Zamir (http://brett-zamir.me)
  //      improved by: Mirko Faber
  //         input by: David
  //      bugfixed by: Wagner B. Soares
  //      bugfixed by: Artur Tchernychev
  //      bugfixed by: Stephan Bösch-Plepelits (http://github.com/plepe)
  // reimplemented by: Rafał Kukawski
  //           note 1: Examples all have a fixed timestamp to prevent
  //           note 1: tests to fail because of variable time(zones)
  //        example 1: strtotime('+1 day', 1129633200)
  //        returns 1: 1129719600
  //        example 2: strtotime('+1 week 2 days 4 hours 2 seconds', 1129633200)
  //        returns 2: 1130425202
  //        example 3: strtotime('last month', 1129633200)
  //        returns 3: 1127041200
  //        example 4: strtotime('2009-05-04 08:30:00+00')
  //        returns 4: 1241425800
  //        example 5: strtotime('2009-05-04 08:30:00+02:00')
  //        returns 5: 1241418600
  if (now == null) {
    now = Math.floor(Date.now() / 1000);
  }

  // the rule order is very fragile
  // as many formats are similar to others
  // so small change can cause
  // input misinterpretation
  var rules = [formats.yesterday, formats.now, formats.noon, formats.midnightOrToday, formats.tomorrow, formats.timestamp, formats.firstOrLastDay, formats.backOrFrontOf,
  // formats.weekdayOf, // not yet implemented
  formats.mssqltime, formats.timeLong12, formats.timeShort12, formats.timeTiny12, formats.soap, formats.wddx, formats.exif, formats.xmlRpc, formats.xmlRpcNoColon, formats.clf, formats.iso8601long, formats.dateTextual, formats.pointedDate4, formats.pointedDate2, formats.timeLong24, formats.dateNoColon, formats.pgydotd, formats.timeShort24, formats.iso8601noColon,
  // iso8601dateSlash needs to come before dateSlash
  formats.iso8601dateSlash, formats.dateSlash, formats.american, formats.americanShort, formats.gnuDateShortOrIso8601date2, formats.iso8601date4, formats.gnuNoColon, formats.gnuDateShorter, formats.pgTextReverse, formats.dateFull, formats.dateNoDay, formats.dateNoDayRev, formats.pgTextShort, formats.dateNoYear, formats.dateNoYearRev, formats.isoWeekDay, formats.relativeText, formats.relative, formats.dayText, formats.relativeTextWeek, formats.monthFullOrMonthAbbr, formats.tzCorrection, formats.ago, formats.gnuNoColon2, formats.year4,
  // note: the two rules below
  // should always come last
  formats.whitespace, formats.any];

  var result = Object.create(resultProto);

  while (str.length) {
    for (var i = 0, l = rules.length; i < l; i++) {
      var format = rules[i];

      var match = str.match(format.regex);

      if (match) {
        // care only about false results. Ignore other values
        if (format.callback && format.callback.apply(result, match) === false) {
          return false;
        }

        str = str.substr(match[0].length);
        break;
      }
    }
  }

  return Math.floor(result.toDate(new Date(now * 1000)) / 1000);
};

},{}],27:[function(require,module,exports){
(function (process){
'use strict';

module.exports = function getenv(varname) {
  //  discuss at: http://locutus.io/php/getenv/
  // original by: Brett Zamir (http://brett-zamir.me)
  //   example 1: getenv('LC_ALL')
  //   returns 1: false

  if (typeof process !== 'undefined' || !process.env || !process.env[varname]) {
    return false;
  }

  return process.env[varname];
};

}).call(this,require('_process'))
},{"_process":36}],28:[function(require,module,exports){
'use strict';

module.exports = function htmlspecialchars(string, quoteStyle, charset, doubleEncode) {
  //       discuss at: http://locutus.io/php/htmlspecialchars/
  //      original by: Mirek Slugen
  //      improved by: Kevin van Zonneveld (http://kvz.io)
  //      bugfixed by: Nathan
  //      bugfixed by: Arno
  //      bugfixed by: Brett Zamir (http://brett-zamir.me)
  //      bugfixed by: Brett Zamir (http://brett-zamir.me)
  //       revised by: Kevin van Zonneveld (http://kvz.io)
  //         input by: Ratheous
  //         input by: Mailfaker (http://www.weedem.fr/)
  //         input by: felix
  // reimplemented by: Brett Zamir (http://brett-zamir.me)
  //           note 1: charset argument not supported
  //        example 1: htmlspecialchars("<a href='test'>Test</a>", 'ENT_QUOTES')
  //        returns 1: '&lt;a href=&#039;test&#039;&gt;Test&lt;/a&gt;'
  //        example 2: htmlspecialchars("ab\"c'd", ['ENT_NOQUOTES', 'ENT_QUOTES'])
  //        returns 2: 'ab"c&#039;d'
  //        example 3: htmlspecialchars('my "&entity;" is still here', null, null, false)
  //        returns 3: 'my &quot;&entity;&quot; is still here'

  var optTemp = 0;
  var i = 0;
  var noquotes = false;
  if (typeof quoteStyle === 'undefined' || quoteStyle === null) {
    quoteStyle = 2;
  }
  string = string || '';
  string = string.toString();

  if (doubleEncode !== false) {
    // Put this first to avoid double-encoding
    string = string.replace(/&/g, '&amp;');
  }

  string = string.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  var OPTS = {
    'ENT_NOQUOTES': 0,
    'ENT_HTML_QUOTE_SINGLE': 1,
    'ENT_HTML_QUOTE_DOUBLE': 2,
    'ENT_COMPAT': 2,
    'ENT_QUOTES': 3,
    'ENT_IGNORE': 4
  };
  if (quoteStyle === 0) {
    noquotes = true;
  }
  if (typeof quoteStyle !== 'number') {
    // Allow for a single string or an array of string flags
    quoteStyle = [].concat(quoteStyle);
    for (i = 0; i < quoteStyle.length; i++) {
      // Resolve string input to bitwise e.g. 'ENT_IGNORE' becomes 4
      if (OPTS[quoteStyle[i]] === 0) {
        noquotes = true;
      } else if (OPTS[quoteStyle[i]]) {
        optTemp = optTemp | OPTS[quoteStyle[i]];
      }
    }
    quoteStyle = optTemp;
  }
  if (quoteStyle & OPTS.ENT_HTML_QUOTE_SINGLE) {
    string = string.replace(/'/g, '&#039;');
  }
  if (!noquotes) {
    string = string.replace(/"/g, '&quot;');
  }

  return string;
};

},{}],29:[function(require,module,exports){
'use strict';

module.exports = function number_format(number, decimals, decPoint, thousandsSep) {
  // eslint-disable-line camelcase
  //  discuss at: http://locutus.io/php/number_format/
  // original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
  // improved by: Kevin van Zonneveld (http://kvz.io)
  // improved by: davook
  // improved by: Brett Zamir (http://brett-zamir.me)
  // improved by: Brett Zamir (http://brett-zamir.me)
  // improved by: Theriault (https://github.com/Theriault)
  // improved by: Kevin van Zonneveld (http://kvz.io)
  // bugfixed by: Michael White (http://getsprink.com)
  // bugfixed by: Benjamin Lupton
  // bugfixed by: Allan Jensen (http://www.winternet.no)
  // bugfixed by: Howard Yeend
  // bugfixed by: Diogo Resende
  // bugfixed by: Rival
  // bugfixed by: Brett Zamir (http://brett-zamir.me)
  //  revised by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
  //  revised by: Luke Smith (http://lucassmith.name)
  //    input by: Kheang Hok Chin (http://www.distantia.ca/)
  //    input by: Jay Klehr
  //    input by: Amir Habibi (http://www.residence-mixte.com/)
  //    input by: Amirouche
  //   example 1: number_format(1234.56)
  //   returns 1: '1,235'
  //   example 2: number_format(1234.56, 2, ',', ' ')
  //   returns 2: '1 234,56'
  //   example 3: number_format(1234.5678, 2, '.', '')
  //   returns 3: '1234.57'
  //   example 4: number_format(67, 2, ',', '.')
  //   returns 4: '67,00'
  //   example 5: number_format(1000)
  //   returns 5: '1,000'
  //   example 6: number_format(67.311, 2)
  //   returns 6: '67.31'
  //   example 7: number_format(1000.55, 1)
  //   returns 7: '1,000.6'
  //   example 8: number_format(67000, 5, ',', '.')
  //   returns 8: '67.000,00000'
  //   example 9: number_format(0.9, 0)
  //   returns 9: '1'
  //  example 10: number_format('1.20', 2)
  //  returns 10: '1.20'
  //  example 11: number_format('1.20', 4)
  //  returns 11: '1.2000'
  //  example 12: number_format('1.2000', 3)
  //  returns 12: '1.200'
  //  example 13: number_format('1 000,50', 2, '.', ' ')
  //  returns 13: '100 050.00'
  //  example 14: number_format(1e-8, 8, '.', '')
  //  returns 14: '0.00000001'

  number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
  var n = !isFinite(+number) ? 0 : +number;
  var prec = !isFinite(+decimals) ? 0 : Math.abs(decimals);
  var sep = typeof thousandsSep === 'undefined' ? ',' : thousandsSep;
  var dec = typeof decPoint === 'undefined' ? '.' : decPoint;
  var s = '';

  var toFixedFix = function toFixedFix(n, prec) {
    if (('' + n).indexOf('e') === -1) {
      return +(Math.round(n + 'e+' + prec) + 'e-' + prec);
    } else {
      var arr = ('' + n).split('e');
      var sig = '';
      if (+arr[1] + prec > 0) {
        sig = '+';
      }
      return (+(Math.round(+arr[0] + 'e' + sig + (+arr[1] + prec)) + 'e-' + prec)).toFixed(prec);
    }
  };

  // @todo: for IE parseFloat(0.55).toFixed(0) = 0;
  s = (prec ? toFixedFix(n, prec).toString() : '' + Math.round(n)).split('.');
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
  }
  if ((s[1] || '').length < prec) {
    s[1] = s[1] || '';
    s[1] += new Array(prec - s[1].length + 1).join('0');
  }

  return s.join(dec);
};

},{}],30:[function(require,module,exports){
(function (global){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

module.exports = function setlocale(category, locale) {
  //  discuss at: http://locutus.io/php/setlocale/
  // original by: Brett Zamir (http://brett-zamir.me)
  // original by: Blues (http://hacks.bluesmoon.info/strftime/strftime.js)
  // original by: YUI Library (http://developer.yahoo.com/yui/docs/YAHOO.util.DateLocale.html)
  //      note 1: Is extensible, but currently only implements locales en,
  //      note 1: en_US, en_GB, en_AU, fr, and fr_CA for LC_TIME only; C for LC_CTYPE;
  //      note 1: C and en for LC_MONETARY/LC_NUMERIC; en for LC_COLLATE
  //      note 1: Uses global: locutus to store locale info
  //      note 1: Consider using http://demo.icu-project.org/icu-bin/locexp as basis for localization (as in i18n_loc_set_default())
  //      note 2: This function tries to establish the locale via the `window` global.
  //      note 2: This feature will not work in Node and hence is Browser-only
  //   example 1: setlocale('LC_ALL', 'en_US')
  //   returns 1: 'en_US'

  var getenv = require('../info/getenv');

  var categ = '';
  var cats = [];
  var i = 0;

  var _copy = function _copy(orig) {
    if (orig instanceof RegExp) {
      return new RegExp(orig);
    } else if (orig instanceof Date) {
      return new Date(orig);
    }
    var newObj = {};
    for (var i in orig) {
      if (_typeof(orig[i]) === 'object') {
        newObj[i] = _copy(orig[i]);
      } else {
        newObj[i] = orig[i];
      }
    }
    return newObj;
  };

  // Function usable by a ngettext implementation (apparently not an accessible part of setlocale(),
  // but locale-specific) See http://www.gnu.org/software/gettext/manual/gettext.html#Plural-forms
  // though amended with others from https://developer.mozilla.org/En/Localization_and_Plurals (new
  // categories noted with "MDC" below, though not sure of whether there is a convention for the
  // relative order of these newer groups as far as ngettext) The function name indicates the number
  // of plural forms (nplural) Need to look into http://cldr.unicode.org/ (maybe future JavaScript);
  // Dojo has some functions (under new BSD), including JSON conversions of LDML XML from CLDR:
  // http://bugs.dojotoolkit.org/browser/dojo/trunk/cldr and docs at
  // http://api.dojotoolkit.org/jsdoc/HEAD/dojo.cldr

  // var _nplurals1 = function (n) {
  //   // e.g., Japanese
  //   return 0
  // }
  var _nplurals2a = function _nplurals2a(n) {
    // e.g., English
    return n !== 1 ? 1 : 0;
  };
  var _nplurals2b = function _nplurals2b(n) {
    // e.g., French
    return n > 1 ? 1 : 0;
  };

  var $global = typeof window !== 'undefined' ? window : global;
  $global.$locutus = $global.$locutus || {};
  var $locutus = $global.$locutus;
  $locutus.php = $locutus.php || {};

  // Reconcile Windows vs. *nix locale names?
  // Allow different priority orders of languages, esp. if implement gettext as in
  // LANGUAGE env. var.? (e.g., show German if French is not available)
  if (!$locutus.php.locales || !$locutus.php.locales.fr_CA || !$locutus.php.locales.fr_CA.LC_TIME || !$locutus.php.locales.fr_CA.LC_TIME.x) {
    // Can add to the locales
    $locutus.php.locales = {};

    $locutus.php.locales.en = {
      'LC_COLLATE': function LC_COLLATE(str1, str2) {
        // @todo: This one taken from strcmp, but need for other locales; we don't use localeCompare
        // since its locale is not settable
        return str1 === str2 ? 0 : str1 > str2 ? 1 : -1;
      },
      'LC_CTYPE': {
        // Need to change any of these for English as opposed to C?
        an: /^[A-Za-z\d]+$/g,
        al: /^[A-Za-z]+$/g,
        ct: /^[\u0000-\u001F\u007F]+$/g,
        dg: /^[\d]+$/g,
        gr: /^[\u0021-\u007E]+$/g,
        lw: /^[a-z]+$/g,
        pr: /^[\u0020-\u007E]+$/g,
        pu: /^[\u0021-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007E]+$/g,
        sp: /^[\f\n\r\t\v ]+$/g,
        up: /^[A-Z]+$/g,
        xd: /^[A-Fa-f\d]+$/g,
        CODESET: 'UTF-8',
        // Used by sql_regcase
        lower: 'abcdefghijklmnopqrstuvwxyz',
        upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      },
      'LC_TIME': {
        // Comments include nl_langinfo() constant equivalents and any
        // changes from Blues' implementation
        a: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        // ABDAY_
        A: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        // DAY_
        b: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        // ABMON_
        B: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        // MON_
        c: '%a %d %b %Y %r %Z',
        // D_T_FMT // changed %T to %r per results
        p: ['AM', 'PM'],
        // AM_STR/PM_STR
        P: ['am', 'pm'],
        // Not available in nl_langinfo()
        r: '%I:%M:%S %p',
        // T_FMT_AMPM (Fixed for all locales)
        x: '%m/%d/%Y',
        // D_FMT // switched order of %m and %d; changed %y to %Y (C uses %y)
        X: '%r',
        // T_FMT // changed from %T to %r  (%T is default for C, not English US)
        // Following are from nl_langinfo() or http://www.cptec.inpe.br/sx4/sx4man2/g1ab02e/strftime.4.html
        alt_digits: '',
        // e.g., ordinal
        ERA: '',
        ERA_YEAR: '',
        ERA_D_T_FMT: '',
        ERA_D_FMT: '',
        ERA_T_FMT: ''
      },
      // Assuming distinction between numeric and monetary is thus:
      // See below for C locale
      'LC_MONETARY': {
        // based on Windows "english" (English_United States.1252) locale
        int_curr_symbol: 'USD',
        currency_symbol: '$',
        mon_decimal_point: '.',
        mon_thousands_sep: ',',
        mon_grouping: [3],
        // use mon_thousands_sep; "" for no grouping; additional array members
        // indicate successive group lengths after first group
        // (e.g., if to be 1,23,456, could be [3, 2])
        positive_sign: '',
        negative_sign: '-',
        int_frac_digits: 2,
        // Fractional digits only for money defaults?
        frac_digits: 2,
        p_cs_precedes: 1,
        // positive currency symbol follows value = 0; precedes value = 1
        p_sep_by_space: 0,
        // 0: no space between curr. symbol and value; 1: space sep. them unless symb.
        // and sign are adjacent then space sep. them from value; 2: space sep. sign
        // and value unless symb. and sign are adjacent then space separates
        n_cs_precedes: 1,
        // see p_cs_precedes
        n_sep_by_space: 0,
        // see p_sep_by_space
        p_sign_posn: 3,
        // 0: parentheses surround quantity and curr. symbol; 1: sign precedes them;
        // 2: sign follows them; 3: sign immed. precedes curr. symbol; 4: sign immed.
        // succeeds curr. symbol
        n_sign_posn: 0 // see p_sign_posn
      },
      'LC_NUMERIC': {
        // based on Windows "english" (English_United States.1252) locale
        decimal_point: '.',
        thousands_sep: ',',
        grouping: [3] // see mon_grouping, but for non-monetary values (use thousands_sep)
      },
      'LC_MESSAGES': {
        YESEXPR: '^[yY].*',
        NOEXPR: '^[nN].*',
        YESSTR: '',
        NOSTR: ''
      },
      nplurals: _nplurals2a
    };
    $locutus.php.locales.en_US = _copy($locutus.php.locales.en);
    $locutus.php.locales.en_US.LC_TIME.c = '%a %d %b %Y %r %Z';
    $locutus.php.locales.en_US.LC_TIME.x = '%D';
    $locutus.php.locales.en_US.LC_TIME.X = '%r';
    // The following are based on *nix settings
    $locutus.php.locales.en_US.LC_MONETARY.int_curr_symbol = 'USD ';
    $locutus.php.locales.en_US.LC_MONETARY.p_sign_posn = 1;
    $locutus.php.locales.en_US.LC_MONETARY.n_sign_posn = 1;
    $locutus.php.locales.en_US.LC_MONETARY.mon_grouping = [3, 3];
    $locutus.php.locales.en_US.LC_NUMERIC.thousands_sep = '';
    $locutus.php.locales.en_US.LC_NUMERIC.grouping = [];

    $locutus.php.locales.en_GB = _copy($locutus.php.locales.en);
    $locutus.php.locales.en_GB.LC_TIME.r = '%l:%M:%S %P %Z';

    $locutus.php.locales.en_AU = _copy($locutus.php.locales.en_GB);
    // Assume C locale is like English (?) (We need C locale for LC_CTYPE)
    $locutus.php.locales.C = _copy($locutus.php.locales.en);
    $locutus.php.locales.C.LC_CTYPE.CODESET = 'ANSI_X3.4-1968';
    $locutus.php.locales.C.LC_MONETARY = {
      int_curr_symbol: '',
      currency_symbol: '',
      mon_decimal_point: '',
      mon_thousands_sep: '',
      mon_grouping: [],
      p_cs_precedes: 127,
      p_sep_by_space: 127,
      n_cs_precedes: 127,
      n_sep_by_space: 127,
      p_sign_posn: 127,
      n_sign_posn: 127,
      positive_sign: '',
      negative_sign: '',
      int_frac_digits: 127,
      frac_digits: 127
    };
    $locutus.php.locales.C.LC_NUMERIC = {
      decimal_point: '.',
      thousands_sep: '',
      grouping: []
    };
    // D_T_FMT
    $locutus.php.locales.C.LC_TIME.c = '%a %b %e %H:%M:%S %Y';
    // D_FMT
    $locutus.php.locales.C.LC_TIME.x = '%m/%d/%y';
    // T_FMT
    $locutus.php.locales.C.LC_TIME.X = '%H:%M:%S';
    $locutus.php.locales.C.LC_MESSAGES.YESEXPR = '^[yY]';
    $locutus.php.locales.C.LC_MESSAGES.NOEXPR = '^[nN]';

    $locutus.php.locales.fr = _copy($locutus.php.locales.en);
    $locutus.php.locales.fr.nplurals = _nplurals2b;
    $locutus.php.locales.fr.LC_TIME.a = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'];
    $locutus.php.locales.fr.LC_TIME.A = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    $locutus.php.locales.fr.LC_TIME.b = ['jan', 'f\xE9v', 'mar', 'avr', 'mai', 'jun', 'jui', 'ao\xFB', 'sep', 'oct', 'nov', 'd\xE9c'];
    $locutus.php.locales.fr.LC_TIME.B = ['janvier', 'f\xE9vrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'ao\xFBt', 'septembre', 'octobre', 'novembre', 'd\xE9cembre'];
    $locutus.php.locales.fr.LC_TIME.c = '%a %d %b %Y %T %Z';
    $locutus.php.locales.fr.LC_TIME.p = ['', ''];
    $locutus.php.locales.fr.LC_TIME.P = ['', ''];
    $locutus.php.locales.fr.LC_TIME.x = '%d.%m.%Y';
    $locutus.php.locales.fr.LC_TIME.X = '%T';

    $locutus.php.locales.fr_CA = _copy($locutus.php.locales.fr);
    $locutus.php.locales.fr_CA.LC_TIME.x = '%Y-%m-%d';
  }
  if (!$locutus.php.locale) {
    $locutus.php.locale = 'en_US';
    // Try to establish the locale via the `window` global
    if (typeof window !== 'undefined' && window.document) {
      var d = window.document;
      var NS_XHTML = 'http://www.w3.org/1999/xhtml';
      var NS_XML = 'http://www.w3.org/XML/1998/namespace';
      if (d.getElementsByTagNameNS && d.getElementsByTagNameNS(NS_XHTML, 'html')[0]) {
        if (d.getElementsByTagNameNS(NS_XHTML, 'html')[0].getAttributeNS && d.getElementsByTagNameNS(NS_XHTML, 'html')[0].getAttributeNS(NS_XML, 'lang')) {
          $locutus.php.locale = d.getElementsByTagName(NS_XHTML, 'html')[0].getAttributeNS(NS_XML, 'lang');
        } else if (d.getElementsByTagNameNS(NS_XHTML, 'html')[0].lang) {
          // XHTML 1.0 only
          $locutus.php.locale = d.getElementsByTagNameNS(NS_XHTML, 'html')[0].lang;
        }
      } else if (d.getElementsByTagName('html')[0] && d.getElementsByTagName('html')[0].lang) {
        $locutus.php.locale = d.getElementsByTagName('html')[0].lang;
      }
    }
  }
  // PHP-style
  $locutus.php.locale = $locutus.php.locale.replace('-', '_');
  // @todo: locale if declared locale hasn't been defined
  if (!($locutus.php.locale in $locutus.php.locales)) {
    if ($locutus.php.locale.replace(/_[a-zA-Z]+$/, '') in $locutus.php.locales) {
      $locutus.php.locale = $locutus.php.locale.replace(/_[a-zA-Z]+$/, '');
    }
  }

  if (!$locutus.php.localeCategories) {
    $locutus.php.localeCategories = {
      'LC_COLLATE': $locutus.php.locale,
      // for string comparison, see strcoll()
      'LC_CTYPE': $locutus.php.locale,
      // for character classification and conversion, for example strtoupper()
      'LC_MONETARY': $locutus.php.locale,
      // for localeconv()
      'LC_NUMERIC': $locutus.php.locale,
      // for decimal separator (See also localeconv())
      'LC_TIME': $locutus.php.locale,
      // for date and time formatting with strftime()
      // for system responses (available if PHP was compiled with libintl):
      'LC_MESSAGES': $locutus.php.locale
    };
  }

  if (locale === null || locale === '') {
    locale = getenv(category) || getenv('LANG');
  } else if (Object.prototype.toString.call(locale) === '[object Array]') {
    for (i = 0; i < locale.length; i++) {
      if (!(locale[i] in $locutus.php.locales)) {
        if (i === locale.length - 1) {
          // none found
          return false;
        }
        continue;
      }
      locale = locale[i];
      break;
    }
  }

  // Just get the locale
  if (locale === '0' || locale === 0) {
    if (category === 'LC_ALL') {
      for (categ in $locutus.php.localeCategories) {
        // Add ".UTF-8" or allow ".@latint", etc. to the end?
        cats.push(categ + '=' + $locutus.php.localeCategories[categ]);
      }
      return cats.join(';');
    }
    return $locutus.php.localeCategories[category];
  }

  if (!(locale in $locutus.php.locales)) {
    // Locale not found
    return false;
  }

  // Set and get locale
  if (category === 'LC_ALL') {
    for (categ in $locutus.php.localeCategories) {
      $locutus.php.localeCategories[categ] = locale;
    }
  } else {
    $locutus.php.localeCategories[category] = locale;
  }

  return locale;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../info/getenv":27}],31:[function(require,module,exports){
'use strict';

module.exports = function str_pad(input, padLength, padString, padType) {
  // eslint-disable-line camelcase
  //  discuss at: http://locutus.io/php/str_pad/
  // original by: Kevin van Zonneveld (http://kvz.io)
  // improved by: Michael White (http://getsprink.com)
  //    input by: Marco van Oort
  // bugfixed by: Brett Zamir (http://brett-zamir.me)
  //   example 1: str_pad('Kevin van Zonneveld', 30, '-=', 'STR_PAD_LEFT')
  //   returns 1: '-=-=-=-=-=-Kevin van Zonneveld'
  //   example 2: str_pad('Kevin van Zonneveld', 30, '-', 'STR_PAD_BOTH')
  //   returns 2: '------Kevin van Zonneveld-----'

  var half = '';
  var padToGo;

  var _strPadRepeater = function _strPadRepeater(s, len) {
    var collect = '';

    while (collect.length < len) {
      collect += s;
    }
    collect = collect.substr(0, len);

    return collect;
  };

  input += '';
  padString = padString !== undefined ? padString : ' ';

  if (padType !== 'STR_PAD_LEFT' && padType !== 'STR_PAD_RIGHT' && padType !== 'STR_PAD_BOTH') {
    padType = 'STR_PAD_RIGHT';
  }
  if ((padToGo = padLength - input.length) > 0) {
    if (padType === 'STR_PAD_LEFT') {
      input = _strPadRepeater(padString, padToGo) + input;
    } else if (padType === 'STR_PAD_RIGHT') {
      input = input + _strPadRepeater(padString, padToGo);
    } else if (padType === 'STR_PAD_BOTH') {
      half = _strPadRepeater(padString, Math.ceil(padToGo / 2));
      input = half + input + half;
      input = input.substr(0, padLength);
    }
  }

  return input;
};

},{}],32:[function(require,module,exports){
'use strict';

module.exports = function str_repeat(input, multiplier) {
  // eslint-disable-line camelcase
  //  discuss at: http://locutus.io/php/str_repeat/
  // original by: Kevin van Zonneveld (http://kvz.io)
  // improved by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
  // improved by: Ian Carter (http://euona.com/)
  //   example 1: str_repeat('-=', 10)
  //   returns 1: '-=-=-=-=-=-=-=-=-=-='

  var y = '';
  while (true) {
    if (multiplier & 1) {
      y += input;
    }
    multiplier >>= 1;
    if (multiplier) {
      input += input;
    } else {
      break;
    }
  }
  return y;
};

},{}],33:[function(require,module,exports){
'use strict';

module.exports = function strip_tags(input, allowed) {
  // eslint-disable-line camelcase
  //  discuss at: http://locutus.io/php/strip_tags/
  // original by: Kevin van Zonneveld (http://kvz.io)
  // improved by: Luke Godfrey
  // improved by: Kevin van Zonneveld (http://kvz.io)
  //    input by: Pul
  //    input by: Alex
  //    input by: Marc Palau
  //    input by: Brett Zamir (http://brett-zamir.me)
  //    input by: Bobby Drake
  //    input by: Evertjan Garretsen
  // bugfixed by: Kevin van Zonneveld (http://kvz.io)
  // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
  // bugfixed by: Kevin van Zonneveld (http://kvz.io)
  // bugfixed by: Kevin van Zonneveld (http://kvz.io)
  // bugfixed by: Eric Nagel
  // bugfixed by: Kevin van Zonneveld (http://kvz.io)
  // bugfixed by: Tomasz Wesolowski
  // bugfixed by: Tymon Sturgeon (https://scryptonite.com)
  // bugfixed by: Tim de Koning (https://www.kingsquare.nl)
  //  revised by: Rafał Kukawski (http://blog.kukawski.pl)
  //   example 1: strip_tags('<p>Kevin</p> <br /><b>van</b> <i>Zonneveld</i>', '<i><b>')
  //   returns 1: 'Kevin <b>van</b> <i>Zonneveld</i>'
  //   example 2: strip_tags('<p>Kevin <img src="someimage.png" onmouseover="someFunction()">van <i>Zonneveld</i></p>', '<p>')
  //   returns 2: '<p>Kevin van Zonneveld</p>'
  //   example 3: strip_tags("<a href='http://kvz.io'>Kevin van Zonneveld</a>", "<a>")
  //   returns 3: "<a href='http://kvz.io'>Kevin van Zonneveld</a>"
  //   example 4: strip_tags('1 < 5 5 > 1')
  //   returns 4: '1 < 5 5 > 1'
  //   example 5: strip_tags('1 <br/> 1')
  //   returns 5: '1  1'
  //   example 6: strip_tags('1 <br/> 1', '<br>')
  //   returns 6: '1 <br/> 1'
  //   example 7: strip_tags('1 <br/> 1', '<br><br/>')
  //   returns 7: '1 <br/> 1'
  //   example 8: strip_tags('<i>hello</i> <<foo>script>world<</foo>/script>')
  //   returns 8: 'hello world'
  //   example 9: strip_tags(4)
  //   returns 9: '4'

  var _phpCastString = require('../_helpers/_phpCastString');

  // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
  allowed = (((allowed || '') + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');

  var tags = /<\/?([a-z0-9]*)\b[^>]*>?/gi;
  var commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;

  var after = _phpCastString(input);
  // removes tha '<' char at the end of the string to replicate PHP's behaviour
  after = after.substring(after.length - 1) === '<' ? after.substring(0, after.length - 1) : after;

  // recursively remove tags to ensure that the returned string doesn't contain forbidden tags after previous passes (e.g. '<<bait/>switch/>')
  while (true) {
    var before = after;
    after = before.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
      return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
    });

    // return once no more tags are removed
    if (before === after) {
      return after;
    }
  }
};

},{"../_helpers/_phpCastString":23}],34:[function(require,module,exports){
'use strict';

module.exports = function strrev(string) {
  //       discuss at: http://locutus.io/php/strrev/
  //      original by: Kevin van Zonneveld (http://kvz.io)
  //      bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
  // reimplemented by: Brett Zamir (http://brett-zamir.me)
  //        example 1: strrev('Kevin van Zonneveld')
  //        returns 1: 'dlevennoZ nav niveK'
  //        example 2: strrev('a\u0301haB')
  //        returns 2: 'Baha\u0301' // combining
  //        example 3: strrev('A\uD87E\uDC04Z')
  //        returns 3: 'Z\uD87E\uDC04A' // surrogates
  //             test: 'skip-3'

  string = string + '';

  // Performance will be enhanced with the next two lines of code commented
  // out if you don't care about combining characters
  // Keep Unicode combining characters together with the character preceding
  // them and which they are modifying (as in PHP 6)
  // See http://unicode.org/reports/tr44/#Property_Table (Me+Mn)
  // We also add the low surrogate range at the beginning here so it will be
  // maintained with its preceding high surrogate

  var chars = ['\uDC00-\uDFFF', '\u0300-\u036F', '\u0483-\u0489', '\u0591-\u05BD', '\u05BF', '\u05C1', '\u05C2', '\u05C4', '\u05C5', '\u05C7', '\u0610-\u061A', '\u064B-\u065E', '\u0670', '\u06D6-\u06DC', '\u06DE-\u06E4', '\u06E7\u06E8', '\u06EA-\u06ED', '\u0711', '\u0730-\u074A', '\u07A6-\u07B0', '\u07EB-\u07F3', '\u0901-\u0903', '\u093C', '\u093E-\u094D', '\u0951-\u0954', '\u0962', '\u0963', '\u0981-\u0983', '\u09BC', '\u09BE-\u09C4', '\u09C7', '\u09C8', '\u09CB-\u09CD', '\u09D7', '\u09E2', '\u09E3', '\u0A01-\u0A03', '\u0A3C', '\u0A3E-\u0A42', '\u0A47', '\u0A48', '\u0A4B-\u0A4D', '\u0A51', '\u0A70', '\u0A71', '\u0A75', '\u0A81-\u0A83', '\u0ABC', '\u0ABE-\u0AC5', '\u0AC7-\u0AC9', '\u0ACB-\u0ACD', '\u0AE2', '\u0AE3', '\u0B01-\u0B03', '\u0B3C', '\u0B3E-\u0B44', '\u0B47', '\u0B48', '\u0B4B-\u0B4D', '\u0B56', '\u0B57', '\u0B62', '\u0B63', '\u0B82', '\u0BBE-\u0BC2', '\u0BC6-\u0BC8', '\u0BCA-\u0BCD', '\u0BD7', '\u0C01-\u0C03', '\u0C3E-\u0C44', '\u0C46-\u0C48', '\u0C4A-\u0C4D', '\u0C55', '\u0C56', '\u0C62', '\u0C63', '\u0C82', '\u0C83', '\u0CBC', '\u0CBE-\u0CC4', '\u0CC6-\u0CC8', '\u0CCA-\u0CCD', '\u0CD5', '\u0CD6', '\u0CE2', '\u0CE3', '\u0D02', '\u0D03', '\u0D3E-\u0D44', '\u0D46-\u0D48', '\u0D4A-\u0D4D', '\u0D57', '\u0D62', '\u0D63', '\u0D82', '\u0D83', '\u0DCA', '\u0DCF-\u0DD4', '\u0DD6', '\u0DD8-\u0DDF', '\u0DF2', '\u0DF3', '\u0E31', '\u0E34-\u0E3A', '\u0E47-\u0E4E', '\u0EB1', '\u0EB4-\u0EB9', '\u0EBB', '\u0EBC', '\u0EC8-\u0ECD', '\u0F18', '\u0F19', '\u0F35', '\u0F37', '\u0F39', '\u0F3E', '\u0F3F', '\u0F71-\u0F84', '\u0F86', '\u0F87', '\u0F90-\u0F97', '\u0F99-\u0FBC', '\u0FC6', '\u102B-\u103E', '\u1056-\u1059', '\u105E-\u1060', '\u1062-\u1064', '\u1067-\u106D', '\u1071-\u1074', '\u1082-\u108D', '\u108F', '\u135F', '\u1712-\u1714', '\u1732-\u1734', '\u1752', '\u1753', '\u1772', '\u1773', '\u17B6-\u17D3', '\u17DD', '\u180B-\u180D', '\u18A9', '\u1920-\u192B', '\u1930-\u193B', '\u19B0-\u19C0', '\u19C8', '\u19C9', '\u1A17-\u1A1B', '\u1B00-\u1B04', '\u1B34-\u1B44', '\u1B6B-\u1B73', '\u1B80-\u1B82', '\u1BA1-\u1BAA', '\u1C24-\u1C37', '\u1DC0-\u1DE6', '\u1DFE', '\u1DFF', '\u20D0-\u20F0', '\u2DE0-\u2DFF', '\u302A-\u302F', '\u3099', '\u309A', '\uA66F-\uA672', '\uA67C', '\uA67D', '\uA802', '\uA806', '\uA80B', '\uA823-\uA827', '\uA880', '\uA881', '\uA8B4-\uA8C4', '\uA926-\uA92D', '\uA947-\uA953', '\uAA29-\uAA36', '\uAA43', '\uAA4C', '\uAA4D', '\uFB1E', '\uFE00-\uFE0F', '\uFE20-\uFE26'];

  var graphemeExtend = new RegExp('(.)([' + chars.join('') + ']+)', 'g');

  // Temporarily reverse
  string = string.replace(graphemeExtend, '$2$1');
  return string.split('').reverse().join('');
};

},{}],35:[function(require,module,exports){
'use strict';

module.exports = function trim(str, charlist) {
  //  discuss at: http://locutus.io/php/trim/
  // original by: Kevin van Zonneveld (http://kvz.io)
  // improved by: mdsjack (http://www.mdsjack.bo.it)
  // improved by: Alexander Ermolaev (http://snippets.dzone.com/user/AlexanderErmolaev)
  // improved by: Kevin van Zonneveld (http://kvz.io)
  // improved by: Steven Levithan (http://blog.stevenlevithan.com)
  // improved by: Jack
  //    input by: Erkekjetter
  //    input by: DxGx
  // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
  //   example 1: trim('    Kevin van Zonneveld    ')
  //   returns 1: 'Kevin van Zonneveld'
  //   example 2: trim('Hello World', 'Hdle')
  //   returns 2: 'o Wor'
  //   example 3: trim(16, 1)
  //   returns 3: '6'

  var whitespace = [' ', '\n', '\r', '\t', '\f', '\x0b', '\xa0', '\u2000', '\u2001', '\u2002', '\u2003', '\u2004', '\u2005', '\u2006', '\u2007', '\u2008', '\u2009', '\u200A', '\u200B', '\u2028', '\u2029', '\u3000'].join('');
  var l = 0;
  var i = 0;
  str += '';

  if (charlist) {
    whitespace = (charlist + '').replace(/([[\]().?/*{}+$^:])/g, '$1');
  }

  l = str.length;
  for (i = 0; i < l; i++) {
    if (whitespace.indexOf(str.charAt(i)) === -1) {
      str = str.substring(i);
      break;
    }
  }

  l = str.length;
  for (i = l - 1; i >= 0; i--) {
    if (whitespace.indexOf(str.charAt(i)) === -1) {
      str = str.substring(0, i + 1);
      break;
    }
  }

  return whitespace.indexOf(str.charAt(0)) === -1 ? str : '';
};

},{}],36:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],37:[function(require,module,exports){
var htmlspecialchars = require('locutus/php/strings/htmlspecialchars');

Latte.prototype.registerPlugin(
	'modifier',
	'breaklines',
	function (s) {
		if (s == null) {
			return '';
		}

		return htmlspecialchars(s, 0, 'UTF-8').replace(/(\r\n|\n\r|\r|\n)/g, '<br />\n');
	}
);

},{"locutus/php/strings/htmlspecialchars":28}],38:[function(require,module,exports){
var toBytes = require('es5-util/js/toBytes');

Latte.prototype.registerPlugin(
	'modifier',
	'bytes',
	function (s, precision) {
		precision = precision != null ? precision : 2;
		return toBytes(s, precision);
	}
);

},{"es5-util/js/toBytes":18}],39:[function(require,module,exports){
var toUpperCase = require('es5-util/js/toUpperCase');

Latte.prototype.registerPlugin(
	'modifier',
	'capitalize',
	function (s, preserveCase) {
		return toUpperCase(s, 'words', !!preserveCase);
	}
);

},{"es5-util/js/toUpperCase":22}],40:[function(require,module,exports){
var isNotSetLoose = require('es5-util/js/isNotSetLoose');
var toUnixTime = require('es5-util/js/toUnixTime');
var strftime = require('locutus/php/datetime/strftime');

Latte.prototype.registerPlugin(
	'modifier',
	'date',
	function (time, format, defaultDate) {
		if (isNotSetLoose(time) || !time) {
			if (isNotSetLoose(defaultDate)) {
				return '';
			}
			time = defaultDate;
		}

		return strftime(format != null ? format : '%b %e, %Y', toUnixTime(time));
	}
);

},{"es5-util/js/isNotSetLoose":8,"es5-util/js/toUnixTime":21,"locutus/php/datetime/strftime":25}],41:[function(require,module,exports){
var getDefaultTags = require('./../helpers/getDefaultTags');

Latte.getDefaultTags = getDefaultTags;

Latte.setDefaultTags = function (template, obj) {
  return getDefaultTags(obj) + template;
};

},{"./../helpers/getDefaultTags":57}],42:[function(require,module,exports){
var toUpperCase = require('es5-util/js/toUpperCase');

Latte.prototype.registerPlugin(
	'modifier',
	'firstUpper',
	function (s, preserveCase) {
		return toUpperCase(s, 'first', !!preserveCase);
	}
);

},{"es5-util/js/toUpperCase":22}],43:[function(require,module,exports){
var toString = require('es5-util/js/toString');

Latte.prototype.registerPlugin(
	'modifier',
	'implode',
	function (arr, glue, keyGlue) {
		return toString(arr, glue != null ? glue : '', keyGlue);
	}
);

},{"es5-util/js/toString":20}],44:[function(require,module,exports){
var isObjectLike = require('es5-util/js/isObjectLike');
var toAssociativeValues = require('es5-util/js/toAssociativeValues');

Latte.prototype.registerPlugin(
	'modifier',
	'length',
	function (s) {
		if (s == null) {
			return 0;
		}

		return (isObjectLike(s) ? toAssociativeValues(s) : s).length;
	}
);

},{"es5-util/js/isObjectLike":11,"es5-util/js/toAssociativeValues":17}],45:[function(require,module,exports){
var toNumber = require('es5-util/js/toNumber');
var number_format = require('locutus/php/strings/number_format');

Latte.prototype.registerPlugin(
	'modifier',
	'number',
	function (s, decimals, dec_point, thousands_sep) {
		decimals = decimals != null ? decimals : 0;
		dec_point = dec_point != null ? dec_point : '.';
		thousands_sep = thousands_sep != null ? thousands_sep : ',';
		return number_format(toNumber(s), decimals, dec_point, thousands_sep);
	}
);

},{"es5-util/js/toNumber":19,"locutus/php/strings/number_format":29}],46:[function(require,module,exports){
var str_pad = require('locutus/php/strings/str_pad');

Latte.prototype.registerPlugin(
	'modifier',
	'padBoth',
	function (s, length, pad) {
		return str_pad(String(s), length, pad != null ? pad : ' ', 'STR_PAD_BOTH');
	}
);

},{"locutus/php/strings/str_pad":31}],47:[function(require,module,exports){
var str_pad = require('locutus/php/strings/str_pad');

Latte.prototype.registerPlugin(
	'modifier',
	'padLeft',
	function (s, length, pad) {
		return str_pad(String(s), length, pad != null ? pad : ' ', 'STR_PAD_LEFT');
	}
);

},{"locutus/php/strings/str_pad":31}],48:[function(require,module,exports){
var str_pad = require('locutus/php/strings/str_pad');

Latte.prototype.registerPlugin(
	'modifier',
	'padRight',
	function (s, length, pad) {
		return str_pad(String(s), length, pad != null ? pad : ' ', 'STR_PAD_RIGHT');
	}
);

},{"locutus/php/strings/str_pad":31}],49:[function(require,module,exports){
var str_repeat = require('locutus/php/strings/str_repeat');

Latte.prototype.registerPlugin(
	'modifier',
	'repeat',
	function (s, count) {
		return str_repeat(String(s), ~~count);
	}
);

},{"locutus/php/strings/str_repeat":32}],50:[function(require,module,exports){
var findReplace = require('es5-util/js/findReplace');

Latte.prototype.registerPlugin(
	'modifier',
	'replaceRe',
	function (s, find, replace) {
		return findReplace(s, find, replace);
	}
);

},{"es5-util/js/findReplace":1}],51:[function(require,module,exports){
var isArrayLikeObject = require('es5-util/js/isArrayLikeObject');
var toArray = require('es5-util/js/toArray');
var array_reverse = require('locutus/php/array/array_reverse');
var strrev = require('locutus/php/strings/strrev');

Latte.prototype.registerPlugin(
	'modifier',
	'reverse',
	function (s, preserveKeys) {
		if (isArrayLikeObject(s)) {
			return array_reverse(toArray(s), !!preserveKeys);
		}

		return strrev(String(s));
	});

},{"es5-util/js/isArrayLikeObject":4,"es5-util/js/toArray":16,"locutus/php/array/array_reverse":24,"locutus/php/strings/strrev":34}],52:[function(require,module,exports){
var strip_tags = require('locutus/php/strings/strip_tags');

Latte.prototype.registerPlugin(
	'modifier',
	'striptags',
	function (s) {
		return strip_tags(s);
	}
);

},{"locutus/php/strings/strip_tags":33}],53:[function(require,module,exports){
var substr = require('es5-util/js/substr');

var substring = function (s, start, length, validatePositions) {
	return substr(s, start, length, !!validatePositions);
};

Latte.prototype.registerPlugin('modifier', 'substring', substring);
Latte.prototype.registerPlugin('modifier', 'substr', substring);

},{"es5-util/js/substr":15}],54:[function(require,module,exports){
var trim = require('locutus/php/strings/trim');

Latte.prototype.registerPlugin(
	'modifier',
	'trim',
	function (s, charlist) {
		charlist = charlist != null ? charlist : " \t\n\r\0\x0B";
		return trim(String(s), charlist);
	}
);

},{"locutus/php/strings/trim":35}],55:[function(require,module,exports){
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

},{"./getNestedParts":58,"./replaceParts":61,"es5-util/js/toArray":16,"es5-util/js/toString":20}],56:[function(require,module,exports){
var getNestedParts = require('./getNestedParts');
var replaceParts = require('./replaceParts');
var replaceDelims = require('./replaceDelims').replaceDelims;
var returnDelims = require('./replaceDelims').returnDelims;

function encodeTemplate(str, ldelim, rdelim, length, getUID) {
  ldelim = ldelim != null ? ldelim : '{';
  rdelim = rdelim != null ? rdelim : '}';
  length = length != null ? length : 24;

  var delims = replaceDelims(str, ldelim, rdelim);
  var braces = replaceParts(delims, getNestedParts(delims, '[', ']'), length, getUID);
  var parens = replaceParts(braces.s, getNestedParts(braces.s, '(', ')'), length, getUID);

  return {
    s: parens.s,
    decode: function (newStr) {
      newStr = newStr != null ? newStr : parens.s;
      return returnDelims(braces.returnParts(parens.returnParts(newStr)));
    },
  };
}

module.exports = encodeTemplate;

},{"./getNestedParts":58,"./replaceDelims":60,"./replaceParts":61}],57:[function(require,module,exports){
var smartyObjectFilter = require('./smartyObjectFilter');

function getDefaultTags(obj) {
  var s = [];

  for (var key in obj) {
    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(String(key))) {
      s.push('{$' + String(key) + ' = $' + String(key) + '|default:' + smartyObjectFilter(obj[key]) + '}')
    }
  }

  return s.join('');
}

module.exports = getDefaultTags;

},{"./smartyObjectFilter":63}],58:[function(require,module,exports){
function getNestedParts(str, open, close) {
  if (str.length < 2) {
    return [];
  }

  close = close != null ? close : open;

  if (str.length === 2) {
    return str[0] === open && str[1] === close ? [str] : [];
  }

  var parts = [], nestedLevels = {}, tags = [open, "'", '"', '`'], tagsPos, level = 0, escaped, currentChar;

  for (var i = 0, j = 0; i < str.length; i++, j = i) {
    currentChar = str[i];
    escaped = false;

    if (nestedLevels[level]) {
      if (currentChar === nestedLevels[level].closeTag) {
        if (level === 1 && close === nestedLevels[level].closeTag) {
          parts.push(str.slice(nestedLevels[level].startIndex, i + 1));
        }
        delete nestedLevels[level--];
      } else if ((tagsPos = tags.indexOf(currentChar)) > -1 && close === nestedLevels[level].closeTag) {
        nestedLevels[++level] = {
          startIndex: i,
          closeTag: tagsPos === 0 ? close : tags[tagsPos],
        };
      }
    } else if ((tagsPos = tags.indexOf(currentChar)) > -1) {
      nestedLevels[++level] = {
        startIndex: i,
        closeTag: tagsPos === 0 ? close : tags[tagsPos],
      };
    }

  }

  if (Object.keys(nestedLevels).length > 0) {
    parts.push(str.slice(nestedLevels[1].startIndex));
  }

  return parts;
}

module.exports = getNestedParts;

},{}],59:[function(require,module,exports){
function nAttributesFilter(s, ldelim, rdelim) {
  ldelim = ldelim != null ? ldelim : '{';
  rdelim = rdelim != null ? rdelim : '}';

  var re = new RegExp('(n:[A-Za-z0-9 ]+=[\\s]*)(["\'])(' + ldelim + '?)((?:(?!\\2)[^}])*)(' + rdelim + '?)(\\2)', 'img');
  return s.replace(re, "$1$2" + ldelim + "$4" + rdelim + "$2");
}

module.exports = nAttributesFilter;

},{}],60:[function(require,module,exports){
function replaceDelims(s, ldelim, rdelim) {
  ldelim = ldelim != null ? ldelim : '{';
  rdelim = rdelim != null ? rdelim : '}';

  s = s.replace(new RegExp(ldelim + 'l' + rdelim, 'g'), '__ldelim__');
  s = s.replace(new RegExp(ldelim + 'r' + rdelim, 'g'), '__rdelim__');

  return s;
}

function returnDelims(s, ldelim, rdelim) {
  ldelim = ldelim != null ? ldelim : '{';
  rdelim = rdelim != null ? rdelim : '}';

  s = s.replace(new RegExp('__ldelim__', 'g'), ldelim + 'l' + rdelim);
  s = s.replace(new RegExp('__rdelim__', 'g'), ldelim + 'r' + rdelim);

  return s;
}


module.exports.replaceDelims = replaceDelims;

module.exports.returnDelims = returnDelims;

},{}],61:[function(require,module,exports){
var getiUID = require('es5-util/js/getUID').getiUID;

function replaceParts(str, parts, length, getUID) {
  getUID = getUID != null ? getUID : getiUID;

  var reference = new Map();

  function returnParts(newStr, newParts) {
    var counter = 0;
    reference.forEach(function (part, id) {
      var replacePart = newParts != null ? newParts[counter++] : part;
      newStr = newStr.replace(id, replacePart)
    });

    return newStr;
  }

  function getId() {
    var id;

    do {
      id = getUID(length);
    } while (reference.has(id));

    return id;
  }

  parts.forEach(function (part) {
    var id = getId();

    reference.set(id, part);

    str = str.replace(part, id);
  });

  return {
    s: str,
    returnParts: returnParts,
  };
}

module.exports = replaceParts;

},{"es5-util/js/getUID":2}],62:[function(require,module,exports){
var encodeTemplate = require('./encodeTemplate');
var replaceParts = require('./replaceParts');
var explode = require('es5-util/js/toArray');
var implode = require('es5-util/js/toString');

function smartyFilter(s, ldelim, rdelim) {
  //  force comma after template name
  s = s.replace(/({include ["']{1}[A-Za-z0-9]+["']{1})(,?)/g, "$1,");

  ldelim = ldelim != null ? ldelim : '{';
  rdelim = rdelim != null ? rdelim : '}';

  var es = encodeTemplate(s, ldelim, rdelim);
  var re = new RegExp(ldelim + '{1}(include){1}\\s[^' + rdelim + ']*?' + rdelim + '{1}', 'img');
  var found = es.s.match(re);

  if (!found) {
    return s;
  }

  var replace = [];

  found.forEach(function (foundItem, i) {
    var foundItemInner = foundItem.slice(ldelim.length, -ldelim.length);
    var foundParts = explode(foundItemInner, ',');
    var replacedParts = [];


    foundParts.forEach(function (foundPart) {
      foundPart = foundPart.replace('=>', '=').trim();
      if (foundPart.length > 0) {
        replacedParts.push(foundPart);
      }
    });

    replace[i] = ldelim + implode(replacedParts, ' ').trim() + rdelim;
  });

  var ep = replaceParts(es.s, found, 24);

  return es.decode(ep.returnParts(ep.s, replace));
}

module.exports = smartyFilter;

},{"./encodeTemplate":56,"./replaceParts":61,"es5-util/js/toArray":16,"es5-util/js/toString":20}],63:[function(require,module,exports){
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

},{"es5-util/js/isArrayLikeObject":4,"es5-util/js/isObject":10}],64:[function(require,module,exports){
function varFilter(s, ldelim, rdelim) {
  ldelim = ldelim != null ? ldelim : '{';
  rdelim = rdelim != null ? rdelim : '}';

  var re = new RegExp('(' + ldelim + '{1})(var{1})(\\s)(.*)(' + rdelim + '{1})', 'img');
  return s.replace(re, "$1$4$5");
}

module.exports = varFilter;

},{}],65:[function(require,module,exports){
var defaultFilter = require('./../helpers/defaultFilter');

Latte.prototype.registerFilter('pre', function (s) {
  return defaultFilter(s);
});

},{"./../helpers/defaultFilter":55}],66:[function(require,module,exports){
Latte.prototype.registerPlugin(
	'function',
	'l',
	function (params, data) {
		return Latte.prototype.left_delimiter || data.smarty.ldelim;
	}
);

Latte.prototype.registerPlugin(
	'function',
	'r',
	function (params, data) {
		return Latte.prototype.right_delimiter || data.smarty.rdelim;
	}
);

},{}],67:[function(require,module,exports){
var hasKeys = require('es5-util/js/hasKeys');

if (hasKeys(Latte.prototype, 'filtersGlobal.params') || hasKeys(Latte.prototype, 'filters_global.params')) {
	Latte.prototype.registerFilter('params', function (actualParams) {
		if (actualParams.hasOwnProperty('expand') && typeof actualParams.expand === 'object') {
			for (var prop in actualParams.expand) {
				actualParams[prop] = actualParams.expand[prop];
			}
		}

		return actualParams;
	});
}

Latte.prototype.registerFilter('pre', function (s) {
	return s.replace(/({)(((?! \(expand\) ).)*)( \(expand\) )([^}]*)(})/img, "$1$2 expand=$5$6");
});

},{"es5-util/js/hasKeys":3}],68:[function(require,module,exports){
var smartyFilter = require('./../helpers/smartyFilter');

Latte.prototype.registerFilter('pre', function (s) {
  return smartyFilter(s);
});

},{"./../helpers/smartyFilter":62}],69:[function(require,module,exports){
Latte.prototype.registerFilter('pre', function (s) {
  return s.replace(new RegExp('\\$iterator->', 'g'), '$iterator@');
});

},{}],70:[function(require,module,exports){
var nAttributesFilter = require('./../helpers/nAttributesFilter');

Latte.prototype.registerFilter('pre', function (s) {
  return nAttributesFilter(s, Latte.prototype.left_delimiter || this.ldelim || '{', Latte.prototype.right_delimiter || this.rdelim || '}');
});

},{"./../helpers/nAttributesFilter":59}],71:[function(require,module,exports){
var isEmptyLoose = require('es5-util/js/isEmptyLoose');
var isNotEmptyLoose = require('es5-util/js/isNotEmptyLoose');
var isNotSetTag = require('es5-util/js/isNotSetTag');
var isSetTag = require('es5-util/js/isSetTag');

Latte.postProcess = function (htmlString) {
  if (typeof $ !== 'function') {
    return htmlString;
  }

  var $dom = $($.parseHTML('<div>' + htmlString + '</div>'));

  $dom.find('[n\\:tag-if]').each(function (index, el) {
    var $el = $(el), attr = 'n:tag-if';

    isSetTag($el.attr(attr).trim()) ? $el.removeAttr(attr) : $el.replaceWith($el.html());
  });

  $dom.find('[n\\:ifcontent]').each(function (index, el) {
    var $el = $(el), attr = 'n:ifcontent';

    isSetTag($el.html().trim()) ? $el.removeAttr(attr) : $el.remove();
  });

  $dom.find('[n\\:ifset]').each(function (index, el) {
    var $el = $(el), attr = 'n:ifset';

    isSetTag($el.attr(attr).trim()) ? $el.removeAttr(attr) : $el.remove();
  });

  $dom.find('[n\\:ifnotset]').each(function (index, el) {
    var $el = $(el), attr = 'n:ifnotset';

    isNotSetTag($el.attr(attr).trim()) ? $el.removeAttr(attr) : $el.remove();
  });

  $dom.find('[n\\:ifempty]').each(function (index, el) {
    var $el = $(el), attr = 'n:ifempty';

    isEmptyLoose($el.attr(attr).trim()) ? $el.removeAttr(attr) : $el.remove();
  });

  $dom.find('[n\\:ifnotempty]').each(function (index, el) {
    var $el = $(el), attr = 'n:ifnotempty';

    isNotEmptyLoose($el.attr(attr).trim()) ? $el.removeAttr(attr) : $el.remove();
  });

  return $dom.html();
};

},{"es5-util/js/isEmptyLoose":5,"es5-util/js/isNotEmptyLoose":7,"es5-util/js/isNotSetTag":9,"es5-util/js/isSetTag":13}],72:[function(require,module,exports){
Latte.prototype.registerPlugin(
	'block',
	'spaceless',
	function (params, content, data, repeat) {
		if (repeat.value) {
			return '';
		}
		return content.replace(/[ \t]*[\r\n]+[ \t]*/g, '');
	}
);

},{}],73:[function(require,module,exports){
var varFilter = require('./../helpers/varFilter');

Latte.prototype.registerFilter('pre', function (s) {
  return varFilter(s);
});

},{"./../helpers/varFilter":64}]},{},[55,56,57,58,59,60,61,62,63,64,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,65,66,67,68,69,70,71,72,73]);
