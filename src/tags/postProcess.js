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
