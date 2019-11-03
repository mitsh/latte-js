const ternaryFilter = require('./../../src/helpers/ternaryFilter');
var processDelims = require('./../../src/helpers/replaceDelims').processDelims;

const table = [
  [`basic`, `prefix {'true' ? 'yes' : $no} suffix`, `prefix {if 'true'}{'yes'}{else}{$no}{/if} suffix`],
  [`w/ var`, `prefix {$a = 1 ? $on : 'off'} suffix`, `prefix {if 1}{$a = $on}{else}{$a = 'off'}{/if} suffix`],
  [`!missing whitespace`, `prefix {'true'?'yes':$no} suffix`],
  [`ignore`, `{if true}{$foo = 'abc'}{else}{$foo = 'xyz'}{/if}`],
  [`lazy regex check`, `{if 1===2}{'abc'}{else}{'xyz'}{/if}{1 ? 'on' : 'off'}`, `{if 1===2}{'abc'}{else}{'xyz'}{/if}{if 1}{'on'}{else}{'off'}{/if}`],
  [`delims check`, `prefix {'true' ? 'yes' : '{l}no{r}'} suffix`, `prefix {if 'true'}{'yes'}{else}{'{no}'}{/if} suffix`],
  [`elvis`, `prefix {$a ?: 'no'} suffix`, `prefix {if $a}{$a}{else}{'no'}{/if} suffix`],
  [`elvis w/ var`, `prefix {$x = $a ?: 'no'} suffix`, `prefix {if $a}{$x = $a}{else}{$x = 'no'}{/if} suffix`],
  [`null coalesce`, `prefix {$a ?? 'no'} suffix`, `prefix {if $a !== ''}{$a}{else}{'no'}{/if} suffix`],
  [`null coalesce w/ var`, `prefix {$x = $a ?? 'no'} suffix`, `prefix {if $a !== ''}{$x = $a}{else}{$x = 'no'}{/if} suffix`],
];

test.each(table)(
  'ternaryFilter(%s)',
  (message, str, expected = null) => {
    expect(processDelims(ternaryFilter(str))).toStrictEqual(expected || str);
  },
);
