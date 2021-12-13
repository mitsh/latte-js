var getDefaultTags = require('./../helpers/getDefaultTags');

Latte.getDefaultTags = getDefaultTags;

Latte.setDefaultTags = function (template, obj)
{
  return getDefaultTags(obj) + template;
};
