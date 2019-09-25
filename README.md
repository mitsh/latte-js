LatteJS - Latte template engine in JavaScript
======

LatteJS is a port of Nette's Latte PHP Template Engine to Javascript, a JavaScript template library that supports the template [syntax](https://github.com/pfaciana/latte-js/wiki/syntax) and all the features (functions, variable modifiers, etc.) of the well-known PHP template engine [Latte](https://latte.nette.org/).

LatteJS is written entirely in JavaScript, does not have any DOM/browser or third-party JavaScript library dependencies and can be run in a web browser as well as a standalone JavaScript interpreter or [CommonJS](http://www.commonjs.org/) environments like [node.js](https://nodejs.org/).

LatteJS supports plugin architecture, you can [extend it with custom plugins](https://github.com/pfaciana/latte-js/wiki/Create-Plugin): functions, blocks and variable modifiers, [templates inclusion](https://github.com/pfaciana/latte-js/wiki/Include-Templates), [templates inheritance](https://github.com/pfaciana/latte-js/wiki/Template-Inheritance) and overriding, [caching](https://github.com/pfaciana/latte-js/wiki/Caching), [escape HTML](https://github.com/pfaciana/latte-js/wiki/escape_html).

LatteJS has some limited support of the [PHP Latte syntax](https://github.com/pfaciana/latte-js/wiki/syntax) and allows you to [use the same Latte templates on both server and client side](https://github.com/pfaciana/latte-js/wiki/Smarty-template-in-javascript), for both PHP and Javascript.

### DOCUMENTATION

[https://github.com/pfaciana/latte-js/wiki](https://github.com/pfaciana/latte-js/wiki)

### TESTS

* Test cases:-
  ```grunt karma```

* ES Lint tests:-
  ```grunt eslint```

* Run lint, run test, build, compress, distribution package and update examples in one command:-
  ```grunt```

### LICENSE

[MIT](https://raw.githubusercontent.com/pfaciana/latte-js/master/LICENSE)

### NOTICE

Project originally was created by [miroshnikov](https://github.com/miroshnikov). Since author was not active on project very frequently. I have forked and planned on pushing further improvements and features on my own fork.
