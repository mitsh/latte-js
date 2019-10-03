const defaultFilter = require('./../../src/helpers/defaultFilter');

const table = [
  [
    `{default $name = 'John Smith', $age = 27}`,
    `{$name = $name|default:'John Smith'}{$age = $age|default:27}`,
  ],
  [
    `{default $b = 'b'}`,
    `{$b = $b|default:'b'}`,
  ],
  [
    `{default $nums = [1,2,3]}`,
    `{$nums = $nums|default:[1,2,3]}`,
  ],
  [
    `{default $var = 'phil', $message = 'Width 1/2"', $a = 'car()'}`,
    `{$var = $var|default:'phil'}{$message = $message|default:'Width 1/2"'}{$a = $a|default:'car()'}`,
  ],
  [
    `{default $lang = 'cs'}`,
    `{$lang = $lang|default:'cs'}`,
  ],
  [
    `{default $foo = value}`,
    `{$foo = $foo|default:value}`,
  ],
  [
    `prefix {default $foo = value} suffix`,
    `prefix {$foo = $foo|default:value} suffix`,
  ],
  [`no change!`],
  [`{no change!}`],
  [`{defaultignore}`],
];

test.each(table)(
  'defaultFilter(%s)',
  (str, expected = null) => {
    expect(defaultFilter(str)).toStrictEqual(expected || str);
  },
);
