const getNestedParts = require('./../../src/helpers/getNestedParts');

const table = [
  [``, `[`, `]`, []],
  [`[`, `[`, `]`, []],
  [`]`, `[`, `]`, []],
  [`[]`, `[`, `]`, [`[]`]],
  [`[[`, `[`, `]`, []],
  [`[[]`, `[`, `]`, [`[[]`]],
  [`[]]`, `[`, `]`, [`[]`]],
  [`]]`, `[`, `]`, []],
  [
    `{incl 'a' b=[[x=>'y']]}`, `[`, `]`,
    [`[[x=>'y']]`]
  ],
  [
    `{incl 'a' b=[[x=>'y\\'z']]}`, `[`, `]`,
    [`[[x=>'y\\'z']]}`] // This should produced an error if eval'd in JavaScript
  ],
  [
    `{incl 'a' b=[[x=>'y"z']]}`, `[`, `]`,
    [`[[x=>'y"z']]`]
  ],
  [
    `{incl 'a' b=[[x=>'y[z']]}`, `[`, `]`,
    [`[[x=>'y[z']]`]
  ],
  [
    `{incl 'a' b=[[x=>'y]z']]}`, `[`, `]`,
    [`[[x=>'y]z']]`]
  ],
  [
    `{incl 'a' b=[[x=>']']]}`, `[`, `]`,
    [`[[x=>']']]`]
  ],
  [
    `{incl 'a' b = [ [x=>'[]'] , [y=>'""'] ] }`, `[`, `]`,
    [`[ [x=>'[]'] , [y=>'""'] ]`]
  ],
  [
    `{incl 'a' b =[x=>'\''] , c=[ [y=>'[]'] ]}`, `[`, `]`,
    [`[x=>'''] , c=[ [y=>'[]'] ]}`] // WARNING: Can't see raw backslashes
  ],
  [
    `{incl 'a' b = [ [x=>'[]'] ], c=[y=>'\\']}`, `[`, `]`,
    [`[ [x=>'[]'] ]`, `[y=>'\\']`]
  ],
  [
    `{incl 'a' b = [ [x=>'[]'] ], c=[y=>"\\\""]}`, `[`, `]`,
    [`[ [x=>'[]'] ]`, `[y=>"\\\""]}`] // WARNING: Can't see raw backslashes
  ],
  [
    `{include 'buttons' buttons=[[ aaa => "bbb", text => fake('random.words|3'), url => "#1" ], [ color => "red", text => fake('random.words|3'), url => "#2" ]]}`,
    `[`, `]`, [`[[ aaa => "bbb", text => fake('random.words|3'), url => "#1" ], [ color => "red", text => fake('random.words|3'), url => "#2" ]]`]],
  [`{include 'test', a => [1, [2, [3, 4], 5], 6], b => [11, [12, [13, 14], 15], 16], c => [21, [22, [23, 24], 25], 26]}`,
    `[`, `]`, [
    `[1, [2, [3, 4], 5], 6]`,
    `[11, [12, [13, 14], 15], 16]`,
    `[21, [22, [23, 24], 25], 26]`,
  ]],
  ['abc<1<2<>3>4>def', '<', '>', ['<1<2<>3>4>']],
  ['abc(d(e())f)(gh)ijk()', '(', ')', ['(d(e())f)', '(gh)', '()']],
  [`<div class="some-class" id="some_id"></div>`, `"`, `"`, ['"some-class"', '"some_id"']],
  [`<div class="some-class" id="some_id"></div>`, `'`, `'`, []],
  [`<div class="some-class" id="some_id"></div>`, `"`, undefined, ['"some-class"', '"some_id"']],
  [`<div class='some-class' id='some_id'></div>`, `'`, `'`, ["'some-class'", "'some_id'"]],
  [`<div class='some-class' id='some_id'></div>`, `"`, `"`, []],
  [`<div class='some-class' id='some_id'></div>`, `'`, undefined, ["'some-class'", "'some_id'"]],
];

test.each(table)(
  '%s: getNestedParts(%s, %s)',
  (str, open, close, expected) => {
    expect(getNestedParts(str, open, close)).toStrictEqual(expected);
  },
);
