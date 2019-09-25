define(['Latte'], function (Latte) {
  describe('Test custom function:: eval', function () {
    var tpl
    var output
    var t

    it('test simple eval', function () {
      tpl = '{eval var="hello {$world}"}'
      output = 'hello man'
      t = new Latte(tpl)
      expect(t.fetch({world: 'man'})).toBe(output)
    })
  })
})
