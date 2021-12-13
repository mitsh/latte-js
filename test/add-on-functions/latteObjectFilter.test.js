const latteObjectFilter = require('./../../src/helpers/latteObjectFilter');

const associativeArray = [];
associativeArray['a'] = 1;
associativeArray['b'] = 2;
associativeArray['c'] = 3;
associativeArray['3'] = 4;

const Foo = function () {
  this.a = 1;
  this.b = 2;
};

Foo.prototype.c = 3;
Foo.prototype['3'] = 4;

const table = [
  ['undefined', undefined, '""'],
  ['null', null, '""'],
  ['true', true, 'true'],
  ['false', false, 'false'],
  ['empty number', 0, '0'],
  ['non-empty number', 1, '1'],
  ['non-empty number 2', 2, '2'],
  ['negative number', -0, '0'],
  ['empty float', 0.0, '0'],
  ['non-empty float', 1.1, '1.1'],
  ['empty number string', '0', '"0"'],
  ['non-empty number string', '1', '"1"'],
  ['non-empty number string int', ' 2 ', '" 2 "'],
  ['non-empty number string float', ' 3.4 ', '" 3.4 "'],
  ['empty string', '', '""'],
  ['non-empty string', 'abc', '"abc"'],
  ['empty array', [], '[]'],
  ['non-empty array', [1, 2, 3], '[1,2,3]'],
  ['non-empty array', ['a', 'b', 'c'], '["a","b","c"]'],
  ['non-empty nest3ed array', [1, 2, 3, ['a', 'b', 'c', [{a: [null, undefined]}]]], '[1,2,3,["a","b","c",[["a"=>["",""]]]]]'],
  ['non-empty associative array', associativeArray, '[4,1,2,3]'],
  ['empty object', {}, '[]'],
  ['non-empty object', {a: 1, b: 2, c: 3}, '["a"=>1,"b"=>2,"c"=>3]'],
  ['non-empty nested object', {a: 1, b: {1: '2a', 2: ['a', 2, {x: '{y}'}]}, c: 3}, '["a"=>1,"b"=>["1"=>"2a","2"=>["a",2,["x"=>"{y}"]]],"c"=>3]'],
  ['function', Foo, '[]'],
  ['class', new Foo, '["a"=>1,"b"=>2,"3"=>4,"c"=>3]'],
  ['!func', `!ns fake('random.words|5')`, `fake('random.words|5')`]
];

test.each(table)(
  '%s: latteObjectFilter(%j)',
  (message, input, expected) => {
    expect(latteObjectFilter(input)).toStrictEqual(expected);
  },
);
