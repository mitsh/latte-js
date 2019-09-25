define(['Latte'], function (Latte) {
  describe('Test modifier:: count_characters', function () {
    var tpl
    var output
    var t

    it('test count_characters', function () {
      tpl = '{$words|count_characters}'
      output = 19
      t = new Latte(tpl)
      expect(t.fetch({words: 'Hello World with space  '})).toBe(output)
    })

    it('test count_characters', function () {
      tpl = '{$words|count_characters:true}'
      output = 24
      t = new Latte(tpl)
      expect(t.fetch({words: 'Hello World with space  '})).toBe(output)
    })
  })
})
