define(['Latte'], function (Latte) {
  describe('Test build-in function:: include', function () {
    var tpl
    var output
    var t

    it('test simple include', function () {
      Latte.prototype.getTemplate = function (name) {
        if (name === 'child.latte') {
          return 'child'
        }
      }
      tpl = 'parent:'
      tpl += '{include file="child.latte"}'

      output = 'parent:child'
      t = new Latte(tpl)
      expect(t.fetch()).toBe(output)
    })

    it('test include with data', function () {
      Latte.prototype.getTemplate = function (name) {
        if (name === 'child2.latte') {
          return 'child{$p}-{$t}'
        }
      }
      tpl = 'parent{$p}:'
      tpl += '{include file="child2.latte" p="po" t=$p}'

      output = 'parentyo:childpo-yo'
      t = new Latte(tpl)
      expect(t.fetch({p: 'yo'})).toBe(output)
    })

    it('test include cache', function () {
      // Old child.latte had 'child' text. in test 1
      // Now we modified child.latte. But new value won't be fetched
      // as old is cached and we wont use nocache.
      Latte.prototype.getTemplate = function (name) {
        if (name === 'child.latte') {
          return 'new child'
        }
      }
      tpl = 'parent:'
      tpl += '{include "child.latte"}'
      // Output should come from old value.
      output = 'parent:child'
      t = new Latte(tpl)
      expect(t.fetch()).toBe(output)
    })

    it('test include nocache', function () {
      // Old child.latte had 'child' text. in test 1
      // Now we modified child.latte. But new value will be fetched
      // as we will use now nocache.
      Latte.prototype.getTemplate = function (name) {
        if (name === 'child.latte') {
          return 'new child'
        }
      }
      tpl = 'parent:'
      tpl += '{include "child.latte" nocache}'
      // Output should come from old value.
      output = 'parent:new child'
      t = new Latte(tpl)
      expect(t.fetch()).toBe(output)
    })
  })
})
