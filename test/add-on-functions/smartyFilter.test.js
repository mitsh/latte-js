const smartyFilter = require('./../../src/helpers/smartyFilter');

const table = [
  // Nette Latte
  [
    `{include 'buttons', buttons => $buttons || []}`,
    `{include 'buttons' buttons = $buttons || []}`,
  ],
  [
    `{include 'button', text => fake(words:5,1,2,3), url => fake(url), color => fake(colorName)}`,
    `{include 'button' text = fake(words:5,1,2,3) url = fake(url) color = fake(colorName)}`,
  ],
  [
    `{include 'cards', cards=>$cards}`,
    `{include 'cards' cards=$cards}`,
  ],
  [
    `{include 'child', nums1 => [1,2,3], nums2=> [2,4,6]}`,
    `{include 'child' nums1 = [1,2,3] nums2= [2,4,6]}`,
  ],
  [
    `{include 'expand' expand => $args, e => ['f','g']}`,
    `{include 'expand' expand = $args e = ['f','g']}`,
  ],
  [
    `{include 'expand' expand => $args, e => ['f','g']}`,
    `{include 'expand' expand = $args e = ['f','g']}`,
  ],
  [
    `{include 'expand', (expand) $args, e => ['f','g']}`,
    `{include 'expand' (expand) $args e = ['f','g']}`,
  ],
  [
    `{include 'expand', a => 'bcd', (expand) $args, e => ['f','g']}`,
    `{include 'expand' a = 'bcd' (expand) $args e = ['f','g']}`,
  ],
  // SmartyJS
  [
    `{include 'parent', var => 'foz'}`,
    `{include 'parent' var = 'foz'}`,
  ],
  [
    `{include 'expand' expand=$args, $e}`,
    `{include 'expand' expand=$args $e}`,
  ],
  [
    `{include 'expand' expand=$args, e}`,
    `{include 'expand' expand=$args e}`,
  ],
  [`{include 'expand' expand=["a"=>"b", "c"=>"d"] $e=['f','g']}`],
  [`{include 'expand' expand=$args $e}`],
  [`{include 'expand' expand=$args e}`],
  [`{include 'expand' expand=$args $e=['f','g']}`],
  [`{include 'expand' expand=$args e=['f','g']}`],
  [`{include 'expand' $e expand=$args}`],
  [`{include 'button' (expand) $button}`],
  [`{include 'button' text='text2' url='https://renderdev.com/' color='red'}`],
  [`{include 'card' (expand) $card}`],
  [`{include 'child' nums = [2,4,6]}`],
  [`{include 'expand' (expand) $args e = ['f','g']}`],
  [`{include 'helloWorld' arr1=[1,2,3] obj1=[a=>'bbb',b=>] who=fake('name.firstName')}`],
  [`{include 'parent' var=foz}`],
  [`{include 'sidebar' $post_title = $post['post_title']}`],
  [`{include 'buttons' buttons=[[ aaa => "bbb", text => fake('random.words|3'), url => "#1" ],[ color => "red", text => fake('random.words|3'), url => "#2" ]]}`],
  [`{foreach $colors as $name=>$color} ... {foreachelse} ... {/foreach}`],
  [`prefix {include 'parent' var = 'foz'} suffix`,],
  [`no change!`],
  [`{no change!}`],
  [`{includeignore}`],
  [`{include 'parent'}`,],
  [
    `{include 'parent',}{include 'parent'}`,
    `{include 'parent'}{include 'parent'}`,
  ],
  [
    `{include 'parent'}{include 'parent',}`,
    `{include 'parent'}{include 'parent'}`,
  ],
  [
    `{include 'parent',}{include 'parent',}{include 'parent'}`,
    `{include 'parent'}{include 'parent'}{include 'parent'}`,
  ],
  [
    `{include 'parent',}{include 'parent',}{include 'parent',  }{include 'parent'  }`,
    `{include 'parent'}{include 'parent'}{include 'parent'}{include 'parent'}`,
  ],
  [
    `prefix {include 'parent' a = 'b'   } inner {include 'parent', x => 'y'   } suffix`,
    `prefix {include 'parent' a = 'b'} inner {include 'parent' x = 'y'} suffix`,
  ],
];

test.each(table)(
  'smartyFilter(%s)',
  (str, expected = null) => {
    expect(smartyFilter(str)).toStrictEqual(expected || str);
  },
);
