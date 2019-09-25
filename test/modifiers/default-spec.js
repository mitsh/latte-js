define(['Latte'], function (Latte) {
  describe('Test modifier:: default', function () {
    var tpl
    var output
    var t

    it('test default', function () {
      tpl = "{$articleTitle|default:'no title'} {$myTitle|default:'no title'}"
      output = 'Dealers Will Hear Car Talk at Noon. no title'
      t = new Latte(tpl)
      expect(t.fetch({articleTitle: 'Dealers Will Hear Car Talk at Noon.'})).toBe(output)
    })
  })
})
