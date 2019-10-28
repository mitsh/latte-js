const encodeTemplate = require('./../../src/helpers/encodeTemplate');

const table = [
  [
    `prefix {l}inner{r} suffix`,
    `prefix __ldelim__inner__rdelim__ suffix`,
    `prefix __ldelim__outer__rdelim__ suffix`,
    `prefix {l}outer{r} suffix`,
  ],
  [
    `prefix {l}inner{r} middle {l}inner{r} suffix`,
    `prefix __ldelim__inner__rdelim__ middle __ldelim__inner__rdelim__ suffix`,
    `prefix __ldelim__outer__rdelim__ middle __ldelim__outer__rdelim__ suffix`,
    `prefix {l}outer{r} middle {l}outer{r} suffix`,
  ],
  [
    `prefix {include 'parent' x = [a=>''] y = [b=>(1+2)]} suffix`,
    `prefix {include 'parent' x = __0__ y = __1__} suffix`,
    `prefix2 {include 'parent' x = __0__ y = __1__} suffix2`,
    `prefix2 {include 'parent' x = [a=>''] y = [b=>(1+2)]} suffix2`,
  ],
  [
    `prefix {include 'parent' a = (1+(1+2)) b = (1+(1+(1+2)))} suffix`,
    `prefix {include 'parent' a = __0__ b = __1__} suffix`,
    `prefix {include 'parent' x = __0__ y = __1__} suffix`,
    `prefix {include 'parent' x = (1+(1+2)) y = (1+(1+(1+2)))} suffix`,
  ],
  [
    `prefix {include 'parent' e = [a=>'{l}text{r}'] f = (1+2) g = '{l}text{r}'} suffix`,
    `prefix {include 'parent' e = __0__ f = __1__ g = '__ldelim__text__rdelim__'} suffix`,
    `prefix2 {include 'parent' e = __0__ f = __1__ g = '__ldelim__text__rdelim__'} suffix2`,
    `prefix2 {include 'parent' e = [a=>'{l}text{r}'] f = (1+2) g = '{l}text{r}'} suffix2`,
  ],
  [
    `prefix {include 'parent' x = [a=>'']} {l}inner{r} {include 'parent' x = [a=>'']} suffix`,
    `prefix {include 'parent' x = __0__} __ldelim__inner__rdelim__ {include 'parent' x = __1__} suffix`,
    `prefix {include 'parent' z = __0__} __ldelim__inner__rdelim__ {include 'parent' z = __1__} suffix`,
    `prefix {include 'parent' z = [a=>'']} {l}inner{r} {include 'parent' z = [a=>'']} suffix`,
  ],
  [
    `prefix {include 'parent' x = [a=>'{l}text{r}'] y = [b=>(1+2)]} suffix`,
    `prefix {include 'parent' x = __0__ y = __1__} suffix`,
    `prefix {include 'parent' a = __0__ b = __1__} suffix`,
    `prefix {include 'parent' a = [a=>'{l}text{r}'] b = [b=>(1+2)]} suffix`,
  ],
];

test.each(table)(
  'encodeTemplate(%s)',
  (decodedStr, encodedStr, newEncodedStr, newDecodedStr) => {
    let counter = 0;

    const getUID = () => {
      return `__${counter++}__`;
    };

    let response = encodeTemplate(decodedStr, null, null, null, getUID);

    expect(response.s).toStrictEqual(encodedStr);
    expect(response.decode(newEncodedStr)).toStrictEqual(newDecodedStr);
  },
);
