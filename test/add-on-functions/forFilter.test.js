const forFilter = require('./../../src/helpers/forFilter');

const table = [
  [
    `basic`,
    `prefix {for $i = 0; $i < 10; $i++} suffix`,
    `prefix {for $i = 0 to 10-1} suffix`,
  ],
  [
    `negative step`,
    `prefix {for $i = 10; $i > 0; $i--} suffix`,
    `prefix {for $i = 10 to 0+1 step -1} suffix`,
  ],
  [
    `multiple step`,
    `prefix {for $i = 0; $i < 10; $i+=2} suffix`,
    `prefix {for $i = 0 to 10-1 step 2} suffix`,
  ],
  [
    `multiple negative step`,
    `prefix {for $i = 10; $i > 0; $i-=2} suffix`,
    `prefix {for $i = 10 to 0+1 step -2} suffix`,
  ],
  [
    `equals w/ negative variable step`,
    `prefix {for $i = 10; $i >= 0; $i-=$j,$j+3} suffix`,
    `prefix {for $i = 10 to 0 step -$j} suffix`,
  ],
  [
    `empty`,
    `prefix {for ; ;} suffix`,
    `prefix {for $i = 0 to 2-1} suffix`,
  ],
  [
    `multiple for tags`,
    `prefix {for $i=0; $i < 10; $i++} inner {for $i=$num; $i <= 0; $i-=2} suffix`,
    `prefix {for $i=0 to 10-1} inner {for $i=$num to 0 step -2} suffix`,
  ],
  [
    `example 1`,
    `{for $i = 1; $i <= 10; $i++}`,
    `{for $i = 1 to 10}`,
  ],
  [
    `example 2`,
    `{for $i = 1; ; $i++}`,
    `{for $i = 1 to 2-1}`,
  ],
  [
    `example 3`,
    `{for ; ; }`,
    `{for $i = 0 to 2-1}`,
  ],
  [
    `example 4`,
    `{for $i = 1, $j = 0; $i <= 10; $j += $i, print $i, $i++}`,
    `{for $i = 1, $j = 0 to 10}`,
  ],
  [
    `array with some data we want to modify`,
    `{for $i = 0; $i < count($people); ++$i}`,
    `{for $i = 0 to count($people)-1}`,
  ],
  [
    `Smarty example 1`,
    `{for $i=0; $i <= $colorNames|count-1; $i++}`,
    `{for $i=0 to $colorNames|count-1}`,
  ],
  [
    `Smarty example 2`,
    `{for $i=1; $i <= 5; $i++}`,
    `{for $i=1 to 5}`,
  ],
  [
    `Smarty example 3`,
    `{for $i=-5; $i <= -1; $i++}`,
    `{for $i=-5 to -1}`,
  ],
  [
    `Smarty example 4`,
    `{for $i=$num; $i <= 1; $i-=2}`,
    `{for $i=$num to 1 step -2}`,
  ],
  [
    `Smarty example 5`,
    `{for $i=0; $i <= $ar|count-1; $i++}`,
    `{for $i=0 to $ar|count-1}`,
  ],
  [
    `Smarty example 6`,
    `{for $i=0; $i <= $empty|count-1; $i++}`,
    `{for $i=0 to $empty|count-1}`,
  ],
  [
    `Smarty example 7`,
    `{for $foo=1; $i <= 3; $i++}`,
    `{for $foo=1 to 3}`,
  ],
  [
    `Smarty example 8`,
    `{for $foo=3; $i <= $to; $i++}`,
    `{for $foo=3 to $to}`,
  ],
  [
    `Smarty example 9`,
    `{for $foo=$start; $i <= $to; $i++}`,
    `{for $foo=$start to $to}`,
  ],
  [
    `latte example 1`,
    `{for $i=10; $i <= $end; $i-=2}`,
    `{for $i=10 to $end step -2}`,
  ],
  [
    `latte example 1`,
    `{for $i=0; $i <= $ar|length-1; $i++}`,
    `{for $i=0 to $ar|length-1}`,
  ],
];

test.each(table)(
  'ternaryFilter(%s)',
  (message, str, expected = null) => {
    expect(forFilter(str)).toStrictEqual(expected || str);
  },
);
