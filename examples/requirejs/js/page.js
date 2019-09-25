
define(['text!t/subtemplate.html', 'Latte'], function (tpl, Latte) {

    Latte.prototype.addDefaultModifier(['escape']);

    var t = new Latte(tpl);
    document.getElementById('output').innerHTML = t.fetch({'name': 'Chex'});
});
