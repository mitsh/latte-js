function getNestedParts(str, open, close)
{
  if (str.length < 2)
  {
    return [];
  }

  close = close != null ? close : open;

  if (str.length === 2)
  {
    return str[0] === open && str[1] === close ? [str] : [];
  }

  var parts = [],
      nestedLevels = {},
      tags = [open, "'", '"', '`'],
      tagsPos,
      level = 0,
      escaped,
      currentChar;

  for (var i = 0, j = 0; i < str.length; i++, j = i)
  {
    currentChar = str[i];
    escaped     = false;

    if (nestedLevels[level])
    {
      if (currentChar === nestedLevels[level].closeTag)
      {
        if (level === 1 && close === nestedLevels[level].closeTag)
        {
          parts.push(str.slice(nestedLevels[level].startIndex, i + 1));
        }
        delete nestedLevels[level--];
      }
      else if ((tagsPos = tags.indexOf(currentChar)) > -1 && close === nestedLevels[level].closeTag)
      {
        nestedLevels[++level] = {
          startIndex: i,
          closeTag  : tagsPos === 0 ? close : tags[tagsPos],
        };
      }
    }
    else if ((tagsPos = tags.indexOf(currentChar)) > -1)
    {
      nestedLevels[++level] = {
        startIndex: i,
        closeTag  : tagsPos === 0 ? close : tags[tagsPos],
      };
    }

  }

  if (Object.keys(nestedLevels).length > 0)
  {
    parts.push(str.slice(nestedLevels[1].startIndex));
  }

  return parts;
}

module.exports = getNestedParts;
