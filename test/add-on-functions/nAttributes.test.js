const nAttributesFilter = require('./../../src/helpers/nAttributesFilter');

const table = [
  [`<div class="error" data-num="2" n:ifnotset="{$error2}">#{$error2}</div>`],
  [`<div class="error" data-num="2" n:ifnotset="$error2">#{$error2}</div>`, `<div class="error" data-num="2" n:ifnotset="{$error2}">#{$error2}</div>`],
  [`<div class="error" n:ifnotset="{$error}">#{$error}</div>`],
  [`<div class="error" n:ifnotset="$error">#{$error}</div>`, `<div class="error" n:ifnotset="{$error}">#{$error}</div>`],
  [`<h3 n:ifnotempty="{$header}">{$header}</h3>`],
  [`<h3 n:ifnotempty="$header">{$header}</h3>`, `<h3 n:ifnotempty="{$header}">{$header}</h3>`],
  [`<p n:ifnotempty="{$content}">{$content}</p>`],
  [`<p n:ifnotempty="$content">{$content}</p>`, `<p n:ifnotempty="{$content}">{$content}</p>`],
  [`<ul class="buttons" n:ifnotempty="{$buttons}">`],
  [`<ul class="buttons" n:ifnotempty="$buttons">`, `<ul class="buttons" n:ifnotempty="{$buttons}">`],
  [`<ul class="cards" n:ifnotempty="{$cards}">`],
  [`<ul class="cards" n:ifnotempty="$cards">`, `<ul class="cards" n:ifnotempty="{$cards}">`],
  [`<ul class='cards' n:ifnotempty='$cards'>`, `<ul class='cards' n:ifnotempty='{$cards}'>`],
];

test.each(table)(
  'nAttributesFilter(%s)',
  (str, expected = null) => {
    expect(nAttributesFilter(str)).toStrictEqual(expected || str);
  },
);
