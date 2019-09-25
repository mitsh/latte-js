/**
 * Example show LatteJS can be used in Node.js
 */

var fs = require('fs'),
    path = require('path'),
    Latte = require('Latte');

var tpl = fs.readFileSync(path.normalize(__dirname+'/hello.tpl'), {encoding: 'utf-8'});

var compiledTemplate = new Latte(tpl);

console.log(compiledTemplate.fetch({name: "Chex Lemeneux"}));
