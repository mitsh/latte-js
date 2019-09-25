define(['Latte'], function (Latte) {
  describe('Test build-in function:: literal', function () {
    var tpl
    var output
    var t

    it('test simple literal', function () {
      // Simple
      tpl = '{literal} <script> function x () { var y; } function c() {alert(1)}</script> {/literal}'
      output = ' <script> function x () { var y; } function c() {alert(1)}</script> '
      t = new Latte(tpl)
      expect(t.fetch()).toBe(output)
    })

    it('test custom delimiter literal', function () {
      tpl = '{{literal}} <script> function x () { var y; }</script> {{/literal}}'
      output = ' <script> function x () { var y; }</script> '
      t = new Latte(tpl, {ldelim: '{{', rdelim: '}}'})
      expect(t.fetch()).toBe(output)
    })
  })
})
