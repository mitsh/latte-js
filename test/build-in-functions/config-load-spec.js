define(['Latte'], function (Latte) {
  describe('Test build-in function:: config_load', function () {
    var tpl
    var output
    var t

    it('test simple config_load', function () {
      // Simple

      Latte.prototype.getConfig = function (name) {
        if (name === 'example.conf') {
          return 'pageTitle = "Main Menu"\n' +
            'bodyBgColor = #000000\n' +
            '# test comment\n' +
            '[Customer]\n' +
            'pageTitle = "Customer Info"\n'
        }
      }

      tpl = "{config_load file='example.conf'}"
      tpl += '{#pageTitle#}'
      output = 'Main Menu'
      t = new Latte(tpl)
      expect(t.fetch()).toBe(output)
    })

    it('test simple config_load', function () {
      // Simple

      Latte.prototype.getConfig = function (name) {
        if (name === 'example.conf') {
          return 'pageTitle = "Main Menu"\n' +
            'bodyBgColor = #000000\n' +
            '# test comment\n' +
            '[Customer]\n' +
            'pageTitle = "Customer Info"\n'
        }
      }

      tpl = "{config_load 'example.conf' 'Customer'}"
      tpl += '{#pageTitle#}'
      output = 'Customer Info'
      t = new Latte(tpl)
      expect(t.fetch()).toBe(output)
    })
  })
})
