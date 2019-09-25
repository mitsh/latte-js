define(['Latte'], function (Latte) {
  describe('Test build-in function:: ldelim rdelim', function () {
    var tpl
    var output
    var t

    it('test simple ldelim-rdelim', function () {
      // Simple
      tpl = '{ldelim}function{rdelim} prints left and right delimiters'
      output = '{function} prints left and right delimiters'
      t = new Latte(tpl)
      expect(t.fetch()).toBe(output)
    })

    it('test delimiter local', function () {
      tpl = '{{ldelim}}function{{rdelim}} prints {test} left and right delimiters'
      output = '{{function}} prints {test} left and right delimiters'
      t = new Latte(tpl, {ldelim: '{{', rdelim: '}}'})
      expect(t.fetch()).toBe(output)
    })

    it('test delimiter global and backword compatible', function () {
      Latte.prototype.left_delimiter = '{{{'
      Latte.prototype.right_delimiter = '}}}'
      tpl = '{{{ldelim}}}function{{{rdelim}}} prints {test} left and right delimiters'
      output = '{{{function}}} prints {test} left and right delimiters'
      t = new Latte(tpl)
      expect(t.fetch()).toBe(output)
      // Reset global by removing them
      Latte.prototype.left_delimiter = null
      Latte.prototype.right_delimiter = null
    })
  })
})
