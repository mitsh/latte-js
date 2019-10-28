const replaceParts = require('./../../src/helpers/replaceParts');

const table = [
  [
    `a {b}{d} c {d} e`, ['{b}', '{d}', '{d}'], `a __0____1__ c __2__ e`,
    `x __1__ y __0__ z`, `x {d} y {b} z`
  ],
];

test.each(table)(
  'replaceParts(%s)',
  (initStr, parts = [], replacedStr, newStr, finalStr) => {
    let counter = 0;

    const getUID = () => {
      return `__${counter++}__`;
    };

    let response = replaceParts(initStr, parts, null, getUID);

    expect(response.s).toStrictEqual(replacedStr);
    expect(response.returnParts(newStr)).toStrictEqual(finalStr);
  },
);
