const varFilter = require('./../../src/helpers/varFilter');

const table = [
  [
    `{var $a = '1'}`,
    `{$a = '1'}`
  ],
  [
    `{var $args = ["a"=>"b", "c"=>"d"]}`,
    `{$args = ["a"=>"b", "c"=>"d"]}`
  ],
  [
    `{var $blank->a = '123abc'}`,
    `{$blank->a = '123abc'}`
  ],
  [
    `{var $f = $b}`,
    `{$f = $b}`
  ],
  [
    `{var $a = $b}{var $x = $y}`,
    `{$a = $b}{$x = $y}`
  ],
  [
    `prefix {include 'parent'} inner {var $a = $b} ? {var $m = 'n'} : {var $x = $y} suffix`,
    `prefix {include 'parent'} inner {$a = $b} ? {$m = 'n'} : {$x = $y} suffix`
  ],
  [
    `{var $items = ['I', '♥', 'Nette_Framework']}`,
    `{$items = ['I', '♥', 'Nette_Framework']}`
  ],
  [
    `{var $link = 'javascript:void(0);'}`,
    `{$link = 'javascript:void(0);'}`
  ],
  [
    `{var $foo = value}`,
    `{$foo = value}`
  ],
  [
    `{var $name = 'John Smith'}`,
    `{$name = 'John Smith'}`
  ],
  [
    `{var $age = 27}`,
    `{$age = 27}`
  ],
  [
    `{var $name = 'John Smith', $age = 27}`,
    `{$name = 'John Smith', $age = 27}`
  ],
  [
    `{var $items = ['I', '♥', 'Nette Framework']}`,
    `{$items = ['I', '♥', 'Nette Framework']}`
  ],
  [
    `{var $name = ($title|upper) . ($subtitle|lower)}`,
    `{$name = ($title|upper) . ($subtitle|lower)}`
  ],
  [
    `{var $link = 'javascript:attack()'}`,
    `{$link = 'javascript:attack()'}`
  ],
  [`no change!`],
];

test.each(table)(
  'varFilter(%s)',
  (str, expected = null) => {
    expect(varFilter(str)).toStrictEqual(expected || str);
  },
);
