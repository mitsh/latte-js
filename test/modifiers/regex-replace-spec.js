define(['Latte'], function (Latte) {
  describe('Test modifier:: regex_replace', function () {
    var tpl
    var output
    var t

    it('test regex_replace', function () {
      tpl = '{$articleTitle|regex_replace:"/(Infertility)/":"Intelligence"}'
      output = 'Intelligence unlikely to be passed on, experts say.'
      t = new Latte(tpl)
      expect(t.fetch({articleTitle: 'Infertility unlikely to be passed on, experts say.'})).toBe(output)
    })
  })
})
