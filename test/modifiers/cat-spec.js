define(['Latte'], function (Latte) {
  describe('Test modifier:: cat', function () {
    var tpl
    var output
    var t

    it('test cat', function () {
      tpl = '{$words|cat: " world"}'
      output = 'Hello world'
      t = new Latte(tpl)
      expect(t.fetch({words: 'Hello'})).toBe(output)
    })
  })
})
