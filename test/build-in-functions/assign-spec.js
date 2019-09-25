define(['Latte'], function (Latte) {
  describe('Test build-in function:: assign', function () {
    it('test simple assign', function () {
      var tpl
      var output
      var t

      // Single value
      tpl = "{assign var='name' value='Chex'}"
      tpl += 'My name is {$name}.'
      output = 'My name is Chex.'
      t = new Latte(tpl)
      expect(t.fetch()).toBe(output)

      // Single value short hand
      tpl = "{assign 'human' 'girl'}"
      tpl += 'You are a good {$human}.'
      output = 'You are a good girl.'
      t = new Latte(tpl)
      expect(t.fetch()).toBe(output)
    })
  })
})
