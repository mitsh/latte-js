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
    `prefix {default $foo1 = value} middle {default $foo2 = value} suffix`,
    `prefix {$foo1 = $foo1|default:value} middle {$foo2 = $foo2|default:value} suffix`,
  ],
  [
    `prefix {default $foo1 = value}{default $foo2 = value, $foo3 = value} middle {default $foo4 = value} suffix`,
    `prefix {$foo1 = $foo1|default:value}{$foo2 = $foo2|default:value}{$foo3 = $foo3|default:value} middle {$foo4 = $foo4|default:value} suffix`,
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
