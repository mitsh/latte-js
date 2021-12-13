define(['Latte'], function (Latte) {
  describe('Test build-in function:: capture', function () {
    var tpl
    var output
    var t

    it('test simple capture', function () {
      // Simple
      tpl = "{capture name='simple'}"
      tpl += 'captured it'
      tpl += '{/capture}'
      tpl += '{$latte.capture.simple}'
      output = 'captured it'
      t = new Latte(tpl)
      expect(t.fetch()).toBe(output)

      // Simple short hand
      tpl = "{capture 'withData'}"
      tpl += 'yo, my name is {$myName}.'
      tpl += '{/capture}'
      tpl += '{$latte.capture.withData}'
      output = 'yo, my name is Pallavi.'
      t = new Latte(tpl)
      expect(t.fetch({myName: 'Pallavi'})).toBe(output)
    })

    it('test assigned capture', function () {
      // Assigned
      tpl = "{capture name='simple' assign='simple'}"
      tpl += 'captured it'
      tpl += '{/capture}'
      tpl += '{$simple}'
      output = 'captured it'
      t = new Latte(tpl)
      expect(t.fetch()).toBe(output)
    })

    it('test default capture', function () {
      // with no name
      tpl = '{capture}'
      tpl += 'captured it for default'
      tpl += '{/capture}'
      tpl += '{$latte.capture.default}'
      output = 'captured it for default'
      t = new Latte(tpl)
      expect(t.fetch()).toBe(output)
    })

    it('test nested capture', function () {
      // with no name
      tpl = '{capture name="t2"}'
      tpl += 't2'
      tpl += '{capture name="t3"}'
      tpl += 't3 {/capture}'
      tpl += '{/capture}'
      tpl += '{$latte.capture.t2} {$latte.capture.t3}'
      output = 't2 t3 '
      t = new Latte(tpl)
      expect(t.fetch()).toBe(output)
    })

    it('test multiple capture', function () {
      // with no name
      tpl = '{foreach $items as $item}'
      tpl += '{capture name="t1"}'
      tpl += '{$item} '
      tpl += '{/capture}'
      tpl += '{$latte.capture.t1}'
      tpl += '{/foreach}'
      output = '1 2 3 '
      t = new Latte(tpl)
      expect(t.fetch({ items: [1, 2, 3] })).toBe(output)
    })
  })
})
