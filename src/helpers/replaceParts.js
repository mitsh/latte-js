var getiUID = require('es5-util/js/getUID').getiUID;

function replaceParts(str, parts, length) {
  var reference = new Map();

  function returnParts(newStr) {
    reference.forEach(function (part, id) {
      newStr = newStr.replace(id, part)
    });

    return newStr;
  }

  function getId() {
    var id;

    do {
      id = getiUID(length);
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
