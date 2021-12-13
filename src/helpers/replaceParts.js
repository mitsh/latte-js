var getiUID = require('es5-util/js/getUID').getiUID;

function replaceParts(str, parts, length, getUID)
{
  getUID = getUID != null ? getUID : getiUID;

  var reference = new Map();

  function returnParts(newStr, newParts)
  {
    var counter = 0;
    reference.forEach(function (part, id)
    {
      var replacePart = newParts != null ? newParts[counter++] : part;
      newStr          = newStr.replace(id, replacePart)
    });

    return newStr;
  }

  function getId()
  {
    var id;

    do
    {
      id = getUID(length);
    }
    while (reference.has(id));

    return id;
  }

  parts.forEach(function (part)
  {
    var id = getId();

    reference.set(id, part);

    str = str.replace(part, id);
  });

  return {
    s          : str,
    returnParts: returnParts,
  };
}

module.exports = replaceParts;
