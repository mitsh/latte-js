define(['Latte', 'text!./templates/var.latte', 'text!./output/var.latte'], function (Latte, latteTpl, outputTpl) {
  Latte.prototype.registerPlugin(
    'function',
    'sayHello',
    function (params, data) {
      var s = 'Hello '
      s += params.to
      return s
    }
  )

  describe('Test Syntax', function () {
    it('test plain text', function () {
      var t = new Latte('Hello world')
      expect(t.fetch()).toBe('Hello world')
    })

    it('test variable', function () {
      var t = new Latte('Hello {$name}, how are you?')
      expect(t.fetch({name: 'world'})).toBe('Hello world, how are you?')
    })

    it('test undefined variable', function () {
      var t = new Latte('Hello {$name}, how are you?')
      expect(t.fetch()).toBe('Hello , how are you?')
    })

    it('test array/object variable', function () {
      // Objects.
      var t = new Latte('1. Hello {$user.name.first}, how are you?')
      expect(t.fetch({user: {name: {first: 'Uma'}}})).toBe('1. Hello Uma, how are you?')

      // Arrays.
      t = new Latte("2. Hello {$user['name']['first']}, how are you?")
      expect(t.fetch({user: {name: {first: 'Uma'}}})).toBe('2. Hello Uma, how are you?')

      // Objects.
      t = new Latte('3. Hello {$user->name->first}, how are you?')
      expect(t.fetch({user: {name: {first: 'Uma'}}})).toBe('3. Hello Uma, how are you?')
    })

    it('test comment', function () {
      var t = new Latte('Testing {*comments yo *}, does it work?')
      expect(t.fetch()).toBe('Testing , does it work?')
    })

    it('test comments', function () {
      var t = new Latte('Testing {* testing *}, does it {* multiple comments *}work?')
      expect(t.fetch()).toBe('Testing , does it work?')
    })

    it('test assigning variable', function () {
      var t = new Latte("{$foo = 'bar'} print foo {$foo}")
      expect(t.fetch()).toBe(' print foo bar')
    })

    it('test double quotes strings', function () {
      var t = new Latte('{$foo="bar"} {$bar = "value of foo is \'$foo\'"} {$bar}')
      expect(t.fetch()).toBe("  value of foo is 'bar'")

      // back tick test.
      t = new Latte('{$foo = "`$person.name.first` has `$person[\'favorite gadget\']`"} {$foo}')
      expect(t.fetch({person: {name: {first: 'Chex'}, 'favorite gadget': 'ipad'}})).toBe(' Chex has ipad')
    })

    it('test complex template', function () {
      // Insert complex statements in the template and test them.
      var t = new Latte(latteTpl)
      expect(t.fetch(getData())).toBe(outputTpl)
    })
  })
})
