const getDefaultTags = require('./../../src/helpers/getDefaultTags');

const Foo = function () {
  this.a = 1;
  this.b = 2;
};

Foo.prototype.c = 3;
Foo.prototype['3'] = 4;

const table = [
  [{}, ''],
  [{a: 'b'}, '{$a = $a|default:"b"}'],
  [{key1: 'value1', key2: 'value2'}, '{$key1 = $key1|default:"value1"}{$key2 = $key2|default:"value2"}'],
  [{a: 1, b: '2', c: 3}, '{$a = $a|default:1}{$b = $b|default:"2"}{$c = $c|default:3}'],
  [{_a_b: null, _y_z: undefined}, '{$_a_b = $_a_b|default:""}{$_y_z = $_y_z|default:""}'],
  [{null: null, undefined: undefined}, '{$null = $null|default:""}{$undefined = $undefined|default:""}'],
  [{1: 'A', 2: 'B'}, ''],
  [{1: 'A', 2: 'B', '_3': 'C', '$': 'D', '_$': 'E'}, '{$_3 = $_3|default:"C"}'],
  [{a: 1.2345}, '{$a = $a|default:1.2345}'],
  [{someKey: [1, '2', 3]}, '{$someKey = $someKey|default:[1,"2",3]}'],
  [{someKey: {a: 1, b: '2', c: 3}}, '{$someKey = $someKey|default:["a"=>1,"b"=>"2","c"=>3]}'],
  [Foo, ''],
  [new Foo, '{$a = $a|default:1}{$b = $b|default:2}{$c = $c|default:3}'],
  [{"y": Foo, "z": new Foo}, '{$y = $y|default:[]}{$z = $z|default:["a"=>1,"b"=>2,"3"=>4,"c"=>3]}'],
];

test.each(table)(
  '%j: getDefaultTag(%s)',
  (input, expected) => {
    expect(getDefaultTags(input)).toStrictEqual(expected);
  },
);
