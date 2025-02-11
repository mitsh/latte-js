/*!
 * LatteJS template engine (v4.4.0)
 * https://github.com/pfaciana/latte-js
 *
 * https://opensource.org/licenses/MIT
 *
 * Date: 2021-12-13T04:11Z
 */
(function (factory)
{
  'use strict'

  if (typeof module === 'object' && module && typeof module.exports === 'object')
  {
    // Node.js like environment. Export Latte
    module.exports = factory()
  }
  else
  {
    if (typeof window === 'object' && window.document)
    {
      // Assign to browser window if window is present.
      window.Latte = factory()
    }

    if (typeof define === 'function' && define.amd)
    {
      // Require js is present? Lets define module.
      define('Latte', [], factory)
    }
  }

  // Pass this if window is not defined yet
})(function ()
{
  'use strict'

  


  function objectMerge(ob1, ob2 /* , ... */)
  {
    for (var i = 1; i < arguments.length; ++i)
    {
      for (var name in arguments[i])
      {
        ob1[name] = arguments[i][name]
      }
    }
    return ob1
  }


  function evalString(s)
  {
    return s.replace(/\\t/, '\t').replace(/\\n/, '\n').replace(/\\(['"\\])/g, '$1')
  }


  // Trim all quotes.
  function trimAllQuotes(s)
  {
    return evalString(s.replace(/^['"](.*)['"]$/, '$1')).replace(/^\s+|\s+$/g, '')
  }


  // Find in array.
  function findInArray(arr, val)
  {
    if (Array.prototype.indexOf)
    {
      return arr.indexOf(val)
    }
    for (var i = 0; i < arr.length; ++i)
    {
      if (arr[i] === val)
      {
        return i
      }
    }
    return -1
  }
// Parser object. Plain object which just does parsing.
  var LatteParser = {

    // Cached templates.
    files: {},

    // Default left delimiter.
    ldelim: '{',

    // Default right delimiter.
    rdelim: '}',

    // Default auto literal value.
    autoLiteral: true,

    // Store runtime generated runtime plugins.
    runTimePlugins: {},

    // Plugins function to use for parsing.
    // They are added later from LatteJS, so we need a copy here.
    plugins: {},

    // Listing down all pre filters, before processing a template.
    preFilters: [],

    outerBlocks: {},

    blocks: {},

    getTemplate: function (name)
    {
      throw new Error('no getTemplate function defined.')
    },

    getConfig: function ()
    {
      throw new Error('no getConfig function defined.')
    },

    clear: function ()
    {
      // Clean up config, specific for this parsing.
      this.runTimePlugins = {}
      this.preFilters     = []
      this.autoLiteral    = true
      this.plugins        = {}
      this.ldelim         = '{'
      this.rdelim         = '}'
      this.blocks         = {}
      this.outerBlocks    = {}
    },

    getTree: function (template)
    {
      var tree
      // Remove comments, we never want them.
      template = this.removeComments(template)
      // Make use of linux new comments. It will be consistent across all templates.
      template = template.replace(/\r\n/g, '\n')
      // Apply global pre filters to the template. These are global filters,
      // so we take it from global object, rather than taking it as args to
      // "new Latte()" object.
      template = this.applyFilters(this.preFilters, template)

      // Parse the template and get the output.
      tree = this.parse(template)

      if (tree.usedExtends > 0)
      {
        var tmpTree = []
        // Now in the tree remove anything other than block after extends
        for (var i = 0; i < tree.length; i++)
        {
          if (i < tree.usedExtends)
          {
            tmpTree.push(tree[i])
          }
          else if (tree[i].type === 'build-in' && (tree[i].name === 'block'))
          {
            tmpTree.push(tree[i])
          }
        }
        tree = tmpTree
      }

      return tree
    },

    // Parse the template and return the data.
    getParsed: function (template)
    {
      var tree = this.getTree(template)
      var runTimePlugins

      // Copy so far runtime plugins were generated.
      runTimePlugins = this.runTimePlugins

      var blocks = this.blocks

      var outerBlocks = this.outerBlocks

      this.clear()
      // Nope, we do not want to clear the cache.
      // Refactor to maintain cache. Until that keep commented.
      // this.files = {};
      return {
        tree          : tree,
        runTimePlugins: runTimePlugins,
        blocks        : blocks,
        outerBlocks   : outerBlocks
      }
    },

    // Parse the template and generate tree.
    parse: function (tpl)
    {
      var tree        = []
      var openTag
      var tag
      var name
      var paramStr
      var node
      var closeTag
      var usedExtends = 0

      for (openTag = this.findTag('', tpl); openTag; openTag = this.findTag('', tpl))
      {
        if (openTag.index)
        {
          tree = tree.concat(this.parseText(tpl.slice(0, openTag.index)))
        }
        tpl = tpl.slice((openTag.index + openTag[0].length))
        tag = openTag[1].match(/^\s*(\w+)(.*)$/)
        if (tag)
        {
          // Function?!
          name     = tag[1]
          paramStr = (tag.length > 2) ? tag[2].replace(/^\s+|\s+$/g, '') : ''
          if (name in this.buildInFunctions)
          {
            var buildIn = this.buildInFunctions[name]
            var params  = ('parseParams' in buildIn ? buildIn.parseParams.bind(this) : this.parseParams.bind(this))(paramStr)
            if (buildIn.type === 'block')
            {
              // Remove new line after block open tag (like in Latte)
              tpl              = tpl.replace(/^\n/, '')
              closeTag         = this.findCloseTag('/' + name, name + ' +[^}]*', tpl)
              var functionTree = buildIn.parse.call(this, params, tpl.slice(0, closeTag.index))
              if (functionTree)
              {
                // Some functions return false like {php} and {function}
                tree = tree.concat(functionTree)
              }
              tpl = tpl.slice(closeTag.index + closeTag[0].length)
            }
            else
            {
              if (name === 'extends')
              {
                // Anything before {extends} should be stripped.
                tree.splice(0, tree.length)
              }
              tree = tree.concat(buildIn.parse.call(this, params))
              if (name === 'extends')
              {
                usedExtends = tree.length
              }
            }
            tpl = tpl.replace(/^\n/, '')
          }
          else if (name in this.runTimePlugins)
          {
            // Possible it is function name. give it a priority before plugin.
            tree = tree.concat(this.parsePluginFunc(name, this.parseParams(paramStr)))
          }
          else if (name in this.plugins)
          {
            var plugin = this.plugins[name]
            if (plugin.type === 'block')
            {
              closeTag = this.findCloseTag('/' + name, name + ' +[^}]*', tpl)
              tree     = tree.concat(this.parsePluginBlock(name, this.parseParams(paramStr), tpl.slice(0, closeTag.index)))
              tpl      = tpl.slice(closeTag.index + closeTag[0].length)
            }
            else if (plugin.type === 'function')
            {
              tree = tree.concat(this.parsePluginFunc(name, this.parseParams(paramStr)))
            }
            if (name === 'append' || name === 'assign' || name === 'capture' || name === 'eval' || name === 'include')
            {
              tpl = tpl.replace(/^\n/, '')
            }
          }
          else
          {
            // Variable.
            node = this.buildInFunctions.expression.parse.call(this, openTag[1])
            tree.push(node)
          }
        }
        else
        {
          // Variable.
          node = this.buildInFunctions.expression.parse.call(this, openTag[1])
          if (node.expression.type === 'build-in' && node.expression.name === 'operator' && node.expression.op === '=')
          {
            tpl = tpl.replace(/^\n/, '')
          }
          tree.push(node)
        }
      }
      if (tpl)
      {
        tree = tree.concat(this.parseText(tpl))
      }
      tree.usedExtends = usedExtends
      return tree
    },

    // Find a first {tag} in the string.
    findTag: function (expression, s)
    {
      var openCount        = 0
      var offset           = 0
      var i
      var ldelim           = this.ldelim
      var rdelim           = this.rdelim
      var skipInWhitespace = this.autoLiteral
      var expressionAny    = /^\s*(.+)\s*$/i
      var expressionTag    = expression ? new RegExp('^\\s*(' + expression + ')\\s*$', 'i') : expressionAny
      var sTag
      var found

      for (i = 0; i < s.length; ++i)
      {
        if (s.substr(i, ldelim.length) === ldelim)
        {
          if (skipInWhitespace && (i + 1) < s.length && s.substr((i + 1), 1).match(/\s/))
          {
            continue
          }
          if (!openCount)
          {
            s = s.slice(i)
            offset += parseInt(i)
            i = 0
          }
          ++openCount
        }
        else if (s.substr(i, rdelim.length) === rdelim)
        {
          if (skipInWhitespace && (i - 1) >= 0 && s.substr((i - 1), 1).match(/\s/))
          {
            continue
          }
          if (!--openCount)
          {
            sTag  = s.slice(ldelim.length, i).replace(/[\r\n]/g, ' ')
            found = sTag.match(expressionTag)
            if (found)
            {
              found.index = offset
              found[0]    = s.slice(0, (i + rdelim.length))
              return found
            }
          }
          if (openCount < 0)
          {
            // Ignore any number of unmatched right delimiters.
            openCount = 0
          }
        }
      }
      return null
    },

    findElseTag: function (reOpen, reClose, reElse, s)
    {
      var offset = 0

      for (var elseTag = this.findTag(reElse, s); elseTag; elseTag = this.findTag(reElse, s))
      {
        var openTag = this.findTag(reOpen, s)
        if (!openTag || openTag.index > elseTag.index)
        {
          elseTag.index += offset
          return elseTag
        }
        else
        {
          s            = s.slice(openTag.index + openTag[0].length)
          offset += openTag.index + openTag[0].length
          var closeTag = this.findCloseTag(reClose, reOpen, s)
          s            = s.slice(closeTag.index + closeTag[0].length)
          offset += closeTag.index + closeTag[0].length
        }
      }
      return null
    },

    // Find closing tag which matches. expressionClose.
    findCloseTag: function (expressionClose, expressionOpen, s)
    {
      var sInner    = ''
      var closeTag  = null
      var openTag   = null
      var findIndex = 0

      do
      {
        if (closeTag)
        {
          findIndex += closeTag[0].length
        }
        closeTag = this.findTag(expressionClose, s)
        if (!closeTag)
        {
          throw new Error('Unclosed ' + this.ldelim + expressionOpen + this.rdelim)
        }
        sInner += s.slice(0, closeTag.index)
        findIndex += closeTag.index
        s       = s.slice((closeTag.index + closeTag[0].length))
        openTag = this.findTag(expressionOpen, sInner)
        if (openTag)
        {
          sInner = sInner.slice((openTag.index + openTag[0].length))
        }
      }
      while (openTag)

      closeTag.index = findIndex
      return closeTag
    },

    bundleOp: function (i, tree, precedence)
    {
      var op = tree[i]
      if (op.name === 'operator' && op.precedence === precedence && !op.params.__parsed)
      {
        if (op.optype === 'binary')
        {
          op.params.__parsed = [tree[(i - 1)], tree[(i + 1)]]
          tree.splice((i - 1), 3, op)
          return [true, tree]
        }
        else if (op.optype === 'post-unary')
        {
          op.params.__parsed = [tree[(i - 1)]]
          tree.splice((i - 1), 2, op)
          return [true, tree]
        }

        op.params.__parsed = [tree[(i + 1)]]
        tree.splice(i, 2, op)
      }
      return [false, tree]
    },

    composeExpression: function (tree)
    {
      var i = 0
      var data

      for (i = 0; i < tree.length; ++i)
      {
        if (tree[i] instanceof Array)
        {
          tree[i] = this.composeExpression(tree[i])
        }
      }

      for (var precedence = 1; precedence < 14; ++precedence)
      {
        if (precedence === 2 || precedence === 10)
        {
          for (i = tree.length; i > 0; --i)
          {
            data = this.bundleOp(i - 1, tree, precedence)
            i -= data[0]
            tree = data[1]
          }
        }
        else
        {
          for (i = 0; i < tree.length; ++i)
          {
            data = this.bundleOp(i, tree, precedence)
            i -= data[0]
            tree = data[1]
          }
        }
      }
      // Only one node should be left.
      return tree[0]
    },

    getMatchingToken: function (s)
    {
      for (var i = 0; i < this.tokens.length; ++i)
      {
        if (s.match(this.tokens[i].regex))
        {
          return i
        }
      }
      return false
    },

    parseVar: function (s, name, token)
    {
      var expression = /^(?:\.|\s*->\s*|\[\s*)/
      var op
      var data       = {value: '', tree: []}
      var lookUpData
      var value      = ''
      var parts      = [
        {
          type: 'text',
          data: name.replace(/^(\w+)@(key|index|iteration|counter|odd|even|first|last|empty|show|total)/gi, '$1__$2')
        }
      ]
      var rootName   = token

      if (!token)
      {
        token    = name
        rootName = token
      }
      for (op = s.match(expression); op; op = s.match(expression))
      {
        token += op[0]
        s = s.slice(op[0].length)
        if (op[0].match(/\[/))
        {
          data = this.parseExpression(s, true)
          if (data.tree)
          {
            token += data.value
            parts.push(data.tree)
            s = s.slice(data.value.length)
          }
          var closeOp = s.match(/\s*\]/)
          if (closeOp)
          {
            token += closeOp[0]
            s = s.slice(closeOp[0].length)
          }
        }
        else
        {
          var parseMod            = this.parseModifiersStop
          this.parseModifiersStop = true
          lookUpData              = this.lookUp(s, '')
          if (lookUpData)
          {
            data.tree  = [].concat(data.tree, lookUpData.tree)
            data.value = lookUpData.value
            token += lookUpData.value

            if (lookUpData.ret)
            {
              var part = data.tree[(data.tree.length - 1)]
              if (part.type === 'plugin' && part.name === '__func')
              {
                part.hasOwner = true
              }
              parts.push(part)
              s = s.slice(data.value.length)
            }
            else
            {
              data = false
            }
          }
          this.parseModifiersStop = parseMod
        }
        if (!data)
        {
          parts.push({type: 'text', data: ''})
        }
      }
      value = token.substr(rootName.length)

      return {s: s, token: token, tree: [{type: 'var', parts: parts}], value: value}
    },

    parseFunc: function (name, params, tree)
    {
      params.__parsed.name = this.parseText(name, [])[0]
      tree.push({
        type  : 'plugin',
        name  : '__func',
        params: params
      })
      return tree
    },

    parseOperator: function (op, type, precedence)
    {
      return [
        {
          type      : 'build-in',
          name      : 'operator',
          op        : op,
          optype    : type,
          precedence: precedence,
          params    : {}
        }
      ]
    },

    parsePluginBlock: function (name, params, content)
    {
      return [
        {
          type   : 'plugin',
          name   : name,
          params : params,
          subTree: this.parse(content, [])
        }
      ]
    },

    parsePluginFunc: function (name, params)
    {
      return [
        {
          type  : 'plugin',
          name  : name,
          params: params
        }
      ]
    },

    parseModifiers: function (s, tree)
    {
      var modifier = s.match(/^\|(\w+)/)
      var value    = ''
      var funcName
      if (this.parseModifiersStop)
      {
        return
      }
      if (!modifier)
      {
        return
      }
      value += modifier[0]

      funcName = ((modifier[1] === 'default') ? 'defaultValue' : modifier[1])
      s        = s.slice(modifier[0].length).replace(/^\s+/, '')

      this.parseModifiersStop = true
      var params              = []
      for (var colon = s.match(/^\s*:\s*/); colon; colon = s.match(/^\s*:\s*/))
      {
        value += s.slice(0, colon[0].length)
        s              = s.slice(colon[0].length)
        var lookUpData = this.lookUp(s, '')
        if (lookUpData.ret)
        {
          value += lookUpData.value
          params.push(lookUpData.tree[0])
          s = s.slice(lookUpData.value.length)
        }
        else
        {
          params.push(this.parseText(''))
        }
      }
      this.parseModifiersStop = false

      // Modifiers have the highest priority.
      params.unshift(tree.pop())
      var funcData = this.parseFunc(funcName, {__parsed: params}, [])
      tree.push(funcData[0])

      // Modifiers can be combined.
      var selfData = this.parseModifiers(s, tree)
      // If data is returned merge the current tree and tree we got.
      if (selfData)
      {
        tree = tree.concat(selfData.tree)
      }
      return {value: value, tree: tree}
    },

    parseParams: function (paramsStr, regexDelim, regexName)
    {
      var s      = paramsStr.replace(/\n/g, ' ').replace(/^\s+|\s+$/g, '')
      var params = []
      paramsStr  = ''

      params.__parsed = []

      if (!s)
      {
        return params
      }

      if (!regexDelim)
      {
        regexDelim = /^\s+/
        regexName  = /^(\w+)\s*=\s*/
      }

      while (s)
      {
        var name = null
        if (regexName)
        {
          var foundName = s.match(regexName)
          if (foundName)
          {
            var firstChar = foundName[1].charAt(0).match(/^\d+/)
            if (foundName[1] === 'true' || foundName[1] === 'false' || foundName[1] === 'null')
            {
              firstChar = true
            }

            if (!firstChar)
            {
              name = trimAllQuotes(foundName[1])
              paramsStr += s.slice(0, foundName[0].length)
              s    = s.slice(foundName[0].length)
            }
          }
        }

        var param = this.parseExpression(s)
        if (!param)
        {
          break
        }

        if (name)
        {
          params[name]          = param.value
          params.__parsed[name] = param.tree
        }
        else
        {
          params.push(param.value)
          params.__parsed.push(param.tree)
        }

        paramsStr += s.slice(0, param.value.length)
        s = s.slice(param.value.length)

        var foundDelim = s.match(regexDelim)
        if (foundDelim)
        {
          paramsStr += s.slice(0, foundDelim[0].length)
          s = s.slice(foundDelim[0].length)
        }
        else
        {
          break
        }
      }
      params.toString = function ()
      {
        return paramsStr
      }
      return params
    },

    lookUp: function (s, value)
    {
      var tree = []
      var tag

      if (!s)
      {
        return false
      }
      if (s.substr(0, this.ldelim.length) === this.ldelim)
      {
        tag = this.findTag('', s)
        value += tag[0]
        if (tag)
        {
          var t       = this.parse(tag[0])
          tree        = tree.concat(t)
          var modData = this.parseModifiers(s.slice(value.length), tree)
          if (modData)
          {
            return {ret: true, tree: modData.tree, value: modData.value}
          }
          return {ret: true, tree: tree, value: value}
        }
      }

      var anyMatchingToken = this.getMatchingToken(s)
      if (anyMatchingToken !== false)
      {
        value += RegExp.lastMatch
        var newTree = this.tokens[anyMatchingToken].parse.call(this, s.slice(RegExp.lastMatch.length), {
          tree : tree,
          token: RegExp.lastMatch
        })

        if (typeof newTree === 'string')
        {
          if (newTree === 'parenStart')
          {
            var blankTree = []
            tree.push(blankTree)
            blankTree.parent = tree
            tree             = blankTree
          }
          else if (newTree === 'parenEnd')
          {
            if (tree.parent)
            {
              tree = tree.parent
            }
          }
        }
        else if ((!!newTree) && (newTree.constructor === Object))
        {
          value += newTree.value
          newTree = newTree.tree
          tree    = tree.concat(newTree)
        }
        else
        {
          tree = tree.concat(newTree)
        }
        return {ret: true, tree: tree, value: value}
      }
      return {ret: false, tree: tree, value: value}
    },

    // Parse expression.
    parseExpression: function (s)
    {
      var tree  = []
      var value = ''
      var data

      // TODO Refactor, to get this removed.
      this.lastTreeInExpression = tree
      while (true)
      {
        data = this.lookUp(s.slice(value.length), value)
        if (data)
        {
          tree                      = tree.concat(data.tree)
          value                     = data.value
          this.lastTreeInExpression = tree
          if (!data.ret)
          {
            break
          }
        }
        else
        {
          break
        }
      }
      if (tree.length)
      {
        tree = this.composeExpression(tree)
      }

      return {tree: tree, value: value}
    },

    // Parse boolean.
    parseBool: function (boolVal)
    {
      return [{type: 'boolean', data: boolVal}]
    },

    // Parse text.
    parseText: function (text)
    {
      var tree = []

      if (this.parseEmbeddedVars)
      {
        var re = /([$][\w@]+)|`([^`]*)`/
        for (var found = re.exec(text); found; found = re.exec(text))
        {
          tree.push({type: 'text', data: text.slice(0, found.index)})
          var d = this.parseExpression(found[1] ? found[1] : found[2])
          tree.push(d.tree)
          text = text.slice(found.index + found[0].length)
        }
      }
      tree.push({type: 'text', data: text})
      return tree
    },

    loadTemplate: function (name, nocache)
    {
      var tree = []
      if (nocache || !(name in this.files))
      {
        var tpl = this.getTemplate(name)
        if (typeof tpl !== 'string')
        {
          throw new Error('No template for ' + name)
        }
        tree             = this.getTree(tpl)
        this.files[name] = tree
      }
      else
      {
        tree = this.files[name]
      }
      return tree
    },

    // Remove comments. We do not want to parse them anyway.
    removeComments: function (tpl)
    {
      var ldelim = new RegExp(this.ldelim + '\\*')
      var rdelim = new RegExp('\\*' + this.rdelim)
      var newTpl = ''

      for (var openTag = tpl.match(ldelim); openTag; openTag = tpl.match(ldelim))
      {
        newTpl += tpl.slice(0, openTag.index)
        tpl          = tpl.slice(openTag.index + openTag[0].length)
        var closeTag = tpl.match(rdelim)
        if (!closeTag)
        {
          throw new Error('Unclosed ' + ldelim + '*')
        }
        tpl = tpl.slice(closeTag.index + closeTag[0].length)
      }
      return newTpl + tpl
    },

    // TODO:: Remove this duplicate function.
    // Apply the filters to template.
    applyFilters: function (filters)
    {
      var args = []

      for (var j = 1; j < arguments.length; j++)
      {
        args[j - 1] = arguments[j]
      }

      for (var i = 0; i < filters.length; ++i)
      {
        args[0] = filters[i].apply(this, args)
      }

      return args[0]
    },

    // Tokens to indentify data inside template.
    tokens          : [
      {
        // Token for variable.
        'regex': /^\$([\w@]+)/,
        parse  : function (s, data)
        {
          var dataVar = this.parseVar(s, RegExp.$1, RegExp.$1)
          var dataMod = this.parseModifiers(dataVar.s, dataVar.tree)
          if (dataMod)
          {
            dataVar.value += dataMod.value
            return dataMod
          }
          return dataVar
        }
      },
      {
        // Token for boolean.
        'regex': /^(true|false)/i,
        parse  : function (s, data)
        {
          if (data.token.match(/true/i))
          {
            return this.parseBool(true)
          }
          return this.parseBool(false)
        }
      },
      {
        // Token for to grab data inside single quotes.
        'regex': /^'([^'\\]*(?:\\.[^'\\]*)*)'/,
        parse  : function (s, data)
        {
          // Data inside single quote is like string, we do not parse it.
          var regexStr = evalString(RegExp.$1)
          var textTree = this.parseText(regexStr)
          var dataMod  = this.parseModifiers(s, textTree)
          if (dataMod)
          {
            return dataMod
          }
          return textTree
        }
      },
      {
        // Token for to grab data inside double quotes.
        // We parse data inside double quotes.
        'regex': /^"([^"\\]*(?:\\.[^"\\]*)*)"/,
        parse  : function (s, data)
        {
          var v     = evalString(RegExp.$1)
          var isVar = v.match(this.tokens[0]['regex'])
          if (isVar)
          {
            var newData = this.parseVar(v, isVar[1], isVar[0])
            if (newData.token.length === v.length)
            {
              return [newData.tree[0]]
            }
          }
          this.parseEmbeddedVars = true
          var tree               = []
          tree.push({
            type  : 'plugin',
            name  : '__quoted',
            params: {__parsed: this.parse(v, [])}
          })
          this.parseEmbeddedVars = false
          var modData            = this.parseModifiers(s, tree)
          if (modData)
          {
            return modData
          }
          return tree
        }
      },
      {
        // Token for func().
        'regex': /^(\w+)\s*[(]([)]?)/,
        parse  : function (s, data)
        {
          var funcName = RegExp.$1
          var noArgs   = RegExp.$2
          var params   = this.parseParams(((noArgs) ? '' : s), /^\s*,\s*/)
          var tree     = this.parseFunc(funcName, params, [])
          // var value += params.toString();
          var dataMod  = this.parseModifiers(s.slice(params.toString().length), tree)
          if (dataMod)
          {
            return dataMod
          }
          return tree
        }
      },
      {
        // Token for expression in parentheses.
        'regex': /^\s*\(\s*/,
        parse  : function (s, data)
        {
          // We do not know way of manupilating the tree here.
          return 'parenStart'
        }
      },
      {
        // Token for end of func() or (expr).
        'regex': /^\s*\)\s*/,
        parse  : function (s, data)
        {
          // We do not know way of manupilating the tree here.
          return 'parenEnd'
        }
      },
      {
        // Token for increment operator.
        'regex': /^\s*(\+\+|--)\s*/,
        parse  : function (s, data)
        {
          if (this.lastTreeInExpression.length && this.lastTreeInExpression[this.lastTreeInExpression.length - 1].type === 'var')
          {
            return this.parseOperator(RegExp.$1, 'post-unary', 1)
          }
          else
          {
            return this.parseOperator(RegExp.$1, 'pre-unary', 1)
          }
        }
      },
      {
        // Regex for strict equal, strict not equal, equal and not equal operator.
        'regex': /^\s*(===|!==|==|!=)\s*/,
        parse  : function (s, data)
        {
          return this.parseOperator(RegExp.$1, 'binary', 6)
        }
      },
      {
        // Regex for equal, not equal operator.
        'regex': /^\s+(eq|ne|neq)\s+/i,
        parse  : function (s, data)
        {
          var op = RegExp.$1.replace(/ne(q)?/, '!=').replace(/eq/, '==')
          return this.parseOperator(op, 'binary', 6)
        }
      },
      {
        // Regex for NOT operator.
        'regex': /^\s*!\s*/,
        parse  : function (s, data)
        {
          return this.parseOperator('!', 'pre-unary', 2)
        }
      },
      {
        // Regex for NOT operator.
        'regex': /^\s+not\s+/i,
        parse  : function (s, data)
        {
          return this.parseOperator('!', 'pre-unary', 2)
        }
      },
      {
        // Regex for =, +=, *=, /=, %= operator.
        'regex': /^\s*(=|\+=|-=|\*=|\/=|%=)\s*/,
        parse  : function (s, data)
        {
          return this.parseOperator(RegExp.$1, 'binary', 10)
        }
      },
      {
        // Regex for *, /, % binary operator.
        'regex': /^\s*(\*|\/|%)\s*/,
        parse  : function (s, data)
        {
          return this.parseOperator(RegExp.$1, 'binary', 3)
        }
      },
      {
        // Regex for mod operator.
        'regex': /^\s+mod\s+/i,
        parse  : function (s, data)
        {
          return this.parseOperator('%', 'binary', 3)
        }
      },
      {
        // Regex for +/- operator.
        'regex': /^\s*(\+|-)\s*/,
        parse  : function (s, data)
        {
          if (!this.lastTreeInExpression.length || this.lastTreeInExpression[this.lastTreeInExpression.length - 1].name === 'operator')
          {
            return this.parseOperator(RegExp.$1, 'pre-unary', 4)
          }
          else
          {
            return this.parseOperator(RegExp.$1, 'binary', 4)
          }
        }
      },
      {
        // Regex for less than, greater than, less than equal, reather than equal.
        'regex': /^\s*(<=|>=|<>|<|>)\s*/,
        parse  : function (s, data)
        {
          return this.parseOperator(RegExp.$1.replace(/<>/, '!='), 'binary', 5)
        }
      },
      {
        // Regex for less than, greater than, less than equal, reather than equal.
        'regex': /^\s+(lt|lte|le|gt|gte|ge)\s+/i,
        parse  : function (s, data)
        {
          var op = RegExp.$1.replace(/l(t)?e/, '<').replace(/lt/, '<=').replace(/g(t)?e/, '>').replace(/gt/, '>=')
          return this.parseOperator(op, 'binary', 5)
        }
      },
      {
        // Regex for short hand "is (not) div by".
        'regex': /^\s+(is\s+(not\s+)?div\s+by)\s+/i,
        parse  : function (s, data)
        {
          return this.parseOperator(RegExp.$2 ? 'div_not' : 'div', 'binary', 7)
        }
      },
      {
        // Regex for short hand "is (not) even/odd by".
        'regex': /^\s+is\s+(not\s+)?(even|odd)(\s+by\s+)?\s*/i,
        parse  : function (s, data)
        {
          var op   = RegExp.$1 ? ((RegExp.$2 === 'odd') ? 'even' : 'even_not') : ((RegExp.$2 === 'odd') ? 'even_not' : 'even')
          var tree = this.parseOperator(op, 'binary', 7)
          if (!RegExp.$3)
          {
            return tree.concat(this.parseText('1', tree))
          }
          return tree
        }
      },
      {
        // Regex for AND operator.
        'regex': /^\s*(&&)\s*/,
        parse  : function (s, data)
        {
          return this.parseOperator(RegExp.$1, 'binary', 8)
        }
      },
      {
        // Regex for OR operator.
        'regex': /^\s*(\|\|)\s*/,
        parse  : function (s, data)
        {
          return this.parseOperator(RegExp.$1, 'binary', 9)
        }
      },
      {
        // Regex for AND operator.
        'regex': /^\s+and\s+/i,
        parse  : function (s, data)
        {
          return this.parseOperator('&&', 'binary', 11)
        }
      },
      {
        // Regex for XOR operator.
        'regex': /^\s+xor\s+/i,
        parse  : function (s, data)
        {
          return this.parseOperator('xor', 'binary', 12)
        }
      },
      {
        // Regex for OR operator.
        'regex': /^\s+or\s+/i,
        parse  : function (s, data)
        {
          return this.parseOperator('||', 'binary', 13)
        }
      },
      {
        // Regex for config variable.
        'regex': /^#(\w+)#/,
        parse  : function (s, data)
        {
          var dataVar = this.parseVar('.config.' + RegExp.$1, 'latte', '$latte')
          var dataMod = this.parseModifiers(dataVar.s, dataVar.tree)
          if (dataMod)
          {
            dataVar.value += dataMod.value
            return dataMod
          }
          return dataVar
        }
      },
      {
        // Regex for array.
        'regex': /^\s*\[\s*/,
        parse  : function (s, data)
        {
          var params = this.parseParams(s, /^\s*,\s*/, /^('[^'\\]*(?:\\.[^'\\]*)*'|"[^"\\]*(?:\\.[^"\\]*)*"|\w+)\s*=>\s*/)
          var tree   = this.parsePluginFunc('__array', params)
          var value  = params.toString()
          var paren  = s.slice(params.toString().length).match(/\s*\]/)
          if (paren)
          {
            value += paren[0]
          }
          return {tree: tree, value: value}
        }
      },
      {
        // Regex for number.
        'regex': /^[\d.]+/,
        parse  : function (s, data)
        {
          if (data.token.indexOf('.') > -1)
          {
            data.token = parseFloat(data.token)
          }
          else
          {
            data.token = parseInt(data.token, 10)
          }
          var textTree = this.parseText(data.token)
          var dataMod  = this.parseModifiers(s, textTree)
          if (dataMod)
          {
            return dataMod
          }
          return textTree
        }
      },
      {
        // Regex for static.
        'regex': /^\w+/,
        parse  : function (s, data)
        {
          var textTree = this.parseText(data.token)
          var dataMod  = this.parseModifiers(s, textTree)
          if (dataMod)
          {
            return dataMod
          }
          return textTree
        }
      }
    ],
    buildInFunctions: {
      expression: {
        parse: function (s)
        {
          var data = this.parseExpression(s)

          return {
            type: 'build-in',
            name: 'expression',
            // Expression expanded inside this sub tree.
            expression: data.tree,
            params    : this.parseParams(s.slice(data.value.length).replace(/^\s+|\s+$/g, ''))
          }
        }
      },
      section   : {
        type : 'block',
        parse: function (params, content)
        {
          var subTree     = []
          var subTreeElse = []

          var findElse = this.findElseTag('section [^}]+', '/section', 'sectionelse', content)
          if (findElse)
          {
            subTree     = this.parse(content.slice(0, findElse.index))
            subTreeElse = this.parse(content.slice(findElse.index + findElse[0].length).replace(/^[\r\n]/, ''))
          }
          else
          {
            subTree = this.parse(content)
          }
          return {
            type       : 'build-in',
            name       : 'section',
            params     : params,
            subTree    : subTree,
            subTreeElse: subTreeElse
          }
        }
      },

      setfilter: {
        type       : 'block',
        parseParams: function (paramStr)
        {
          return [this.parseExpression('__t()|' + paramStr).tree]
        },
        parse      : function (params, content)
        {
          return {
            type   : 'build-in',
            name   : 'setfilter',
            params : params,
            subTree: this.parse(content)
          }
        }
      },

      config_load: {
        'type': 'function',
        parse : function (params)
        {
          var file    = trimAllQuotes(params.file ? params.file : params[0])
          var content = this.getConfig(file)
          var section = trimAllQuotes(params.section ? params.section : (params[1] ? params[1] : ''))

          return {
            type   : 'build-in',
            name   : 'config_load',
            params : params,
            content: content,
            section: section
          }
        }
      },

      append: {
        'type': 'function',
        parse : function (params)
        {
          return {
            type  : 'build-in',
            name  : 'append',
            params: params
          }
        }
      },

      assign: {
        'type': 'function',
        parse : function (params)
        {
          return {
            type  : 'build-in',
            name  : 'assign',
            params: params
          }
        }
      },

      'break': {
        'type': 'function',
        parse : function (params)
        {
          return {
            type  : 'build-in',
            name  : 'break',
            params: params
          }
        }
      },

      'continue': {
        'type': 'function',
        parse : function (params)
        {
          return {
            type  : 'build-in',
            name  : 'continue',
            params: params
          }
        }
      },

      'call': {
        'type': 'function',
        parse : function (params)
        {
          return {
            type  : 'build-in',
            name  : 'call',
            params: params
          }
        }
      },

      capture: {
        'type': 'block',
        parse : function (params, content)
        {
          var tree = this.parse(content)
          return {
            type   : 'build-in',
            name   : 'capture',
            params : params,
            subTree: tree
          }
        }
      },

      nocache: {
        'type': 'block',
        parse : function (params, content)
        {
          var tree = this.parse(content)
          return {
            type   : 'build-in',
            name   : 'nocache',
            params : params,
            subTree: tree
          }
        }
      },

      'eval': {
        'type': 'function',
        parse : function (params)
        {
          return this.parsePluginFunc('eval', params)
        }
      },

      include: {
        'type': 'function',
        parse : function (params)
        {
          var file    = trimAllQuotes(params.file ? params.file : params[0])
          var nocache = (findInArray(params, 'nocache') >= 0)
          var tree    = this.loadTemplate(file, nocache)

          return {
            type   : 'build-in',
            name   : 'include',
            params : params,
            subTree: tree
          }
        }
      },

      'for': {
        type       : 'block',
        parseParams: function (paramStr)
        {
          var res = paramStr.match(/^\s*\$(\w+)\s*=\s*([^\s]+)\s*to\s*([^\s]+)\s*(?:step\s*([^\s]+))?\s*(.*)$/)
          if (!res)
          {
            throw new Error('Invalid {for} parameters: ' + paramStr)
          }
          return this.parseParams("varName='" + res[1] + "' from=" + res[2] + ' to=' + res[3] + ' step=' + (res[4] ? res[4] : '1') + ' ' + res[5])
        },
        parse      : function (params, content)
        {
          var subTree     = []
          var subTreeElse = []

          var findElse = this.findElseTag('for\\s[^}]+', '/for', 'forelse', content)
          if (findElse)
          {
            subTree     = this.parse(content.slice(0, findElse.index))
            subTreeElse = this.parse(content.slice(findElse.index + findElse[0].length))
          }
          else
          {
            subTree = this.parse(content)
          }
          return {
            type       : 'build-in',
            name       : 'for',
            params     : params,
            subTree    : subTree,
            subTreeElse: subTreeElse
          }
        }
      },

      'if': {
        type : 'block',
        parse: function (params, content)
        {
          var subTreeIf   = []
          var subTreeElse = []
          var findElse    = this.findElseTag('if\\s+[^}]+', '/if', 'else[^}]*', content)

          if (findElse)
          {
            subTreeIf      = this.parse(content.slice(0, findElse.index))
            content        = content.slice(findElse.index + findElse[0].length)
            var findElseIf = findElse[1].match(/^else\s*if(.*)/)
            if (findElseIf)
            {
              subTreeElse = this.buildInFunctions['if'].parse.call(this, this.parseParams(findElseIf[1]), content.replace(/^\n/, ''))
            }
            else
            {
              subTreeElse = this.parse(content.replace(/^\n/, ''))
            }
          }
          else
          {
            subTreeIf = this.parse(content)
          }
          return [
            {
              type       : 'build-in',
              name       : 'if',
              params     : params,
              subTreeIf  : subTreeIf,
              subTreeElse: subTreeElse
            }
          ]
        }
      },

      'ifempty': {
        type : 'block',
        parse: function (params, content)
        {
          var subTreeIf   = []
          var subTreeElse = []
          var findElse    = this.findElseTag('ifempty\\s+[^}]+', '/ifempty', 'else[^}]*', content)

          if (findElse)
          {
            subTreeIf      = this.parse(content.slice(0, findElse.index))
            content        = content.slice(findElse.index + findElse[0].length)
            var findElseIf = findElse[1].match(/^else\s*ifempty(.*)/)
            if (findElseIf)
            {
              subTreeElse = this.buildInFunctions['ifempty'].parse.call(this, this.parseParams(findElseIf[1]), content.replace(/^\n/, ''))
            }
            else
            {
              subTreeElse = this.parse(content.replace(/^\n/, ''))
            }
          }
          else
          {
            subTreeIf = this.parse(content)
          }
          return [
            {
              type       : 'build-in',
              name       : 'ifempty',
              params     : params,
              subTreeIf  : subTreeIf,
              subTreeElse: subTreeElse
            }
          ]
        }
      },

      'ifnotempty': {
        type : 'block',
        parse: function (params, content)
        {
          var subTreeIf   = []
          var subTreeElse = []
          var findElse    = this.findElseTag('ifnotempty\\s+[^}]+', '/ifnotempty', 'else[^}]*', content)

          if (findElse)
          {
            subTreeIf      = this.parse(content.slice(0, findElse.index))
            content        = content.slice(findElse.index + findElse[0].length)
            var findElseIf = findElse[1].match(/^else\s*ifnotempty(.*)/)
            if (findElseIf)
            {
              subTreeElse = this.buildInFunctions['ifnotempty'].parse.call(this, this.parseParams(findElseIf[1]), content.replace(/^\n/, ''))
            }
            else
            {
              subTreeElse = this.parse(content.replace(/^\n/, ''))
            }
          }
          else
          {
            subTreeIf = this.parse(content)
          }
          return [
            {
              type       : 'build-in',
              name       : 'ifnotempty',
              params     : params,
              subTreeIf  : subTreeIf,
              subTreeElse: subTreeElse
            }
          ]
        }
      },

      'ifset': {
        type : 'block',
        parse: function (params, content)
        {
          var subTreeIf   = []
          var subTreeElse = []
          var findElse    = this.findElseTag('ifset\\s+[^}]+', '/ifset', 'else[^}]*', content)

          if (findElse)
          {
            subTreeIf      = this.parse(content.slice(0, findElse.index))
            content        = content.slice(findElse.index + findElse[0].length)
            var findElseIf = findElse[1].match(/^else\s*ifset(.*)/)
            if (findElseIf)
            {
              subTreeElse = this.buildInFunctions['ifset'].parse.call(this, this.parseParams(findElseIf[1]), content.replace(/^\n/, ''))
            }
            else
            {
              subTreeElse = this.parse(content.replace(/^\n/, ''))
            }
          }
          else
          {
            subTreeIf = this.parse(content)
          }
          return [
            {
              type       : 'build-in',
              name       : 'ifset',
              params     : params,
              subTreeIf  : subTreeIf,
              subTreeElse: subTreeElse
            }
          ]
        }
      },

      'ifnotset': {
        type : 'block',
        parse: function (params, content)
        {
          var subTreeIf   = []
          var subTreeElse = []
          var findElse    = this.findElseTag('ifnotset\\s+[^}]+', '/ifnotset', 'else[^}]*', content)

          if (findElse)
          {
            subTreeIf      = this.parse(content.slice(0, findElse.index))
            content        = content.slice(findElse.index + findElse[0].length)
            var findElseIf = findElse[1].match(/^else\s*ifnotset(.*)/)
            if (findElseIf)
            {
              subTreeElse = this.buildInFunctions['ifnotset'].parse.call(this, this.parseParams(findElseIf[1]), content.replace(/^\n/, ''))
            }
            else
            {
              subTreeElse = this.parse(content.replace(/^\n/, ''))
            }
          }
          else
          {
            subTreeIf = this.parse(content)
          }
          return [
            {
              type       : 'build-in',
              name       : 'ifnotset',
              params     : params,
              subTreeIf  : subTreeIf,
              subTreeElse: subTreeElse
            }
          ]
        }
      },

      'foreach': {
        type       : 'block',
        parseParams: function (paramStr)
        {
          var res = paramStr.match(/^\s*([$].+)\s*as\s*[$](\w+)\s*(=>\s*[$](\w+))?\s*$/i)
          if (res)
          {
            paramStr = 'from=' + res[1] + ' item=' + (res[4] || res[2])
            if (res[4])
            {
              paramStr += ' key=' + res[2]
            }
          }
          return this.parseParams(paramStr)
        },
        parse      : function (params, content)
        {
          var subTree     = []
          var subTreeElse = []

          var findElse = this.findElseTag('foreach\\s[^}]+', '/foreach', 'foreachelse', content)
          if (findElse)
          {
            subTree     = this.parse(content.slice(0, findElse.index))
            subTreeElse = this.parse(content.slice(findElse.index + findElse[0].length).replace(/^[\r\n]/, ''))
          }
          else
          {
            subTree = this.parse(content)
          }
          return {
            type       : 'build-in',
            name       : 'foreach',
            params     : params,
            subTree    : subTree,
            subTreeElse: subTreeElse
          }
        }
      },

      'function': {
        type : 'block',
        parse: function (params, content)
        {
          /* It is the case where we generate tree and keep it aside
           to be used when called.
           Keep it as runtime plugin is a better choice.
          */
          // Right now, just add a name of plugin in run time, so when we parse
          // the content inside function and it uses name of same other run time
          // plugin. it has to be found. Value for it a true, just to make sure it exists.
          this.runTimePlugins[trimAllQuotes(params.name ? params.name : params[0])] = true

          var tree = this.parse(content)
          // We have a tree, now we need to add it to runtime plugins list.
          // Let us store it as local plugin and end of parsing
          // we pass it to original Latte object.
          this.runTimePlugins[trimAllQuotes(params.name ? params.name : params[0])] = {
            tree         : tree,
            defaultParams: params
          }
          // Do not take this in tree. Skip it.
          return false
        }
      },

      'extends': {
        type : 'function',
        parse: function (params)
        {
          return this.loadTemplate(trimAllQuotes(((params.file) ? params.file : params[0])), true)
        }
      },

      block: {
        type : 'block',
        parse: function (params, content)
        {
          params.append  = findInArray(params, 'append') >= 0
          params.prepend = findInArray(params, 'prepend') >= 0
          params.hide    = findInArray(params, 'hide') >= 0

          var match
          var tree      = this.parse(content, [])
          var blockName = trimAllQuotes(params.name ? params.name : params[0])
          var location
          if (!(blockName in this.blocks))
          {
            // This is block inside extends as it gets call first
            // when the extends is processed?!
            this.blocks[blockName] = []
            this.blocks[blockName] = {tree: tree, params: params}
            location               = 'inner'
            match                  = content.match(/latte.block.child/)
            params.needChild       = false
            if (match)
            {
              params.needChild = true
            }
          }
          else
          {
            // this.blocks has this block, means this outer block after extends
            this.outerBlocks[blockName] = []
            this.outerBlocks[blockName] = {tree: tree, params: params}
            location                    = 'outer'
            match                       = content.match(/latte.block.parent/)
            params.needParent           = false
            if (match)
            {
              params.needParent = true
            }
          }
          return {
            type    : 'build-in',
            name    : 'block',
            params  : params,
            location: location
          }
        }
      },

      strip: {
        type : 'block',
        parse: function (params, content)
        {
          return this.parse(content.replace(/[ \t]*[\r\n]+[ \t]*/g, ''))
        }
      },

      literal: {
        type : 'block',
        parse: function (params, content)
        {
          return this.parseText(content)
        }
      },

      ldelim: {
        type : 'function',
        parse: function (params)
        {
          return this.parseText(this.ldelim)
        }
      },

      rdelim: {
        type : 'function',
        parse: function (params)
        {
          return this.parseText(this.rdelim)
        }
      },

      'while': {
        type : 'block',
        parse: function (params, content)
        {
          return {
            type   : 'build-in',
            name   : 'while',
            params : params,
            subTree: this.parse(content)
          }
        }
      }
    }
  }


  /**
   * Returns boolean true if object is empty otherwise false.
   *
   * @param object hash Object you are testing against.
   *
   * @return boolean
   */
  function isEmptyObject(hash)
  {
    for (var i in hash)
    {
      if (hash.hasOwnProperty(i))
      {
        return false
      }
    }
    return true
  }


  function countProperties(ob)
  {
    var count = 0
    for (var name in ob)
    {
      if (ob.hasOwnProperty(name))
      {
        count++
      }
    }
    return count
  }
// Processor object. Plain object which just does processing.
  var LatteProcessor = {

    // Variable set temporary for processing.
    tplModifiers: [],

    // Store run time plugins.
    runTimePlugins: {},

    // Plugins function to use for processing.
    // They are added later from LatteJS, so we need a copy here.
    plugins: {},

    // Modifiers function to use for processing.
    // They are added later from LatteJS, so we need a copy here.
    modifiers: {},

    // Variable modifiers default to be applied.
    defaultModifiers: {},

    // If to escape html?.
    escapeHtml: false,

    // All filters for variable to run.
    variableFilters: [],

    outerBlocks: {},

    blocks: {},

    // If user wants to debug.
    debugging: false,

    isEmptyStrict: function (value)
    {
      if (typeof value === 'object')
      {
        for (var key in value)
        {
          if (value.hasOwnProperty(key) || typeof value[key] !== 'function')
          {
            return false
          }
        }
        return true
      }

      return [undefined, false, 0, '0', ''].indexOf(value) > -1
    },

    isEmptyLoose: function (value)
    {
      if (this.isEmptyStrict(value))
      {
        return true
      }

      return ['undefined', 'null', 'false'].indexOf(String(value)) > -1
    },

    isNotEmptyLoose: function (value)
    {
      return !this.isEmptyLoose(value)
    },

    isSetLoose: function (value)
    {
      return ['undefined', 'null'].indexOf(String(value)) === -1
    },

    isNotSetLoose: function (value)
    {
      return !this.isSetLoose(value)
    },

    isSetTag: function (value)
    {
      return ['undefined', 'null'].indexOf(String(value)) === -1 && value !== ''
    },

    isNotSetTag: function (value)
    {
      return !this.isSetTag(value)
    },

    startsWith: function (s, search, rawPos)
    {
      var pos = rawPos > 0 ? rawPos | 0 : 0
      return s.substring(pos, pos + search.length) === search
    },

    clear: function ()
    {
      // Clean up config, specific for this processing.
      this.runTimePlugins    = {}
      this.variableFilters   = []
      this.escapeHtml        = false
      this.defaultModifiers  = {}
      this.modifiers         = {}
      this.plugins           = {}
      this.blocks            = {}
      this.outerBlocks       = {}
      this.debugging         = false
      this.includedTemplates = []
    },

    // Process the tree and return the data.
    getProcessed: function (tree, data)
    {
      // Process the tree and get the output.
      var output = this.process(tree, data)
      if (this.debugging)
      {
        this.plugins.debug.process([], {
          includedTemplates: this.includedTemplates,
          assignedVars     : data
        })
      }
      this.clear()

      return {
        output: output.tpl,
        latte: output.latte
      }
    },

    // Process the tree and apply data.
    process: function (tree, data)
    {
      var res = ''
      var s
      var node
      var tmp
      var plugin

      for (var i = 0; i < tree.length; ++i)
      {
        node = tree[i]
        s    = ''

        if (node.type === 'text')
        {
          s = node.data
        }
        else if (node.type === 'var')
        {
          s = this.getVarValue(node, data)
        }
        else if (node.type === 'boolean')
        {
          s = !!node.data
        }
        else if (node.type === 'build-in')
        {
          tmp = this.buildInFunctions[node.name].process.call(this, node, data)
          if (typeof tmp.tpl !== 'undefined')
          {
            // If tmp is object, which means it has modified, data also
            // so copy it back to data.
            s    = tmp.tpl
            data = tmp.data
          }
          else
          {
            // If tmp is string means it has not modified data.
            s = tmp
          }
        }
        else if (node.type === 'plugin')
        {
          if (this.runTimePlugins[node.name])
          {
            // Thats call for {function}.
            tmp = this.buildInFunctions['function'].process.call(this, node, data)
            if (typeof tmp.tpl !== 'undefined')
            {
              // If tmp is object, which means it has modified, data also
              // so copy it back to data.
              s    = tmp.tpl
              data = tmp.data
            }
            else
            {
              // If tmp is string means it has not modified data.
              s = tmp
            }
          }
          else
          {
            plugin = this.plugins[node.name]
            if (plugin.type === 'block')
            {
              var repeat = {value: true}
              while (repeat.value)
              {
                repeat.value = false
                tmp          = this.process(node.subTree, data)
                if (typeof tmp.tpl !== 'undefined')
                {
                  data = tmp.data
                  tmp  = tmp.tpl
                }
                s += plugin.process.call(
                  this,
                  this.getActualParamValues(node.params, data),
                  tmp,
                  data,
                  repeat
                )
              }
            }
            else if (plugin.type === 'function')
            {
              s = plugin.process.call(this, this.getActualParamValues(node.params, data), data)
            }
          }
        }
        if (typeof s === 'boolean' && tree.length !== 1)
        {
          s = s ? '1' : ''
        }
        if (s === null || s === undefined)
        {
          s = ''
        }
        if (tree.length === 1)
        {
          return {tpl: s, data: data}
        }
        res += ((s !== null) ? s : '')

        if (data.latte.continue || data.latte.break)
        {
          return {tpl: res, data: data}
        }
      }
      return {tpl: res, data: data}
    },

    configLoad: function (content, section, data)
    {
      var s        = content.replace(/\r\n/g, '\n').replace(/^\s+|\s+$/g, '')
      var regex    = /^\s*(?:\[([^\]]+)\]|(?:(\w+)[ \t]*=[ \t]*("""|'[^'\\\n]*(?:\\.[^'\\\n]*)*'|"[^"\\\n]*(?:\\.[^"\\\n]*)*"|[^\n]*)))/m
      var triple
      var currSect = ''
      for (var f = s.match(regex); f; f = s.match(regex))
      {
        s = s.slice(f.index + f[0].length)
        if (f[1])
        {
          currSect = f[1]
        }
        else if ((!currSect || currSect === section) && currSect.substr(0, 1) !== '.')
        {
          if (f[3] === '"""')
          {
            triple = s.match(/"""/)
            if (triple)
            {
              data.latte.config[f[2]] = s.slice(0, triple.index)
              s                        = s.slice(triple.index + triple[0].length)
            }
          }
          else
          {
            data.latte.config[f[2]] = trimAllQuotes(f[3])
          }
        }
        var newln = s.match(/\n+/)
        if (newln)
        {
          s = s.slice(newln.index + newln[0].length)
        }
        else
        {
          break
        }
      }
      return data
    },

    getActualParamValues: function (params, data)
    {
      var actualParams = []
      var v
      for (var name in params.__parsed)
      {
        if (params.__parsed.hasOwnProperty(name))
        {
          v = this.process([params.__parsed[name]], data)
          if (typeof v !== 'undefined')
          {
            data = v.data
            v    = v.tpl
          }
          actualParams[name] = v
        }
      }
      actualParams.__get = function (name, defVal, id)
      {
        if (name in actualParams && typeof actualParams[name] !== 'undefined')
        {
          return actualParams[name]
        }
        if (typeof id !== 'undefined' && typeof actualParams[id] !== 'undefined')
        {
          return actualParams[id]
        }
        if (defVal === null)
        {
          throw new Error('The required attribute "' + name + '" is missing')
        }
        return defVal
      }
      return this.runFilters(actualParams, data, params)
    },

    getVarValue: function (node, data, value)
    {
      var v    = data
      var name = ''
      var i
      var part

      for (i = 0; i < node.parts.length; ++i)
      {
        part = node.parts[i]
        if (part.type === 'plugin' && part.name === '__func' && part.hasOwner)
        {
          data.__owner = v
          v            = this.process([node.parts[i]], data)
          if (typeof v.tpl !== 'undefined')
          {
            data = v.data
            v    = v.tpl
          }
          delete data.__owner
        }
        else
        {
          name = this.process([part], data)
          if (typeof name !== 'undefined')
          {
            data = name.data
            name = name.tpl
          }

          // Section Name.
          var processOutput = this.process([node.parts[0]], data)
          if (typeof processOutput !== 'undefined')
          {
            data          = processOutput.data
            processOutput = processOutput.tpl
          }
          if (name in data.latte.section && part.type === 'text' && (processOutput !== 'latte'))
          {
            name = data.latte.section[name].index
          }

          // Add to array
          if (!name && typeof value !== 'undefined' && v instanceof Array)
          {
            name = v.length
          }

          // Set new value.
          if (typeof value !== 'undefined' && i === (node.parts.length - 1))
          {
            v[name] = value
          }

          if (typeof v === 'object' && v !== null && name in v)
          {
            v = v[name]
          }
          else
          {
            if (typeof value === 'undefined')
            {
              return value
            }
            v[name] = {}
            v       = v[name]
          }
        }
      }
      return v
    },

    // TODO:: Remove this duplicate function.
    // Apply the filters to template.
    applyFilters: function (filters, val)
    {
      var args = []

      for (var j = 1; j < arguments.length; j++)
      {
        args[j - 1] = arguments[j]
      }

      for (var i = 0; i < filters.length; ++i)
      {
        args[0] = filters[i].apply(this, args)
      }

      return args[0]
    },

    assignVar: function (name, value, data)
    {
      if (name.match(/\[\]$/))
      {
        // ar[] =
        data[name.replace(/\[\]$/, '')].push(value)
      }
      else
      {
        data[name] = value
      }
      return data
    },

    buildInFunctions: {
      expression: {
        process: function (node, data)
        {
          var params = this.getActualParamValues(node.params, data)
          var res    = this.process([node.expression], data)

          if (typeof res !== 'undefined')
          {
            data = res.data
            res  = res.tpl
          }
          if (findInArray(params, 'nofilter') < 0)
          {
            for (var i = 0; i < this.defaultModifiers.length; ++i)
            {
              var m                = this.defaultModifiers[i]
              m.params.__parsed[0] = {type: 'text', data: res}
              res                  = this.process([m], data)
              if (typeof res !== 'undefined')
              {
                data = res.data
                res  = res.tpl
              }
            }
            if (this.escapeHtml)
            {
              res = this.modifiers.escape(res)
            }
            res = this.applyFilters(this.variableFilters, res)
            if (this.tplModifiers.length)
            {
              // Write in global scope __t() function is called, it works.
              if (typeof window === 'object' && window.document)
              {
                window.__t = function () { return res }
              }
              else
              {
                // Node.js like environment?!
                global['__t'] = function () { return res }
              }
              res = this.process(this.tplModifiers[this.tplModifiers.length - 1], data)
              if (typeof res !== 'undefined')
              {
                data = res.data
                res  = res.tpl
              }
            }
          }
          return {tpl: res, data: data}
        }
      },

      append: {
        process: function (node, data)
        {
          var params  = this.getActualParamValues(node.params, data)
          var varName = params.__get('var', null, 0)
          if (!(varName in data) || !(data[varName] instanceof Array))
          {
            data[varName] = []
          }
          var index = params.__get('index', false)
          var val   = params.__get('value', null, 1)
          if (index === false)
          {
            data[varName].push(val)
          }
          else
          {
            data[varName][index] = val
          }
          return {tpl: '', data: data}
        }
      },

      assign: {
        process: function (node, data)
        {
          var params = this.getActualParamValues(node.params, data)
          return {tpl: '', data: this.assignVar(params.__get('var', null, 0), params.__get('value', null, 1), data)}
        }
      },

      config_load: {
        process: function (node, data)
        {
          data = this.configLoad(node.content, node.section, data)
          return {
            tpl : '',
            data: data
          }
        }
      },

      capture: {
        process: function (node, data)
        {
          var params  = this.getActualParamValues(node.params, data)
          var content = this.process(node.subTree, data)
          if (typeof content !== 'undefined')
          {
            data    = content.data
            content = content.tpl
          }
          content                                                 = content.replace(/^\n/, '')
          data.latte.capture[params.__get('name', 'default', 0)] = content
          if ('assign' in params)
          {
            data = this.assignVar(params.assign, content, data)
          }
          var append = params.__get('append', false)
          if (append)
          {
            if (append in data)
            {
              if (data[append] instanceof Array)
              {
                data[append].push(content)
              }
            }
            else
            {
              data[append] = [content]
            }
          }
          return {tpl: '', data: data}
        }
      },

      operator: {
        process: function (node, data)
        {
          var params = this.getActualParamValues(node.params, data)
          var arg1   = params[0]
          var arg2
          var isVar

          if (node.optype === 'binary')
          {
            arg2 = params[1]
            if (node.op === '=')
            {
              // Var value is returned, but also set inside data.
              // we use the data and override ours.
              this.getVarValue(node.params.__parsed[0], data, arg2)
              return {tpl: '', data: data}
            }
            else if (node.op.match(/(\+=|-=|\*=|\/=|%=)/))
            {
              arg1 = this.getVarValue(node.params.__parsed[0], data)
              switch (node.op)
              {
                case '+=':
                {
                  arg1 += arg2
                  break
                }
                case '-=':
                {
                  arg1 -= arg2
                  break
                }
                case '*=':
                {
                  arg1 *= arg2
                  break
                }
                case '/=':
                {
                  arg1 /= arg2
                  break
                }
                case '%=':
                {
                  arg1 %= arg2
                  break
                }
              }
              return this.getVarValue(node.params.__parsed[0], data, arg1)
            }
            else if (node.op.match(/div/))
            {
              return (node.op !== 'div') ^ (arg1 % arg2 === 0)
            }
            else if (node.op.match(/even/))
            {
              return (node.op !== 'even') ^ ((arg1 / arg2) % 2 === 0)
            }
            else if (node.op.match(/xor/))
            {
              return (arg1 || arg2) && !(arg1 && arg2)
            }

            switch (node.op)
            {
              case '==':
              {
                return arg1 == arg2 // eslint-disable-line eqeqeq
              }
              case '!=':
              {
                return arg1 != arg2 // eslint-disable-line eqeqeq
              }
              case '+':
              {
                return Number(arg1) + Number(arg2)
              }
              case '-':
              {
                return Number(arg1) - Number(arg2)
              }
              case '*':
              {
                return Number(arg1) * Number(arg2)
              }
              case '/':
              {
                return Number(arg1) / Number(arg2)
              }
              case '%':
              {
                return Number(arg1) % Number(arg2)
              }
              case '&&':
              {
                return arg1 && arg2
              }
              case '||':
              {
                return arg1 || arg2
              }
              case '<':
              {
                return arg1 < arg2
              }
              case '<=':
              {
                return arg1 <= arg2
              }
              case '>':
              {
                return arg1 > arg2
              }
              case '===':
              {
                return arg1 === arg2
              }
              case '>=':
              {
                return arg1 >= arg2
              }
              case '!==':
              {
                return arg1 !== arg2
              }
            }
          }
          else if (node.op === '!')
          {
            return !arg1
          }
          else
          {
            isVar = node.params.__parsed[0].type === 'var'
            if (isVar)
            {
              arg1 = this.getVarValue(node.params.__parsed[0], data)
            }
            var v = arg1
            if (node.optype === 'pre-unary')
            {
              switch (node.op)
              {
                case '-':
                {
                  v = -arg1
                  break
                }
                case '++':
                {
                  v = ++arg1
                  break
                }
                case '--':
                {
                  v = --arg1
                  break
                }
              }
              if (isVar)
              {
                this.getVarValue(node.params.__parsed[0], data, arg1)
              }
            }
            else
            {
              switch (node.op)
              {
                case '++':
                {
                  arg1++
                  break
                }
                case '--':
                {
                  arg1--
                  break
                }
              }
              this.getVarValue(node.params.__parsed[0], data, arg1)
            }
            return v
          }
        }
      },

      section: {
        process: function (node, data)
        {
          var params = this.getActualParamValues(node.params, data)
          var props  = {}
          var show   = params.__get('show', true)

          data.latte.section[params.__get('name', null, 0)] = props
          props.show                                         = show

          if (!show)
          {
            return this.process(node.subTreeElse, data)
          }

          var from = parseInt(params.__get('start', 0), 10)
          var to   = (params.loop instanceof Object) ? countProperties(params.loop) : isNaN(params.loop) ? 0 : parseInt(params.loop)
          var step = parseInt(params.__get('step', 1), 10)
          var max  = parseInt(params.__get('max'), 10)
          if (isNaN(max))
          {
            max = Number.MAX_VALUE
          }

          if (from < 0)
          {
            from += to
            if (from < 0)
            {
              from = 0
            }
          }
          else if (from >= to)
          {
            from = to ? to - 1 : 0
          }

          var count = 0
          var i     = from

          count = 0
          var s = ''
          for (i = from; i >= 0 && i < to && count < max; i += step, ++count)
          {
            if (data.latte.break)
            {
              break
            }

            props.first      = (i === from)
            props.last       = ((i + step) < 0 || (i + step) >= to)
            props.index      = i
            props.index_prev = i - step
            props.index_next = i + step
            props.iteration  = props.rownum = count + 1
            props.total      = count
            // ? - because it is so in Latte
            props.loop       = count

            var tmp = this.process(node.subTree, data)
            if (typeof tmp !== 'undefined')
            {
              data = tmp.data
              s += tmp.tpl
            }
            data.latte.continue = false
          }
          props.total = count
          // ? - because it is so in Latte
          props.loop  = count

          data.latte.break = false

          if (count)
          {
            return {tpl: s, data: data}
          }
          return this.process(node.subTreeElse, data)
        }
      },

      setfilter: {
        process: function (node, data)
        {
          this.tplModifiers.push(node.params)
          var s = this.process(node.subTree, data)
          if (typeof s !== 'undefined')
          {
            data = s.data
            s    = s.tpl
          }
          this.tplModifiers.pop()
          return {tpl: s, data: data}
        }
      },

      'for': {
        process: function (node, data)
        {
          var params = this.getActualParamValues(node.params, data)
          var from   = parseInt(params.__get('from'), 10)
          var to     = parseInt(params.__get('to'), 10)
          var step   = parseInt(params.__get('step'), 10)
          if (isNaN(step))
          {
            step = 1
          }
          var max = parseInt(params.__get('max'), 10)
          if (isNaN(max))
          {
            max = Number.MAX_VALUE
          }

          var count = 0
          var s     = ''
          var total = Math.min(Math.ceil(((step > 0 ? to - from : from - to) + 1) / Math.abs(step)), max)

          for (var i = parseInt(params.from, 10); count < total; i += step, ++count)
          {
            if (data.latte.break)
            {
              break
            }
            data[params.varName] = i
            var tmp              = this.process(node.subTree, data)
            if (typeof tmp !== 'undefined')
            {
              data = tmp.data
              s += tmp.tpl
            }
            data.latte.continue = false
          }
          data.latte.break = false

          if (!count)
          {
            var tmp2 = this.process(node.subTreeElse, data)
            if (typeof tmp2 !== 'undefined')
            {
              data = tmp2.data
              s    = tmp2.tpl
            }
          }
          return {tpl: s, data: data}
        }
      },

      'if': {
        process: function (node, data)
        {
          var value = this.getActualParamValues(node.params, data)[0]
          // Zero length arrays or empty associative arrays are false in PHP.
          if (value && !((value instanceof Array && value.length === 0) ||
            (typeof value === 'object' && isEmptyObject(value)))
          )
          {
            return this.process(node.subTreeIf, data)
          }
          else
          {
            return this.process(node.subTreeElse, data)
          }
        }
      },

      'ifempty': {
        process: function (node, data)
        {
          var value = this.getActualParamValues(node.params, data)[0]
          if (this.isEmptyLoose(value))
          {
            return this.process(node.subTreeIf, data)
          }
          else
          {
            return this.process(node.subTreeElse, data)
          }
        }
      },

      'ifnotempty': {
        process: function (node, data)
        {
          var value = this.getActualParamValues(node.params, data)[0]
          if (this.isNotEmptyLoose(value))
          {
            return this.process(node.subTreeIf, data)
          }
          else
          {
            return this.process(node.subTreeElse, data)
          }
        }
      },

      'ifset': {
        process: function (node, data)
        {
          var value = this.getActualParamValues(node.params, data)[0]
          if (this.isSetTag(value))
          {
            return this.process(node.subTreeIf, data)
          }
          else
          {
            return this.process(node.subTreeElse, data)
          }
        }
      },

      'ifnotset': {
        process: function (node, data)
        {
          var value = this.getActualParamValues(node.params, data)[0]
          if (this.isNotSetTag(value))
          {
            return this.process(node.subTreeIf, data)
          }
          else
          {
            return this.process(node.subTreeElse, data)
          }
        }
      },

      nocache: {
        process: function (node, data)
        {
          return this.process(node.subTree, data)
        }
      },

      'foreach': {
        process: function (node, data)
        {
          var params                    = this.getActualParamValues(node.params, data)
          var a                         = params.from
          data[params.item + '__empty'] = data['iterator__empty'] = this.isEmptyLoose(a)
          data[params.item + '__show']  = data['iterator__show'] = this.isNotEmptyLoose(a)
          if (typeof a === 'undefined' || a === '')
          {
            a = []
          }
          if (typeof a !== 'object')
          {
            a = [a]
          }

          var total = countProperties(a)

          data[params.item + '__total'] = data['iterator__total'] = total
          if ('name' in params)
          {
            data.latte.foreach[params.name]       = {}
            data.latte.foreach[params.name].total = total
          }

          var s = ''
          var i = 0
          for (var key in a)
          {
            if (!a.hasOwnProperty(key))
            {
              continue
            }

            if (data.latte.break)
            {
              break
            }

            data[params.item + '__key'] = isNaN(key) ? key : parseInt(key, 10)
            if ('key' in params)
            {
              data[params.key] = data[params.item + '__key']
            }
            data[params.item]                 = a[key]
            data[params.item + '__index']     = parseInt(i, 10)
            data[params.item + '__iteration'] = parseInt(i + 1, 10)
            data[params.item + '__counter']   = data[params.item + '__iteration']
            data[params.item + '__odd']       = parseInt(i + 1, 10) % 2 === 1
            data[params.item + '__even']      = parseInt(i + 1, 10) % 2 === 0
            data[params.item + '__first']     = (i === 0)
            data[params.item + '__last']      = (i === total - 1)

            if ('name' in params)
            {
              data.latte.foreach[params.name].index     = parseInt(i, 10)
              data.latte.foreach[params.name].iteration = parseInt(i + 1, 10)
              data.latte.foreach[params.name].first     = (i === 0) ? 1 : ''
              data.latte.foreach[params.name].last      = (i === total - 1) ? 1 : ''
            }

            ++i

            for (var datakey in data)
            {
              if (data.hasOwnProperty(datakey) && this.startsWith(datakey, params.item + '__'))
              {
                data[datakey.replace(params.item, 'iterator')] = data[datakey]
              }
            }

            var tmp2 = this.process(node.subTree, data)
            if (typeof tmp2 !== 'undefined')
            {
              data = tmp2.data
              s += tmp2.tpl
            }
            data.latte.continue = false
          }
          data.latte.break = false

          if (params.name)
          {
            data.latte.foreach[params.name].show = (i > 0) ? 1 : ''
          }
          if (i > 0)
          {
            return s
          }
          return this.process(node.subTreeElse, data)
        }
      },

      'break': {
        process: function (node, data)
        {
          data.latte.break = true
          return {
            tpl : '',
            data: data
          }
        }
      },

      'continue': {
        process: function (node, data)
        {
          data.latte.continue = true
          return {
            tpl : '',
            data: data
          }
        }
      },

      block: {
        process: function (node, data)
        {
          var blockName  = trimAllQuotes(node.params.name ? node.params.name : node.params[0])
          var innerBlock = this.blocks[blockName]
          var innerBlockContent
          var outerBlock = this.outerBlocks[blockName]
          var outerBlockContent
          var output

          if (node.location === 'inner')
          {
            if (innerBlock.params.needChild)
            {
              outerBlockContent = this.process(outerBlock.tree, data)
              if (typeof outerBlockContent.tpl !== 'undefined')
              {
                outerBlockContent = outerBlockContent.tpl
              }
              data.latte.block.child = outerBlockContent
              innerBlockContent       = this.process(innerBlock.tree, data)
              if (typeof innerBlockContent.tpl !== 'undefined')
              {
                innerBlockContent = innerBlockContent.tpl
              }
              output = innerBlockContent
            }
            else if (outerBlock.params.needParent)
            {
              innerBlockContent = this.process(innerBlock.tree, data)
              if (typeof innerBlockContent.tpl !== 'undefined')
              {
                innerBlockContent = innerBlockContent.tpl
              }
              data.latte.block.parent = innerBlockContent
              outerBlockContent        = this.process(outerBlock.tree, data)
              if (typeof outerBlockContent.tpl !== 'undefined')
              {
                outerBlockContent = outerBlockContent.tpl
              }
              output = outerBlockContent
            }
            else
            {
              outerBlockContent = this.process(outerBlock.tree, data)
              if (typeof outerBlockContent.tpl !== 'undefined')
              {
                outerBlockContent = outerBlockContent.tpl
              }
              if (outerBlock.params.append)
              {
                innerBlockContent = this.process(innerBlock.tree, data)
                if (typeof innerBlockContent.tpl !== 'undefined')
                {
                  innerBlockContent = innerBlockContent.tpl
                }
                output = outerBlockContent + innerBlockContent
              }
              else if (outerBlock.params.prepend)
              {
                innerBlockContent = this.process(innerBlock.tree, data)
                if (typeof innerBlockContent.tpl !== 'undefined')
                {
                  innerBlockContent = innerBlockContent.tpl
                }
                output = innerBlockContent + outerBlockContent
              }
              else
              {
                output = outerBlockContent
              }
            }
            return output
          }
          // Outer block should not be printed it just used to
          // capture the content
          return ''
        }
      },

      'call': {
        process: function (node, data)
        {
          var params   = this.getActualParamValues(node.params, data)
          var name     = params.__get('name') ? params.__get('name') : params.__get('0')
          var newNode  = {name: name, params: node.params}
          var s        = this.buildInFunctions['function'].process.call(this, newNode, data)
          var assignTo = params.__get('assign', false)
          if (assignTo)
          {
            return {tpl: '', data: this.assignVar(assignTo, s, data)}
          }
          else
          {
            return s
          }
        }
      },

      include: {
        process: function (node, data)
        {
          var params = this.getActualParamValues(node.params, data)
          var file   = params.__get('file', null, 0)
          this.includedTemplates.push(file)
          var incData             = objectMerge({}, data, params)
          incData.latte.template = file
          var content             = this.process(node.subTree, incData)
          if (typeof content !== 'undefined')
          {
            // We do not copy data from child template, to the parent. Child
            // template can use parent data blocks, but does send it back to
            // parent. data = content.data;
            content = content.tpl
          }
          if (params.assign)
          {
            return {tpl: '', data: this.assignVar(params.assign, content, data)}
          }
          else
          {
            return content
          }
        }
      },

      'function': {
        process: function (node, data)
        {
          var funcData = this.runTimePlugins[node.name]
          var defaults = this.getActualParamValues(funcData.defaultParams, data)
          delete defaults.name
          // We need to get param values for node.params too.
          var params = this.getActualParamValues(node.params, data)

          var obj = this.process(funcData.tree, objectMerge({}, data, defaults, params))
          // We do not return data:data like other built in  functions. Because node.params
          // are specific as argument for this function and we do not want modifify original
          // object with this value.
          return obj.tpl
        }
      },

      'while': {
        process: function (node, data)
        {
          var s = ''
          while (this.getActualParamValues(node.params, data)[0])
          {
            if (data.latte.break)
            {
              break
            }
            var tmp2 = this.process(node.subTree, data)
            if (typeof tmp2 !== 'undefined')
            {
              data = tmp2.data
              s += tmp2.tpl
            }
            data.latte.continue = false
          }
          data.latte.break = false
          return {tpl: s, data: data}
        }
      }
    }
  }
var version = '4.4.0'

  /*
   Define LatteJS constructor. Latte object just stores,
   tree, $latte block and some intialization methods.
   We keep Latte object light weight as one page or program
   might contain to many Latte objects.
   Keep parser and processor outside of Latte objects, help
   us not to store, same parser and processor methods in all
   Latte object.
  */
  var Latte = function (template, options)
  {
    // Latte object which has version, delimiters, config, current directory
    // and all blocks like Nette's Latte.
    this.latte = {

      // Blocks in the current latte object.
      block: {},

      // Used to store state of break;
      'break': false,

      // All the capture blocks in the current latte object.
      capture: {},

      // Used to store state of continue
      'continue': false,

      // Current counter information. Latte like feature.
      counter: {},

      // Use by {cycle} custom function to store array and cycle info.
      cycle: {},

      // All the foreach blocks in the current latte object.
      'foreach': {},

      // All the section blocks in the current latte object.
      section: {},

      // Current timestamp, when the object is created.
      now: Math.floor(((new Date()).getTime() / 1000)),

      // All the constants defined the current latte object.
      'const': {},

      // Current configuration.
      config: {},

      // Current directory, underscored name as Latte does it.
      current_dir: '/',

      // Current template.
      template: '',

      // Left delimiter.
      ldelim: '{',

      // Right delimiter.
      rdelim: '}',

      // Current version of LatteJS.
      version: version
    }

    // Whether to skip tags in open brace { followed by white space(s) and close brace } with white space(s) before.
    this.autoLiteral = true

    // Escape html??
    this.escapeHtml = false

    // If user wants debug to be enabled.
    this.debugging = false

    // Store outer blocks below extends.
    this.outerBlocks = {}

    // Stores inner blocks.
    this.blocks = {}

    this.parse(template, options)
  }

  // Add more properties to Latte core.
  Latte.prototype = {
    constructor: Latte,

    // Current tree structure.
    tree: [],

    // Current javascript files loaded via include_javascript.
    scripts: {},

    // List of all modifiers present in the app.
    modifiers: {},

    // All the modifiers to apply by default to all variables.
    defaultModifiers: [],

    // Global modifiers which which can be used in all instances.
    defaultModifiersGlobal: [],

    // Cache for global and default modifiers merged version to apply.
    globalAndDefaultModifiers: [],

    // Filters which are applied to all variables are in 'variable'.
    // Filters which are applied after processing whole template are in 'post'.
    filters: {
      'variable': [],
      'params'  : [],
      'post'    : []
    },

    // Global filters. pre, post and variable. All of them.
    filtersGlobal: {
      'pre'     : [],
      'variable': [],
      'params'  : [],
      'post'    : []
    },

    // Cached value for all default and global variable filters.
    // Only for variable.
    globalAndDefaultFilters: [],

    // Build in functions of the latte.
    buildInFunctions: {},

    // Plugins of the functions.
    plugins: {},

    // Store current runtime plugins. Generally used for
    // {function} tags.
    runTimePlugins: {},

    // Initialize, Latte, set settings and parse the template.
    parse: function (template, options)
    {
      var parsedTemplate
      if (!options)
      {
        options = {}
      }
      if (options.rdelim)
      {
        // If delimiters are passed locally take them.
        this.latte.rdelim = options.rdelim
      }
      else if (Latte.prototype.right_delimiter)
      {
        // Backward compatible. Old way to set via prototype.
        this.latte.rdelim = Latte.prototype.right_delimiter
      }
      else
      {
        // Otherwise default delimiters
        this.latte.rdelim = '}'
      }
      if (options.ldelim)
      {
        // If delimiters are passed locally take them.
        this.latte.ldelim = options.ldelim
      }
      else if (Latte.prototype.left_delimiter)
      {
        // Backward compatible. Old way to set via prototype.
        this.latte.ldelim = Latte.prototype.left_delimiter
      }
      else
      {
        // Otherwise default delimiters
        this.latte.ldelim = '{'
      }
      if (options.autoLiteral !== undefined)
      {
        // If autoLiteral is passed locally, take it.
        this.autoLiteral = options.autoLiteral
      }
      else if (Latte.prototype.auto_literal !== undefined)
      {
        // Backward compatible. Old way to set via prototype.
        this.autoLiteral = Latte.prototype.auto_literal
      }

      if (options.debugging !== undefined)
      {
        // If debugging is passed locally, take it.
        this.debugging = options.debugging
      }
      else if (Latte.prototype.debugging !== undefined)
      {
        // Backward compatible. Old way to set via prototype.
        this.debugging = Latte.prototype.debugging
      }

      if (options.escapeHtml !== undefined)
      {
        // If escapeHtml is passed locally, take it.
        this.escapeHtml = options.escapeHtml
      }
      else if (Latte.prototype.escape_html !== undefined)
      {
        // Backward compatible. Old way to set via prototype.
        this.escapeHtml = Latte.prototype.escape_html
      }

      // Is template string or at least defined?!
      template = String(template || '')

      // Generate the tree. We pass delimiters and many config values
      // which are needed by parser to parse like delimiters.
      LatteParser.clear()
      LatteParser.rdelim      = this.latte.rdelim
      LatteParser.ldelim      = this.latte.ldelim
      LatteParser.getTemplate = this.getTemplate
      LatteParser.getConfig   = this.getConfig
      LatteParser.autoLiteral = this.autoLiteral
      LatteParser.plugins     = this.plugins
      LatteParser.preFilters  = this.filtersGlobal.pre
      // Above parser config are set, lets parse.
      parsedTemplate          = LatteParser.getParsed(template)
      this.tree               = parsedTemplate.tree
      this.runTimePlugins     = parsedTemplate.runTimePlugins
      this.blocks             = parsedTemplate.blocks
      this.outerBlocks        = parsedTemplate.outerBlocks
    },

    // Process the generated tree.
    fetch: function (data)
    {
      var outputData = ''
      if (!(typeof data === 'object'))
      {
        data = {}
      }

      // Define latte inside data and copy latte vars, so one can use $latte
      // vars inside templates.
      data.latte = {}
      objectMerge(data.latte, this.latte)

      // Take default global modifiers, add with local default modifiers.
      // Merge them and keep them cached.
      this.globalAndDefaultModifiers = Latte.prototype.defaultModifiersGlobal.concat(this.defaultModifiers)

      // Take default global filters, add with local default filters.
      // Merge them and keep them cached.
      this.globalAndDefaultFilters = Latte.prototype.filtersGlobal.variable.concat(this.filters.variable)

      LatteProcessor.clear()
      LatteProcessor.plugins          = this.plugins
      LatteProcessor.modifiers        = this.modifiers
      LatteProcessor.defaultModifiers = this.defaultModifiers
      LatteProcessor.escapeHtml       = this.escapeHtml
      LatteProcessor.variableFilters  = this.globalAndDefaultFilters
      LatteProcessor.runTimePlugins   = this.runTimePlugins
      LatteProcessor.blocks           = this.blocks
      LatteProcessor.outerBlocks      = this.outerBlocks
      LatteProcessor.debugging        = this.debugging

      // Capture the output by processing the template.
      outputData = LatteProcessor.getProcessed(this.tree, data, this.latte)

      // Merge back latte data returned by process to original object.
      objectMerge(this.latte, outputData.latte)
      // Apply post filters to output and return the template data.
      return this.applyFilters(Latte.prototype.filtersGlobal.post.concat(this.filters.post), outputData.output)
    },

    // Apply the filters to template.
    applyFilters: function (filters, val)
    {
      var args = []

      for (var j = 1; j < arguments.length; j++)
      {
        args[j - 1] = arguments[j]
      }

      for (var i = 0; i < filters.length; ++i)
      {
        args[0] = filters[i].apply(this, args)
      }

      return args[0]
    },

    // Print the object.
    printR: function (toPrint, indent, indentEnd)
    {
      if (!indent)
      {
        indent = '&nbsp;&nbsp;'
      }
      if (!indentEnd)
      {
        indentEnd = ''
      }
      var s = ''
      var name
      if (toPrint instanceof Object)
      {
        s = 'Object (\n'
        for (name in toPrint)
        {
          if (toPrint.hasOwnProperty(name))
          {
            s += indent + indent + '[' + name + '] => ' + this.printR(toPrint[name], indent + '&nbsp;&nbsp;', indent + indent)
          }
        }
        s += indentEnd + ')\n'
        return s
      }
      else if (toPrint instanceof Array)
      {
        s = 'Array (\n'
        for (name in toPrint)
        {
          if (toPrint.hasOwnProperty(name))
          {
            s += indent + indent + '[' + name + '] => ' + this.printR(toPrint[name], indent + '&nbsp;&nbsp;', indent + indent)
          }
        }
        s += indentEnd + ')\n'
        return s
      }
      else if (toPrint instanceof Boolean)
      {
        var bool = 'false'
        if (bool === true)
        {
          bool = 'true'
        }
        return bool + '\n'
      }
      else
      {
        return (toPrint + '\n')
      }
    },

    // Register a plugin.
    registerPlugin: function (type, name, callback)
    {
      if (type === 'modifier')
      {
        this.modifiers[name] = callback
      }
      else
      {
        this.plugins[name] = {'type': type, 'process': callback}
      }
    },

    // Register a filter.
    registerFilter: function (type, callback)
    {
      (this.tree && this.tree.length > 0 ? this.filters : Latte.prototype.filtersGlobal)[((type === 'output') ? 'post' : type)].push(callback)
    },

    addDefaultModifier: function (modifiers)
    {
      if (!(modifiers instanceof Array))
      {
        modifiers = [modifiers]
      }

      for (var i = 0; i < modifiers.length; ++i)
      {
        var data = LatteParser.parseModifiers('|' + modifiers[i], [0])
        if (this.tree)
        {
          this.defaultModifiers.push(data.tree[0])
        }
        else
        {
          this.defaultModifiersGlobal.push(data.tree[0])
        }
      }
    },

    getTemplate: function (name)
    {
      throw new Error('No template for ' + name)
    },

    getFile: function (name)
    {
      throw new Error('No file for ' + name)
    },

    getJavascript: function (name)
    {
      throw new Error('No Javascript for ' + name)
    },

    getConfig: function (name)
    {
      throw new Error('No config for ' + name)
    }
  }

  LatteProcessor.runFilters = function (actualParams, data, params)
  {
    var filters = Latte.prototype.filtersGlobal.params.concat(Latte.prototype.filters.params)
    return Latte.prototype.applyFilters(filters, actualParams, data, params)
  }


  // Copied from  http://locutus.io/php/get_html_translation_table/
  function getHtmlTranslationTable(table, quoteStyle)
  {
    var entities               = {}
    var hashMap                = {}
    var decimal
    var constMappingTable      = {}
    var constMappingQuoteStyle = {}
    var useTable               = {}
    var useQuoteStyle          = {}

    // Translate arguments
    constMappingTable[0]      = 'HTML_SPECIALCHARS'
    constMappingTable[1]      = 'HTML_ENTITIES'
    constMappingQuoteStyle[0] = 'ENT_NOQUOTES'
    constMappingQuoteStyle[2] = 'ENT_COMPAT'
    constMappingQuoteStyle[3] = 'ENT_QUOTES'

    useTable = !isNaN(table)
      ? constMappingTable[table]
      : table
        ? table.toUpperCase()
        : 'HTML_SPECIALCHARS'

    useQuoteStyle = !isNaN(quoteStyle)
      ? constMappingQuoteStyle[quoteStyle]
      : quoteStyle
        ? quoteStyle.toUpperCase()
        : 'ENT_COMPAT'

    if (useTable !== 'HTML_SPECIALCHARS' && useTable !== 'HTML_ENTITIES')
    {
      throw new Error('Table: ' + useTable + ' not supported')
    }

    entities['38'] = '&amp;'
    if (useTable === 'HTML_ENTITIES')
    {
      entities['160']  = '&nbsp;'
      entities['161']  = '&iexcl;'
      entities['162']  = '&cent;'
      entities['163']  = '&pound;'
      entities['164']  = '&curren;'
      entities['165']  = '&yen;'
      entities['166']  = '&brvbar;'
      entities['167']  = '&sect;'
      entities['168']  = '&uml;'
      entities['169']  = '&copy;'
      entities['170']  = '&ordf;'
      entities['171']  = '&laquo;'
      entities['172']  = '&not;'
      entities['173']  = '&shy;'
      entities['174']  = '&reg;'
      entities['175']  = '&macr;'
      entities['176']  = '&deg;'
      entities['177']  = '&plusmn;'
      entities['178']  = '&sup2;'
      entities['179']  = '&sup3;'
      entities['180']  = '&acute;'
      entities['181']  = '&micro;'
      entities['182']  = '&para;'
      entities['183']  = '&middot;'
      entities['184']  = '&cedil;'
      entities['185']  = '&sup1;'
      entities['186']  = '&ordm;'
      entities['187']  = '&raquo;'
      entities['188']  = '&frac14;'
      entities['189']  = '&frac12;'
      entities['190']  = '&frac34;'
      entities['191']  = '&iquest;'
      entities['192']  = '&Agrave;'
      entities['193']  = '&Aacute;'
      entities['194']  = '&Acirc;'
      entities['195']  = '&Atilde;'
      entities['196']  = '&Auml;'
      entities['197']  = '&Aring;'
      entities['198']  = '&AElig;'
      entities['199']  = '&Ccedil;'
      entities['200']  = '&Egrave;'
      entities['201']  = '&Eacute;'
      entities['202']  = '&Ecirc;'
      entities['203']  = '&Euml;'
      entities['204']  = '&Igrave;'
      entities['205']  = '&Iacute;'
      entities['206']  = '&Icirc;'
      entities['207']  = '&Iuml;'
      entities['208']  = '&ETH;'
      entities['209']  = '&Ntilde;'
      entities['210']  = '&Ograve;'
      entities['211']  = '&Oacute;'
      entities['212']  = '&Ocirc;'
      entities['213']  = '&Otilde;'
      entities['214']  = '&Ouml;'
      entities['215']  = '&times;'
      entities['216']  = '&Oslash;'
      entities['217']  = '&Ugrave;'
      entities['218']  = '&Uacute;'
      entities['219']  = '&Ucirc;'
      entities['220']  = '&Uuml;'
      entities['221']  = '&Yacute;'
      entities['222']  = '&THORN;'
      entities['223']  = '&szlig;'
      entities['224']  = '&agrave;'
      entities['225']  = '&aacute;'
      entities['226']  = '&acirc;'
      entities['227']  = '&atilde;'
      entities['228']  = '&auml;'
      entities['229']  = '&aring;'
      entities['230']  = '&aelig;'
      entities['231']  = '&ccedil;'
      entities['232']  = '&egrave;'
      entities['233']  = '&eacute;'
      entities['234']  = '&ecirc;'
      entities['235']  = '&euml;'
      entities['236']  = '&igrave;'
      entities['237']  = '&iacute;'
      entities['238']  = '&icirc;'
      entities['239']  = '&iuml;'
      entities['240']  = '&eth;'
      entities['241']  = '&ntilde;'
      entities['242']  = '&ograve;'
      entities['243']  = '&oacute;'
      entities['244']  = '&ocirc;'
      entities['245']  = '&otilde;'
      entities['246']  = '&ouml;'
      entities['247']  = '&divide;'
      entities['248']  = '&oslash;'
      entities['249']  = '&ugrave;'
      entities['250']  = '&uacute;'
      entities['251']  = '&ucirc;'
      entities['252']  = '&uuml;'
      entities['253']  = '&yacute;'
      entities['254']  = '&thorn;'
      entities['255']  = '&yuml;'
      entities['8364'] = '&euro;'
    }

    if (useQuoteStyle !== 'ENT_NOQUOTES')
    {
      entities['34'] = '&quot;'
    }
    if (useQuoteStyle === 'ENT_QUOTES')
    {
      entities['39'] = '&#39;'
    }
    entities['60'] = '&lt;'
    entities['62'] = '&gt;'

    // ascii decimals to real symbols
    for (decimal in entities)
    {
      if (entities.hasOwnProperty(decimal))
      {
        hashMap[String.fromCharCode(decimal)] = entities[decimal]
      }
    }

    return hashMap
  }


  var phpJs = {
    // Copied from http://locutus.io/php/strings/ord/
    ord: function (string)
    {
      var str  = string + ''
      var code = str.charCodeAt(0)
      if (code >= 0xD800 && code <= 0xDBFF)
      {
        var hi = code
        if (str.length === 1)
        {
          return code
        }
        var low = str.charCodeAt(1)
        return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000
      }
      if (code >= 0xDC00 && code <= 0xDFFF)
      {
        return code
      }
      return code
    },

    // Copied from http://locutus.io/php/strings/bin2hex/
    bin2Hex: function (s)
    {
      var i
      var l
      var o = ''
      var n
      s += ''
      for (i = 0, l = s.length; i < l; i++)
      {
        n = s.charCodeAt(i).toString(16)
        o += n.length < 2 ? '0' + n : n
      }
      return o
    },

    // Copied from http://locutus.io/php/strings/html_entity_decode/
    htmlEntityDecode: function (string, quoteStyle)
    {
      var tmpStr  = string.toString()
      var entity  = ''
      var symbol  = ''
      var hashMap = getHtmlTranslationTable('HTML_ENTITIES', quoteStyle)
      if (hashMap === false)
      {
        return false
      }
      delete (hashMap['&'])
      hashMap['&'] = '&amp;'
      for (symbol in hashMap)
      {
        entity = hashMap[symbol]
        tmpStr = tmpStr.split(entity).join(symbol)
      }
      tmpStr = tmpStr.split('&#039;').join("'")
      return tmpStr
    },

    objectKeys: function (o)
    {
      var k = []
      var p
      for (p in o)
      {
        if (Object.prototype.hasOwnProperty.call(o, p))
        {
          k.push(p)
        }
      }
      return k
    },

    htmlEntities: function (string, quoteStyle, charset, doubleEncode)
    {
      var hashMap = getHtmlTranslationTable('HTML_ENTITIES', quoteStyle)
      var keys
      string      = string === null ? '' : string + ''
      if (!hashMap)
      {
        return false
      }

      if (quoteStyle && quoteStyle === 'ENT_QUOTES')
      {
        hashMap["'"] = '&#039;'
      }
      doubleEncode = doubleEncode === null || !!doubleEncode
      keys         = Object.keys ? Object.keys(hashMap) : phpJs.objectKeys(hashMap)
      var regex    = new RegExp('&(?:#\\d+|#x[\\da-f]+|[a-zA-Z][\\da-z]*);|[' +
        keys.join('')
          .replace(/([()[\]{}\-.*+?^$|/\\])/g, '\\$1') + ']', 'g')

      return string.replace(regex, function (ent)
      {
        if (ent.length > 1)
        {
          return doubleEncode ? hashMap['&'] + ent.substr(1) : ent
        }
        return hashMap[ent]
      })
    },

    rawUrlDecode: function (string)
    {
      return decodeURIComponent((string + '').replace(/%(?![\da-f]{2})/gi, function ()
      {
        // PHP tolerates poorly formed escape sequences
        return '%25'
      }))
    },

    rawUrlEncode: function (string)
    {
      string = (string + '')
      return encodeURIComponent(string)
        .replace(/!/g, '%21')
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29')
        .replace(/\*/g, '%2A')
    },

    sprintf: function ()
    {
      var regex  = /%%|%(\d+\$)?([-+'#0 ]*)(\*\d+\$|\*|\d+)?(?:\.(\*\d+\$|\*|\d+))?([scboxXuideEfFgG])/g
      var a      = arguments
      var i      = 0
      var format = a[i++]

      var _pad = function (str, len, chr, leftJustify)
      {
        if (!chr)
        {
          chr = ' '
        }
        var padding = (str.length >= len) ? '' : new Array(1 + len - str.length >>> 0).join(chr)
        return leftJustify ? str + padding : padding + str
      }

      var justify = function (value, prefix, leftJustify, minWidth, zeroPad, customPadChar)
      {
        var diff = minWidth - value.length
        if (diff > 0)
        {
          if (leftJustify || !zeroPad)
          {
            value = _pad(value, minWidth, customPadChar, leftJustify)
          }
          else
          {
            value = [
              value.slice(0, prefix.length),
              _pad('', diff, '0', true),
              value.slice(prefix.length)
            ].join('')
          }
        }
        return value
      }

      var _formatBaseX = function (value, base, prefix, leftJustify, minWidth, precision, zeroPad)
      {
        // Note: casts negative numbers to positive ones
        var number = value >>> 0
        prefix     = (prefix && number && {
          '2' : '0b',
          '8' : '0',
          '16': '0x'
        }[base]) || ''
        value      = prefix + _pad(number.toString(base), precision || 0, '0', false)
        return justify(value, prefix, leftJustify, minWidth, zeroPad)
      }

      // _formatString()
      var _formatString = function (value, leftJustify, minWidth, precision, zeroPad, customPadChar)
      {
        if (precision !== null && precision !== undefined)
        {
          value = value.slice(0, precision)
        }
        return justify(value, '', leftJustify, minWidth, zeroPad, customPadChar)
      }

      // doFormat()
      var doFormat = function (substring, valueIndex, flags, minWidth, precision, type)
      {
        var number,
            prefix,
            method,
            textTransform,
            value

        if (substring === '%%')
        {
          return '%'
        }

        // parse flags
        var leftJustify    = false
        var positivePrefix = ''
        var zeroPad        = false
        var prefixBaseX    = false
        var customPadChar  = ' '
        var flagsl         = flags.length
        var j
        for (j = 0; j < flagsl; j++)
        {
          switch (flags.charAt(j))
          {
            case ' ':
              positivePrefix = ' '
              break
            case '+':
              positivePrefix = '+'
              break
            case '-':
              leftJustify = true
              break
            case "'":
              customPadChar = flags.charAt(j + 1)
              break
            case '0':
              zeroPad       = true
              customPadChar = '0'
              break
            case '#':
              prefixBaseX = true
              break
          }
        }

        // parameters may be null, undefined, empty-string or real valued
        // we want to ignore null, undefined and empty-string values
        if (!minWidth)
        {
          minWidth = 0
        }
        else if (minWidth === '*')
        {
          minWidth = +a[i++]
        }
        else if (minWidth.charAt(0) === '*')
        {
          minWidth = +a[minWidth.slice(1, -1)]
        }
        else
        {
          minWidth = +minWidth
        }

        // Note: undocumented perl feature:
        if (minWidth < 0)
        {
          minWidth    = -minWidth
          leftJustify = true
        }

        if (!isFinite(minWidth))
        {
          throw new Error('sprintf: (minimum-)width must be finite')
        }

        if (!precision)
        {
          precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type === 'd') ? 0 : undefined
        }
        else if (precision === '*')
        {
          precision = +a[i++]
        }
        else if (precision.charAt(0) === '*')
        {
          precision = +a[precision.slice(1, -1)]
        }
        else
        {
          precision = +precision
        }

        // grab value using valueIndex if required?
        value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++]

        switch (type)
        {
          case 's':
            return _formatString(value + '', leftJustify, minWidth, precision, zeroPad, customPadChar)
          case 'c':
            return _formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad)
          case 'b':
            return _formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad)
          case 'o':
            return _formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad)
          case 'x':
            return _formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad)
          case 'X':
            return _formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad).toUpperCase()
          case 'u':
            return _formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad)
          case 'i':
          case 'd':
            number = +value || 0
            // Plain Math.round doesn't just truncate
            number = Math.round(number - number % 1)
            prefix = number < 0 ? '-' : positivePrefix
            value  = prefix + _pad(String(Math.abs(number)), precision, '0', false)
            return justify(value, prefix, leftJustify, minWidth, zeroPad)
          case 'e':
          case 'E':
          case 'f': // @todo: Should handle locales (as per setlocale)
          case 'F':
          case 'g':
          case 'G':
            number        = +value
            prefix        = number < 0 ? '-' : positivePrefix
            method        = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())]
            textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(type) % 2]
            value         = prefix + Math.abs(number)[method](precision)
            return phpJs.justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]()
          default:
            return substring
        }
      }

      return format.replace(regex, doFormat)
    },

    makeTimeStamp: function (s)
    {
      if (!s)
      {
        return Math.floor(new Date().getTime() / 1000)
      }
      if (isNaN(s))
      {
        var tm = phpJs.strtotime(s)
        if (tm === -1 || tm === false)
        {
          return Math.floor(new Date().getTime() / 1000)
        }
        return tm
      }
      s = s + ''
      if (s.length === 14 && s.search(/^[\d]+$/g) !== -1)
      {
        // it is mysql timestamp format of YYYYMMDDHHMMSS?
        return phpJs.mktime(s.substr(8, 2), s.substr(10, 2), s.substr(12, 2), s.substr(4, 2), s.substr(6, 2), s.substr(0, 4))
      }
      return Number(s)
    },

    mktime: function ()
    {
      var d = new Date()
      var r = arguments
      var i = 0
      var e = ['Hours', 'Minutes', 'Seconds', 'Month', 'Date', 'FullYear']

      for (i = 0; i < e.length; i++)
      {
        if (typeof r[i] === 'undefined')
        {
          r[i] = d['get' + e[i]]()
          // +1 to fix JS months.
          r[i] += (i === 3)
        }
        else
        {
          r[i] = parseInt(r[i], 10)
          if (isNaN(r[i]))
          {
            return false
          }
        }
      }

      r[5] += (r[5] >= 0 ? (r[5] <= 69 ? 2e3 : (r[5] <= 100 ? 1900 : 0)) : 0)
      d.setFullYear(r[5], r[3] - 1, r[4])
      d.setHours(r[0], r[1], r[2])
      var time = d.getTime()
      return (time / 1e3 >> 0) - (time < 0)
    },

    _pad: function (str, len, chr, leftJustify)
    {
      if (!chr)
      {
        chr = ' '
      }
      var padding = (str.length >= len) ? '' : new Array(1 + len - str.length >>> 0).join(chr)
      return leftJustify ? str + padding : padding + str
    },

    justify: function (value, prefix, leftJustify, minWidth, zeroPad, customPadChar)
    {
      var diff = minWidth - value.length
      if (diff > 0)
      {
        if (leftJustify || !zeroPad)
        {
          value = phpJs._pad(value, minWidth, customPadChar, leftJustify)
        }
        else
        {
          value = [
            value.slice(0, prefix.length),
            phpJs._pad('', diff, '0', true),
            value.slice(prefix.length)
          ].join('')
        }
      }
      return value
    },

    strtotime: function (text, now)
    {
      var parsed
      var match
      var today
      var year
      var date
      var days
      var ranges
      var len
      var times
      var regex
      var i
      var fail = false

      if (!text)
      {
        return fail
      }

      text = text.replace(/^\s+|\s+$/g, '')
        .replace(/\s{2,}/g, ' ')
        .replace(/[\t\r\n]/g, '')
        .toLowerCase()

      var pattern = new RegExp([
        '^(\\d{1,4})',
        '([\\-\\.\\/:])',
        '(\\d{1,2})',
        '([\\-\\.\\/:])',
        '(\\d{1,4})',
        '(?:\\s(\\d{1,2}):(\\d{2})?:?(\\d{2})?)?',
        '(?:\\s([A-Z]+)?)?$'
      ].join(''))
      match       = text.match(pattern)

      if (match && match[2] === match[4])
      {
        if (match[1] > 1901)
        {
          switch (match[2])
          {
            case '-':
              // YYYY-M-D
              if (match[3] > 12 || match[5] > 31)
              {
                return fail
              }

              return new Date(match[1], parseInt(match[3], 10) - 1, match[5],
                match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000
            case '.':
              // YYYY.M.D is not parsed by strtotime()
              return fail
            case '/':
              // YYYY/M/D
              if (match[3] > 12 || match[5] > 31)
              {
                return fail
              }

              return new Date(match[1], parseInt(match[3], 10) - 1, match[5],
                match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000
          }
        }
        else if (match[5] > 1901)
        {
          switch (match[2])
          {
            case '-':
              // D-M-YYYY
              if (match[3] > 12 || match[1] > 31)
              {
                return fail
              }

              return new Date(match[5], parseInt(match[3], 10) - 1, match[1],
                match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000
            case '.':
              // D.M.YYYY
              if (match[3] > 12 || match[1] > 31)
              {
                return fail
              }

              return new Date(match[5], parseInt(match[3], 10) - 1, match[1],
                match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000
            case '/':
              // M/D/YYYY
              if (match[1] > 12 || match[3] > 31)
              {
                return fail
              }

              return new Date(match[5], parseInt(match[1], 10) - 1, match[3],
                match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000
          }
        }
        else
        {
          switch (match[2])
          {
            case '-':
              // YY-M-D
              if (match[3] > 12 || match[5] > 31 || (match[1] < 70 && match[1] > 38))
              {
                return fail
              }

              year = match[1] >= 0 && match[1] <= 38 ? +match[1] + 2000 : match[1]
              return new Date(year, parseInt(match[3], 10) - 1, match[5],
                match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000
            case '.':
              // D.M.YY or H.MM.SS
              if (match[5] >= 70)
              {
                // D.M.YY
                if (match[3] > 12 || match[1] > 31)
                {
                  return fail
                }

                return new Date(match[5], parseInt(match[3], 10) - 1, match[1],
                  match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000
              }
              if (match[5] < 60 && !match[6])
              {
                // H.MM.SS
                if (match[1] > 23 || match[3] > 59)
                {
                  return fail
                }

                today = new Date()
                return new Date(today.getFullYear(), today.getMonth(), today.getDate(),
                  match[1] || 0, match[3] || 0, match[5] || 0, match[9] || 0) / 1000
              }

              // invalid format, cannot be parsed
              return fail
            case '/':
              // M/D/YY
              if (match[1] > 12 || match[3] > 31 || (match[5] < 70 && match[5] > 38))
              {
                return fail
              }

              year = match[5] >= 0 && match[5] <= 38 ? +match[5] + 2000 : match[5]
              return new Date(year, parseInt(match[1], 10) - 1, match[3],
                match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000
            case ':':
              // HH:MM:SS
              if (match[1] > 23 || match[3] > 59 || match[5] > 59)
              {
                return fail
              }

              today = new Date()
              return new Date(today.getFullYear(), today.getMonth(), today.getDate(),
                match[1] || 0, match[3] || 0, match[5] || 0) / 1000
          }
        }
      }

      if (text === 'now')
      {
        return now === null || isNaN(now)
          ? new Date().getTime() / 1000 | 0
          : now | 0
      }

      if (!isNaN(parsed = Date.parse(text)))
      {
        return parsed / 1000 | 0
      }

      pattern = new RegExp([
        '^([0-9]{4}-[0-9]{2}-[0-9]{2})',
        '[ t]',
        '([0-9]{2}:[0-9]{2}:[0-9]{2}(\\.[0-9]+)?)',
        '([\\+-][0-9]{2}(:[0-9]{2})?|z)'
      ].join(''))
      match   = text.match(pattern)
      if (match)
      {
        // @todo: time zone information
        if (match[4] === 'z')
        {
          match[4] = 'Z'
        }
        else if (match[4].match(/^([+-][0-9]{2})$/))
        {
          match[4] = match[4] + ':00'
        }

        if (!isNaN(parsed = Date.parse(match[1] + 'T' + match[2] + match[4])))
        {
          return parsed / 1000 | 0
        }
      }

      date   = now ? new Date(now * 1000) : new Date()
      days   = {
        'sun': 0,
        'mon': 1,
        'tue': 2,
        'wed': 3,
        'thu': 4,
        'fri': 5,
        'sat': 6
      }
      ranges = {
        'yea': 'FullYear',
        'mon': 'Month',
        'day': 'Date',
        'hou': 'Hours',
        'min': 'Minutes',
        'sec': 'Seconds'
      }

      function lastNext(type, range, modifier)
      {
        var diff
        var day = days[range]

        if (typeof day !== 'undefined')
        {
          diff = day - date.getDay()

          if (diff === 0)
          {
            diff = 7 * modifier
          }
          else if (diff > 0 && type === 'last')
          {
            diff -= 7
          }
          else if (diff < 0 && type === 'next')
          {
            diff += 7
          }

          date.setDate(date.getDate() + diff)
        }
      }

      function process(val)
      {
        var splt         = val.split(' ')
        var type         = splt[0]
        var range        = splt[1].substring(0, 3)
        var typeIsNumber = /\d+/.test(type)
        var ago          = splt[2] === 'ago'
        var num          = (type === 'last' ? -1 : 1) * (ago ? -1 : 1)

        if (typeIsNumber)
        {
          num *= parseInt(type, 10)
        }

        if (ranges.hasOwnProperty(range) && !splt[1].match(/^mon(day|\.)?$/i))
        {
          return date['set' + ranges[range]](date['get' + ranges[range]]() + num)
        }

        if (range === 'wee')
        {
          return date.setDate(date.getDate() + (num * 7))
        }

        if (type === 'next' || type === 'last')
        {
          lastNext(type, range, num)
        }
        else if (!typeIsNumber)
        {
          return false
        }

        return true
      }

      times = '(years?|months?|weeks?|days?|hours?|minutes?|min|seconds?|sec' +
        '|sunday|sun\\.?|monday|mon\\.?|tuesday|tue\\.?|wednesday|wed\\.?' +
        '|thursday|thu\\.?|friday|fri\\.?|saturday|sat\\.?)'
      regex = '([+-]?\\d+\\s' + times + '|' + '(last|next)\\s' + times + ')(\\sago)?'

      match = text.match(new RegExp(regex, 'gi'))
      if (!match)
      {
        return fail
      }

      for (i = 0, len = match.length; i < len; i++)
      {
        if (!process(match[i]))
        {
          return fail
        }
      }

      return (date.getTime() / 1000)
    },

    strftime: function (fmt, timestamp)
    {
      var _xPad = function (x, pad, r)
      {
        if (typeof r === 'undefined')
        {
          r = 10
        }
        for (; parseInt(x, 10) < r && r > 1; r /= 10)
        {
          x = pad.toString() + x
        }
        return x.toString()
      }

      // Only english
      var lcTime = {
        a: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        // ABDAY_
        A: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        // DAY_
        b: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        // ABMON_
        B: [
          'January', 'February', 'March', 'April', 'May', 'June', 'July',
          'August', 'September', 'October',
          'November', 'December'
        ],
        // MON_
        c: '%a %d %b %Y %r %Z',
        // D_T_FMT // changed %T to %r per results
        p: ['AM', 'PM'],
        // AM_STR/PM_STR
        P: ['am', 'pm'],
        // Not available in nl_langinfo()
        r: '%I:%M:%S %p',
        // T_FMT_AMPM (Fixed for all locales)
        x: '%m/%d/%Y',
        // D_FMT // switched order of %m and %d; changed %y to %Y (C uses %y)
        X: '%r',
        // T_FMT // changed from %T to %r  (%T is default for C, not English US)
        // Following are from nl_langinfo() or http://www.cptec.inpe.br/sx4/sx4man2/g1ab02e/strftime.4.html
        alt_digits: '',
        // e.g., ordinal
        ERA        : '',
        ERA_YEAR   : '',
        ERA_D_T_FMT: '',
        ERA_D_FMT  : '',
        ERA_T_FMT  : ''
      }

      var _formats = {
        a: function (d)
        {
          return lcTime.a[d.getDay()]
        },
        A: function (d)
        {
          return lcTime.A[d.getDay()]
        },
        b: function (d)
        {
          return lcTime.b[d.getMonth()]
        },
        B: function (d)
        {
          return lcTime.B[d.getMonth()]
        },
        C: function (d)
        {
          return _xPad(parseInt(d.getFullYear() / 100, 10), 0)
        },
        d: ['getDate', '0'],
        e: ['getDate', ' '],
        g: function (d)
        {
          return _xPad(parseInt(this.G(d) / 100, 10), 0) // eslint-disable-line new-cap
        },
        G: function (d)
        {
          var y = d.getFullYear()
          var V = parseInt(_formats.V(d), 10) // eslint-disable-line new-cap
          var W = parseInt(_formats.W(d), 10) // eslint-disable-line new-cap

          if (W > V)
          {
            y++
          }
          else if (W === 0 && V >= 52)
          {
            y--
          }

          return y
        },
        H: ['getHours', '0'],
        I: function (d)
        {
          var I = d.getHours() % 12
          return _xPad(I === 0 ? 12 : I, 0)
        },
        j: function (d)
        {
          var ms = d - new Date('' + d.getFullYear() + '/1/1 GMT')
          // Line differs from Yahoo implementation which would be
          // equivalent to replacing it here with:
          ms += d.getTimezoneOffset() * 60000
          var doy = parseInt(ms / 60000 / 60 / 24, 10) + 1
          return _xPad(doy, 0, 100)
        },
        k: ['getHours', '0'],
        // not in PHP, but implemented here (as in Yahoo)
        l  : function (d)
        {
          var l = d.getHours() % 12
          return _xPad(l === 0 ? 12 : l, ' ')
        },
        m  : function (d)
        {
          return _xPad(d.getMonth() + 1, 0)
        },
        M  : ['getMinutes', '0'],
        p  : function (d)
        {
          return lcTime.p[d.getHours() >= 12 ? 1 : 0]
        },
        P  : function (d)
        {
          return lcTime.P[d.getHours() >= 12 ? 1 : 0]
        },
        s  : function (d)
        {
          // Yahoo uses return parseInt(d.getTime()/1000, 10);
          return Date.parse(d) / 1000
        },
        S  : ['getSeconds', '0'],
        u  : function (d)
        {
          var dow = d.getDay()
          return ((dow === 0) ? 7 : dow)
        },
        U  : function (d)
        {
          var doy  = parseInt(_formats.j(d), 10)
          var rdow = 6 - d.getDay()
          var woy  = parseInt((doy + rdow) / 7, 10)
          return _xPad(woy, 0)
        },
        V  : function (d)
        {
          var woy   = parseInt(_formats.W(d), 10) // eslint-disable-line new-cap
          var dow11 = (new Date('' + d.getFullYear() + '/1/1')).getDay()
          // First week is 01 and not 00 as in the case of %U and %W,
          // so we add 1 to the final result except if day 1 of the year
          // is a Monday (then %W returns 01).
          // We also need to subtract 1 if the day 1 of the year is
          // Friday-Sunday, so the resulting equation becomes:
          var idow = woy + (dow11 > 4 || dow11 <= 1 ? 0 : 1)
          if (idow === 53 && (new Date('' + d.getFullYear() + '/12/31')).getDay() < 4)
          {
            idow = 1
          }
          else if (idow === 0)
          {
            idow = _formats.V(new Date('' + (d.getFullYear() - 1) + '/12/31')) // eslint-disable-line new-cap
          }
          return _xPad(idow, 0)
        },
        w  : 'getDay',
        W  : function (d)
        {
          var doy  = parseInt(_formats.j(d), 10)
          var rdow = 7 - _formats.u(d)
          var woy  = parseInt((doy + rdow) / 7, 10)
          return _xPad(woy, 0, 10)
        },
        y  : function (d)
        {
          return _xPad(d.getFullYear() % 100, 0)
        },
        Y  : 'getFullYear',
        z  : function (d)
        {
          var o = d.getTimezoneOffset()
          var H = _xPad(parseInt(Math.abs(o / 60), 10), 0)
          var M = _xPad(o % 60, 0)
          return (o > 0 ? '-' : '+') + H + M
        },
        Z  : function (d)
        {
          return d.toString().replace(/^.*\(([^)]+)\)$/, '$1')
        },
        '%': function (d)
        {
          return '%'
        }
      }

      var _date = (typeof timestamp === 'undefined')
        ? new Date()
        : (timestamp instanceof Date)
          ? new Date(timestamp)
          : new Date(timestamp * 1000)

      var _aggregates = {
        c: 'locale',
        D: '%m/%d/%y',
        F: '%y-%m-%d',
        h: '%b',
        n: '\n',
        r: 'locale',
        R: '%H:%M',
        t: '\t',
        T: '%H:%M:%S',
        x: 'locale',
        X: 'locale'
      }

      // First replace aggregates (run in a loop because an agg may be made up of other aggs)
      while (fmt.match(/%[cDFhnrRtTxX]/))
      {
        fmt = fmt.replace(/%([cDFhnrRtTxX])/g, function (m0, m1)
        {
          var f = _aggregates[m1]
          return (f === 'locale' ? lcTime[m1] : f)
        })
      }

      // Now replace formats - we need a closure so that the date object gets passed through
      var str = fmt.replace(/%([aAbBCdegGHIjklmMpPsSuUVwWyYzZ%])/g, function (m0, m1)
      {
        var f = _formats[m1]
        if (typeof f === 'string')
        {
          return _date[f]()
        }
        else if (typeof f === 'function')
        {
          return f(_date)
        }
        else if (typeof f === 'object' && typeof f[0] === 'string')
        {
          return _xPad(_date[f[0]](), f[1])
        }
        else
        {
          // Shouldn't reach here
          return m1
        }
      })

      return str
    }
  }


  Latte.prototype.registerPlugin(
    'modifier',
    'capitalize',
    function (s, upDigits, lcRest)
    {
      if (typeof s !== 'string')
      {
        return s
      }
      var re    = new RegExp(upDigits ? '[^a-zA-Z_\u00E0-\u00FC]+' : '[^a-zA-Z0-9_\u00E0-\u00FC]')
      var found = null
      var res   = ''
      if (lcRest)
      {
        s = s.toLowerCase()
      }
      var word
      for (found = s.match(re); found; found = s.match(re))
      {
        word = s.slice(0, found.index)
        if (word.match(/\d/))
        {
          res += word
        }
        else
        {
          res += word.charAt(0).toUpperCase() + word.slice(1)
        }
        res += s.slice(found.index, found.index + found[0].length)
        s = s.slice(found.index + found[0].length)
      }
      if (s.match(/\d/))
      {
        return res + s
      }
      return res + s.charAt(0).toUpperCase() + s.slice(1)
    }
  )

  Latte.prototype.registerPlugin(
    'modifier',
    'cat',
    function (s, value)
    {
      value = value || ''
      return String(s) + value
    }
  )

  Latte.prototype.registerPlugin(
    'modifier',
    'count',
    function (a)
    {
      if (a instanceof Array)
      {
        return a.length
      }
      else if (typeof a === 'object')
      {
        if (Object.keys)
        {
          return Object.keys(a).length
        }
        else
        {
          var l = 0
          for (var k in a)
          {
            if (a.hasOwnProperty(k))
            {
              ++l
            }
          }
          return l
        }
      }
      return 0
    }
  )

  Latte.prototype.registerPlugin(
    'modifier',
    'count_characters',
    function (s, includeWhitespaces)
    {
      s = String(s)
      return includeWhitespaces ? s.length : s.replace(/\s/g, '').length
    }
  )

  Latte.prototype.registerPlugin(
    'modifier',
    'count_paragraphs',
    function (s)
    {
      var found = String(s).match(/\n+/g)
      if (found)
      {
        return found.length + 1
      }
      return 1
    }
  )

  Latte.prototype.registerPlugin(
    'modifier',
    'count_sentences',
    function (s)
    {
      if (typeof s === 'string')
      {
        var found = s.match(/\w[.?!](\W|$)/g)
        if (found)
        {
          return found.length
        }
      }
      return 0
    }
  )

  Latte.prototype.registerPlugin(
    'modifier',
    'count_words',
    function (s)
    {
      if (typeof s === 'string')
      {
        var found = s.match(/\w+/g)
        if (found)
        {
          return found.length
        }
      }
      return 0
    }
  )

  Latte.prototype.registerPlugin(
    'modifier',
    'date_format',
    function (s, fmt, defaultDate)
    {
      return phpJs.strftime((fmt || '%b %e, %Y'), phpJs.makeTimeStamp((s || defaultDate)))
    }
  )

  Latte.prototype.registerPlugin(
    'modifier',
    'debug_print_var',
    function (s)
    {
      console.log(s + '--')
      // Determining environment first. If its node, we do console.logs
      // else we open new windows for browsers.
      var env = ''
      if (typeof module === 'object' && module && typeof module.exports === 'object')
      {
        env = 'node'
      }
      else if (typeof window === 'object' && window.document)
      {
        env = 'browser'
      }
      if (env === '')
      {
        // We do not know env.
        return ''
      }
      if (env === 'browser')
      {
        return Latte.prototype.printR(s)
      }
      else
      {
        console.log(s)
      }
    }
  )

  Latte.prototype.registerPlugin(
    'modifier',
    'defaultValue',
    function (s, value)
    {
      value = value || ''
      return (s && s !== 'null' && typeof s !== 'undefined') ? s : value
    }
  )

  Latte.prototype.registerPlugin(
    'modifier',
    'escape',
    function (s, escType, charSet, doubleEncode)
    {
      s            = String(s)
      escType      = escType || 'html'
      charSet      = charSet || 'UTF-8'
      doubleEncode = (typeof doubleEncode !== 'undefined') ? Boolean(doubleEncode) : true
      var res      = ''
      var i

      switch (escType)
      {
        case 'html':
        {
          if (doubleEncode)
          {
            s = s.replace(/&/g, '&amp;')
          }
          return s.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#039;').replace(/"/g, '&quot;')
        }
        case 'htmlall':
        {
          return phpJs.htmlEntities(s, 3, charSet)
        }
        case 'url':
        {
          return phpJs.rawUrlEncode(s)
        }
        case 'urlpathinfo':
        {
          return phpJs.rawUrlEncode(s).replace(/%2F/g, '/')
        }
        case 'quotes':
        {
          return s.replace(/(^|[^\\])'/g, "$1\\'")
        }
        case 'hex':
        {
          res = ''
          for (i = 0; i < s.length; ++i)
          {
            res += '%' + phpJs.bin2Hex(s.substr(i, 1)).toLowerCase()
          }
          return res
        }
        case 'hexentity':
        {
          res = ''
          for (i = 0; i < s.length; ++i)
          {
            res += '&#x' + phpJs.bin2Hex(s.substr(i, 1)) + ';'
          }
          return res
        }
        case 'decentity':
        {
          res = ''
          for (i = 0; i < s.length; ++i)
          {
            res += '&#' + phpJs.ord(s.substr(i, 1)) + ';'
          }
          return res
        }
        case 'mail':
        {
          return s.replace(/@/g, ' [AT] ').replace(/[.]/g, ' [DOT] ')
        }
        case 'nonstd':
        {
          res = ''
          for (i = 0; i < s.length; ++i)
          {
            var _ord = phpJs.ord(s.substr(i, 1))
            if (_ord >= 126)
            {
              res += '&#' + _ord + ';'
            }
            else
            {
              res += s.substr(i, 1)
            }
          }
          return res
        }
        case 'javascript':
        {
          return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/<\//g, '</')
        }
      }
      return s
    }
  )

  Latte.prototype.registerPlugin(
    'modifier',
    'from_charset',
    function (s)
    {
      // No implementation in JS. But modifier should not fail hencce this.
      return s
    }
  )

  Latte.prototype.registerPlugin(
    'modifier',
    'indent',
    function (s, repeat, indentWith)
    {
      s          = String(s)
      repeat     = repeat || 4
      indentWith = indentWith || ' '

      var indentStr = ''
      while (repeat--)
      {
        indentStr += indentWith
      }

      var tail = s.match(/\n+$/)
      return indentStr + s.replace(/\n+$/, '').replace(/\n/g, '\n' + indentStr) + (tail ? tail[0] : '')
    }
  )

  Latte.prototype.registerPlugin(
    'modifier',
    'lower',
    function (s)
    {
      return (String(s)).toLowerCase()
    }
  )

  Latte.prototype.registerPlugin(
    'modifier',
    'nl2br',
    function (s)
    {
      return String(s).replace(/\n/g, '<br />')
    }
  )

  // only modifiers (flags) 'i' and 'm' are supported
  // backslashes should be escaped e.g. \\s
  Latte.prototype.registerPlugin(
    'modifier',
    'regex_replace',
    function (s, re, replaceWith)
    {
      var pattern = re.match(/^ *\/(.*)\/(.*) *$/)
      return String(s).replace(new RegExp(pattern[1], 'g' + (pattern.length > 1 ? pattern[2] : '')), replaceWith)
    }
  )

  Latte.prototype.registerPlugin(
    'modifier',
    'replace',
    function (s, search, replaceWith)
    {
      if (!search)
      {
        return s
      }
      s           = String(s)
      search      = String(search)
      replaceWith = String(replaceWith)
      var res     = ''
      var pos     = -1
      for (pos = s.indexOf(search); pos >= 0; pos = s.indexOf(search))
      {
        res += s.slice(0, pos) + replaceWith
        pos += search.length
        s = s.slice(pos)
      }
      return res + s
    }
  )

  Latte.prototype.registerPlugin(
    'modifier',
    'spacify',
    function (s, space)
    {
      if (!space)
      {
        space = ' '
      }
      return String(s).replace(/(\n|.)(?!$)/g, '$1' + space)
    }
  )

  Latte.prototype.registerPlugin(
    'modifier',
    'string_format',
    function (s, fmt)
    {
      return phpJs.sprintf(fmt, s)
    }
  )

  Latte.prototype.registerPlugin(
    'modifier',
    'strip',
    function (s, replaceWith)
    {
      replaceWith = replaceWith || ' '
      return String(s).replace(/[\s]+/g, replaceWith)
    }
  )

  Latte.prototype.registerPlugin(
    'modifier',
    'strip_tags',
    function (s, addSpaceOrTagsToExclude, tagsToExclude)
    {
      if (addSpaceOrTagsToExclude === null)
      {
        addSpaceOrTagsToExclude = true
      }
      if (!tagsToExclude)
      {
        if (addSpaceOrTagsToExclude !== true && addSpaceOrTagsToExclude !== false && ((addSpaceOrTagsToExclude + '').length > 0))
        {
          tagsToExclude           = addSpaceOrTagsToExclude
          addSpaceOrTagsToExclude = true
        }
      }
      if (tagsToExclude)
      {
        var filters = tagsToExclude.split('>')
        filters.splice(-1, 1)
        s = String(s).replace(/<[^>]*?>/g, function (match, offset, contents)
        {
          var tagName = match.match(/\w+/)
          for (var i = 0; i < filters.length; i++)
          {
            var tagName2 = (filters[i] + '>').match(/\w+/)
            if (tagName[0] === tagName2[0])
            {
              return match
            }
          }
          return addSpaceOrTagsToExclude ? ' ' : ''
        })
        return s
      }
      return String(s).replace(/<[^>]*?>/g, addSpaceOrTagsToExclude ? ' ' : '')
    }
  )

  Latte.prototype.registerPlugin(
    'modifier',
    'to_charset',
    function (s)
    {
      // No implementation in JS. But modifier should not fail hencce this.
      return s
    }
  )

  Latte.prototype.registerPlugin(
    'modifier',
    'truncate',
    function (s, length, etc, breakWords, middle)
    {
      s      = String(s)
      length = length || 80
      etc    = (etc != null) ? etc : '...'

      if (s.length <= length)
      {
        return s
      }

      length -= Math.min(length, etc.length)
      if (middle)
      {
        // one of floor()'s should be replaced with ceil() but it so in Latte
        return s.slice(0, Math.floor(length / 2)) + etc + s.slice(s.length - Math.floor(length / 2))
      }

      if (!breakWords)
      {
        s = s.slice(0, length + 1).replace(/\s+?(\S+)?$/, '')
      }

      return s.slice(0, length) + etc
    }
  )

  Latte.prototype.registerPlugin(
    'modifier',
    'unescape',
    function (s, escType, charSet)
    {
      s       = String(s)
      escType = escType || 'html'
      charSet = charSet || 'UTF-8'

      switch (escType)
      {
        case 'html':
        {
          return s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#039;/g, "'").replace(/&quot;/g, '"')
        }
        case 'entity':
        {
          return phpJs.htmlEntityDecode(s, 1)
        }
        case 'htmlall':
        {
          return phpJs.htmlEntityDecode(s, 1)
        }
        case 'url':
        {
          return phpJs.rawUrlDecode(s)
        }
      }
      return s
    }
  )

  Latte.prototype.registerPlugin(
    'modifier',
    'upper',
    function (s)
    {
      return (String(s)).toUpperCase()
    }
  )

  Latte.prototype.registerPlugin(
    'modifier',
    'wordwrap',
    function (s, width, wrapWith, breakWords)
    {
      width    = width || 80
      wrapWith = wrapWith || '\n'

      var lines = String(s).split('\n')
      for (var i = 0; i < lines.length; ++i)
      {
        var line  = lines[i]
        var parts = ''
        while (line.length > width)
        {
          var pos   = 0
          var found = line.slice(pos).match(/\s+/)
          for (; found && (pos + found.index) <= width; found = line.slice(pos).match(/\s+/))
          {
            pos += found.index + found[0].length
          }
          pos = (breakWords ? (width - 1) : (pos || (found ? found.index + found[0].length : line.length)))
          parts += line.slice(0, pos).replace(/\s+$/, '')
          if (pos < line.length)
          {
            parts += wrapWith
          }
          line = line.slice(pos)
        }
        lines[i] = parts + line
      }
      return lines.join('\n')
    }
  )
Latte.prototype.registerPlugin(
    'function',
    '__quoted',
    function (params, data)
    {
      return params.join('')
    }
  )

  // Register __array which gets called for all arrays.
  Latte.prototype.registerPlugin(
    'function',
    '__array',
    function (params, data)
    {
      var a = []
      for (var name in params)
      {
        if (params.hasOwnProperty(name) && params[name] && typeof params[name] !== 'function')
        {
          a[name] = params[name]
        }
      }
      return a
    }
  )

  // Register __func which gets called for all modifiers and function calls.
  Latte.prototype.registerPlugin(
    'function',
    '__func',
    function (params, data)
    {
      var paramData = []
      var i
      var fname

      for (i = 0; i < params.length; ++i)
      {
        paramData.push(params[i])
      }

      if (('__owner' in data && params.name in data.__owner))
      {
        fname = data['__owner']
        if (params.length)
        {
          return fname[params.name].apply(fname, params)
        }
        else
        {
          // When function doesn't has arguments.
          return fname[params.name].apply(fname)
        }
      }
      else if (Latte.prototype.modifiers.hasOwnProperty(params.name))
      {
        fname = Latte.prototype.modifiers[params.name]
        return fname.apply(fname, paramData)
      }
      else
      {
        fname = params.name
        var func
        if (typeof module === 'object' && module && typeof module.exports === 'object')
        {
          func = global[fname]
        }
        else
        {
          if (typeof window === 'object' && window.document)
          {
            func = window[fname]
          }
          else if (global)
          {
            func = global[fname]
          }
        }

        if (data[fname])
        {
          return data[fname].apply(data[fname], paramData)
        }
        else if (func)
        {
          return func.apply(func, paramData)
        }
        // something went wrong.
        return ''
      }
    }
  )
// All built in but custom functions

  Latte.prototype.registerPlugin(
    'function',
    'counter',
    function (params, data)
    {
      var name = params.__get('name', 'default')
      if (name in data.latte.counter)
      {
        var counter = data.latte.counter[name]
        if ('start' in params)
        {
          counter.value = parseInt(params['start'], 10)
        }
        else
        {
          counter.value = parseInt(counter.value, 10)
          counter.skip  = parseInt(counter.skip, 10)
          if (counter.direction === 'down')
          {
            counter.value -= counter.skip
          }
          else
          {
            counter.value += counter.skip
          }
        }
        counter.skip              = params.__get('skip', counter.skip)
        counter.direction         = params.__get('direction', counter.direction)
        counter.assign            = params.__get('assign', counter.assign)
        data.latte.counter[name] = counter
      }
      else
      {
        data.latte.counter[name] = {
          value    : parseInt(params.__get('start', 1), 10),
          skip     : parseInt(params.__get('skip', 1), 10),
          direction: params.__get('direction', 'up'),
          assign   : params.__get('assign', false)
        }
      }
      if (data.latte.counter[name].assign)
      {
        data[data.latte.counter[name].assign] = data.latte.counter[name].value
        return ''
      }
      if (params.__get('print', true))
      {
        return data.latte.counter[name].value
      }
      // User didn't assign and also said, print false.
      return ''
    }
  )

  Latte.prototype.registerPlugin(
    'function',
    'cycle',
    function (params, data)
    {
      var name  = params.__get('name', 'default')
      var reset = params.__get('reset', false)
      if (!(name in data.latte.cycle))
      {
        data.latte.cycle[name] = {arr: [''], delimiter: params.__get('delimiter', ','), index: 0}
        reset                   = true
      }

      if (params.__get('delimiter', false))
      {
        data.latte.cycle[name].delimiter = params.delimiter
      }
      var values = params.__get('values', false)
      if (values)
      {
        var arr = []
        if (values instanceof Object)
        {
          for (var nm in values)
          {
            arr.push(values[nm])
          }
        }
        else
        {
          arr = values.split(data.latte.cycle[name].delimiter)
        }

        if (arr.length !== data.latte.cycle[name].arr.length || arr[0] !== data.latte.cycle[name].arr[0])
        {
          data.latte.cycle[name].arr   = arr
          data.latte.cycle[name].index = 0
          reset                         = true
        }
      }

      if (params.__get('advance', 'true'))
      {
        data.latte.cycle[name].index += 1
      }
      if (data.latte.cycle[name].index >= data.latte.cycle[name].arr.length || reset)
      {
        data.latte.cycle[name].index = 0
      }

      if (params.__get('assign', false))
      {
        this.assignVar(params.assign, data.latte.cycle[name].arr[data.latte.cycle[name].index], data)
        return ''
      }

      if (params.__get('print', true))
      {
        return data.latte.cycle[name].arr[data.latte.cycle[name].index]
      }

      return ''
    }
  )

  Latte.prototype.registerPlugin(
    'function',
    'eval',
    function (params, data)
    {
      var s = params.var
      if ('assign' in params)
      {
        this.assignVar(params.assign, s, data)
        return ''
      }
      return s
    }
  )

  Latte.prototype.registerPlugin(
    'function',
    'debug',
    function (params, data)
    {
      // Determining environment first. If its node, we do console.logs
      // else we open new windows for browsers.
      var env = ''
      if (typeof module === 'object' && module && typeof module.exports === 'object')
      {
        env = 'node'
      }
      else if (typeof window === 'object' && window.document)
      {
        env = 'browser'
      }
      if (env === '')
      {
        // We do not know env.
        return ''
      }
      if (env === 'browser')
      {
        if (window.latteJsDebug)
        {
          window.latteJsDebug.close()
        }
        window.latteJsDebug   = window.open('', '', 'width=680, height=600,resizable,scrollbars=yes')
        var includedTemplates = ''
        var assignedVars      = ''
        var i                 = 0
        for (var j in data.includedTemplates)
        {
          includedTemplates += '<tr class=' + (++i % 2 ? 'odd' : 'even') + '><td>' + data.includedTemplates[j] + '</td></tr>'
        }
        if (includedTemplates !== '')
        {
          includedTemplates = '<h2>included templates</h2><table>' + includedTemplates + '</table><br>'
        }
        i = 0
        for (var name in data.assignedVars)
        {
          assignedVars += '<tr class=' + (++i % 2 ? 'odd' : 'even') + '><td>[' + name + ']</td><td>' + Latte.prototype.printR(data.assignedVars[name]) + '</td></tr>'
        }
        if (assignedVars !== '')
        {
          assignedVars = '<h2>assigned template variables</h2><table>' + assignedVars + '<table>'
        }
        var html = '<!DOCTYPE html>' +
          '<html>' +
          '<head>' +
          '<title>LatteJS Debug Console</title>' +
          '<style type=\'text/css\'>' +
          'table {width: 100%;}' +
          'td {vertical-align:top;}' +
          '.odd td {background-color: #eee;}' +
          '.even td {background-color: #dadada;}' +
          '</style>' +
          '</head>' +
          '<body>' +
          '<h1>LatteJS Debug Console</h1><br><pre>' +
          includedTemplates +
          assignedVars +
          '</pre></body>' +
          '</html>'
        window.latteJsDebug.document.write(html)
      }
      else
      {
        // env is node.
        // we stringify because tools show updated version of object in console.
        if (typeof console !== 'undefined')
        {
          console.log('included templates:- ' + JSON.stringify(includedTemplates))
          console.log('assigned template variables:- ' + JSON.stringify(assignedVars))
        }
      }
      return ''
    }
  )

  Latte.prototype.registerPlugin(
    'function',
    'fetch',
    function (params, data)
    {
      var s = Latte.prototype.getFile(params.__get('file', null, 0))
      if ('assign' in params)
      {
        this.assignVar(params.assign, s, data)
        return ''
      }
      return s
    }
  )

  Latte.prototype.registerPlugin(
    'function',
    'html_checkboxes',
    function (params, data)
    {
      var type      = params.__get('type', 'checkbox')
      var name      = params.__get('name', type)
      var realName  = name
      var values    = params.__get('values', params.options)
      var output    = params.__get('options', [])
      var useName   = ('options' in params)
      var selected  = params.__get('selected', false)
      var separator = params.__get('separator', '')
      var labels    = Boolean(params.__get('labels', true))
      var labelIds  = Boolean(params.__get('label_ids', false))
      var p
      var res       = []
      var i         = 0
      var s         = ''
      var value
      var id

      if (type === 'checkbox')
      {
        name += '[]'
      }

      if (!useName)
      {
        for (p in params.output)
        {
          output.push(params.output[p])
        }
      }

      for (p in values)
      {
        if (values.hasOwnProperty(p))
        {
          value = (useName ? p : values[p])
          id    = realName + '_' + value
          s     = (labels ? (labelIds ? '<label for="' + id + '">' : '<label>') : '')
          s += '<input type="' + type + '" name="' + name + '" value="' + value + '" '
          if (labelIds)
          {
            s += 'id="' + id + '" '
          }
          if (selected == (useName ? p : values[p]))
          { // eslint-disable-line eqeqeq
            s += 'checked="checked" '
          }
          s += '/>' + output[useName ? p : i++]
          s += (labels ? '</label>' : '')
          s += separator
          res.push(s)
        }
      }

      if ('assign' in params)
      {
        this.assignVar(params.assign, res, data)
        return ''
      }
      return res.join('\n')
    }
  )

  Latte.prototype.registerPlugin(
    'function',
    'html_image',
    function (params, data)
    {
      var url        = params.__get('file', null)
      var width      = params.__get('width', false)
      var height     = params.__get('height', false)
      var alt        = params.__get('alt', '')
      var href       = params.__get('href', params.__get('link', false))
      var pathPrefix = params.__get('path_prefix', '')
      var paramNames = {file: 1, width: 1, height: 1, alt: 1, href: 1, basedir: 1, pathPrefix: 1, link: 1}
      var s          = '<img src="' + pathPrefix + url + '"' + ' alt="' + alt + '"' + (width ? ' width="' + width + '"' : '') + (height ? ' height="' + height + '"' : '')
      var p

      for (p in params)
      {
        if (params.hasOwnProperty(p) && typeof params[p] === 'string')
        {
          if (!(p in paramNames))
          {
            s += ' ' + p + '="' + params[p] + '"'
          }
        }
      }
      s += ' />'
      return href ? '<a href="' + href + '">' + s + '</a>' : s
    }
  )

  Latte.prototype.registerPlugin(
    'function',
    'html_options',
    function (params, data)
    {
      var values  = params.__get('values', params.options)
      var output  = params.__get('options', [])
      var useName = ('options' in params)
      var p
      if (!useName)
      {
        for (p in params.output)
        {
          output.push(params.output[p])
        }
      }
      var selected = params.__get('selected', false)
      var res      = []
      var s        = ''
      var i        = 0
      var j
      if (selected instanceof Array)
      {
        // We convert each value of array to string because values
        // is array of string. Otherwise comparision fails.
        for (j in selected)
        {
          if (selected.hasOwnProperty(j))
          {
            selected[j] = selected[j] + ''
          }
        }
      }
      else if (typeof selected !== 'boolean')
      {
        selected = [selected + '']
      }

      for (p in values)
      {
        if (values.hasOwnProperty(p))
        {
          s = '<option value="' + (useName ? p : values[p]) + '"'
          if (selected && selected.indexOf((useName ? p : values[p])) !== -1)
          {
            s += ' selected="selected"'
          }
          s += '>' + output[useName ? p : i++] + '</option>'
          res.push(s)
        }
      }
      var name = params.__get('name', false)
      return (name ? ('<select name="' + name + '">\n' + res.join('\n') + '\n</select>') : res.join('\n')) + '\n'
    }
  )

  Latte.prototype.registerPlugin(
    'function',
    'html_radios',
    function (params, data)
    {
      params.type = 'radio'
      return this.plugins.html_checkboxes.process(params, data)
    }
  )

  Latte.prototype.registerPlugin(
    'function',
    'html_select_date',
    function (params, data)
    {
      var prefix        = params.__get('prefix', 'Date_')
      var d             = new Date()
      var startYear     = Number(params.__get('start_year', d.getFullYear()))
      var endYear       = Number(params.__get('end_year', startYear))
      var displayDays   = params.__get('display_days', true)
      var displayMonths = params.__get('display_months', true)
      var displayYears  = params.__get('display_years', true)
      var reverseYears  = params.__get('reverse_years', false)
      var months        = [
        '',
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ]
      var s             = '<select name="' + prefix + 'Month">\n'
      var i             = 0
      var selected

      if ((startYear > endYear && !reverseYears) || (startYear < endYear && reverseYears))
      {
        var temp  = endYear
        endYear   = startYear
        startYear = temp
      }

      if (displayMonths)
      {
        for (i = 1; i < months.length; ++i)
        {
          selected = (i === (d.getMonth() + 1)) ? ' selected="selected"' : ''
          s += '<option value="' + i + '"' + selected + '>' + months[i] + '</option>\n'
        }
        s += '</select>\n'
      }

      if (displayDays)
      {
        s += '<select name="' + prefix + 'Day">\n'
        for (i = 1; i <= 31; ++i)
        {
          selected = (i === d.getDate()) ? ' selected="selected"' : ''
          s += '<option value="' + i + '"' + selected + '>' + i + '</option>\n'
        }
        s += '</select>\n'
      }

      if (displayYears)
      {
        var op = startYear > endYear ? -1 : 1
        s += '<select name="' + prefix + 'Year">\n'
        for (i = startYear; ((op > 0) ? (i <= endYear) : (i >= endYear)); i += op)
        {
          selected = (i === d.getFullYear()) ? ' selected="selected"' : ''
          s += '<option value="' + i + '"' + selected + '>' + i + '</option>\n'
        }
        s += '</select>\n'
      }

      return s
    }
  )

  Latte.prototype.registerPlugin(
    'function',
    'html_table',
    function (params, data)
    {
      var rows      = params.__get('rows', false)
      var cols      = params.__get('cols', false)
      var inner     = params.__get('inner', 'cols')
      var caption   = params.__get('caption', '')
      var tableAttr = params.__get('table_attr', 'border="1"')
      var thAttr    = params.__get('th_attr', false)
      var trAttr    = params.__get('tr_attr', false)
      var tdAttr    = params.__get('td_attr', false)
      var trailpad  = params.__get('trailpad', '&nbsp;')
      var hdir      = params.__get('hdir', 'right')
      var vdir      = params.__get('vdir', 'down')
      var loop      = []
      var p
      if (params.loop instanceof Array)
      {
        loop = params.loop
      }
      else
      {
        for (p in params.loop)
        {
          if (params.loop.hasOwnProperty(p))
          {
            loop.push(params.loop[p])
          }
        }
      }

      if (!cols)
      {
        cols = rows ? Math.ceil(loop.length / rows) : 3
      }
      var colNames = []
      if (isNaN(cols))
      {
        if (typeof cols === 'object')
        {
          for (p in cols)
          {
            if (cols.hasOwnProperty(p))
            {
              colNames.push(cols[p])
            }
          }
        }
        else
        {
          colNames = cols.split(/\s*,\s*/)
        }
        cols = colNames.length
      }
      rows = rows || Math.ceil(loop.length / cols)

      if (thAttr && typeof thAttr !== 'object')
      {
        thAttr = [thAttr]
      }

      if (trAttr && typeof trAttr !== 'object')
      {
        trAttr = [trAttr]
      }

      if (tdAttr && typeof tdAttr !== 'object')
      {
        tdAttr = [tdAttr]
      }

      var s = ''
      var idx
      for (var row = 0; row < rows; ++row)
      {
        s += '<tr' + (trAttr ? ' ' + trAttr[row % trAttr.length] : '') + '>\n'
        for (var col = 0; col < cols; ++col)
        {
          idx = (inner === 'cols') ? ((vdir === 'down' ? row : rows - 1 - row) * cols + (hdir === 'right' ? col : cols - 1 - col)) : ((hdir === 'right' ? col : cols - 1 - col) * rows + (vdir === 'down' ? row : rows - 1 - row))
          s += '<td' + (tdAttr ? ' ' + tdAttr[col % tdAttr.length] : '') + '>' + (idx < loop.length ? loop[idx] : trailpad) + '</td>\n'
        }
        s += '</tr>\n'
      }

      var sHead = ''
      if (colNames.length)
      {
        sHead = '\n<thead><tr>'
        for (var i = 0; i < colNames.length; ++i)
        {
          sHead += '\n<th' + (thAttr ? ' ' + thAttr[i % thAttr.length] : '') + '>' + colNames[hdir === 'right' ? i : colNames.length - 1 - i] + '</th>'
        }
        sHead += '\n</tr></thead>'
      }

      return '<table ' + tableAttr + '>' + (caption ? '\n<caption>' + caption + '</caption>' : '') + sHead + '\n<tbody>\n' + s + '</tbody>\n</table>\n'
    }
  )

  Latte.prototype.registerPlugin(
    'function',
    'mailto',
    function (params, data)
    {
      var address    = params.__get('address', null)
      var encode     = params.__get('encode', 'none')
      var text       = params.__get('text', address)
      var cc         = phpJs.rawUrlEncode(params.__get('cc', '')).replace(/%40/g, '@').replace(/%2C/g, ',')
      var bcc        = phpJs.rawUrlEncode(params.__get('bcc', '')).replace(/%40/g, '@').replace(/%2C/g, ',')
      var followupto = phpJs.rawUrlEncode(params.__get('followupto', '')).replace(/%40/g, '@').replace(/%2C/g, ',')
      var subject    = phpJs.rawUrlEncode(params.__get('subject', ''))
      var newsgroups = phpJs.rawUrlEncode(params.__get('newsgroups', ''))
      var extra      = params.__get('extra', '')
      var s
      var i

      address += (cc ? '?cc=' + cc : '')
      address += (bcc ? (cc ? '&' : '?') + 'bcc=' + bcc : '')
      address += (subject ? ((cc || bcc) ? '&' : '?') + 'subject=' + subject : '')
      address += (newsgroups ? ((cc || bcc || subject) ? '&' : '?') + 'newsgroups=' + newsgroups : '')
      address += (followupto ? ((cc || bcc || subject || newsgroups) ? '&' : '?') + 'followupto=' + followupto : '')

      s = '<a href="mailto:' + address + '" ' + extra + '>' + text + '</a>'

      if (encode === 'javascript')
      {
        s            = "document.write('" + s + "');"
        var sEncoded = ''
        for (i = 0; i < s.length; ++i)
        {
          sEncoded += '%' + phpJs.bin2Hex(s.substr(i, 1))
        }
        return '<script type="text/javascript">eval(unescape(\'' + sEncoded + "'))</script>"
      }
      else if (encode === 'javascript_charcode')
      {
        var codes = []
        for (i = 0; i < s.length; ++i)
        {
          codes.push(phpJs.ord(s.substr(i, 1)))
        }
        return '<script type="text/javascript" language="javascript">\n<!--\n{document.write(String.fromCharCode(' + codes.join(',') + '))}\n//-->\n</script>\n'
      }
      else if (encode === 'hex')
      {
        if (address.match(/^.+\?.+$/))
        {
          throw new Error('mailto: hex encoding does not work with extra attributes. Try javascript.')
        }
        var aEncoded = ''
        for (i = 0; i < address.length; ++i)
        {
          if (address.substr(i, 1).match(/\w/))
          {
            aEncoded += '%' + phpJs.bin2Hex(address.substr(i, 1))
          }
          else
          {
            aEncoded += address.substr(i, 1)
          }
        }
        aEncoded     = aEncoded.toLowerCase()
        var tEncoded = ''
        for (i = 0; i < text.length; ++i)
        {
          tEncoded += '&#x' + phpJs.bin2Hex(text.substr(i, 1)) + ';'
        }
        tEncoded = tEncoded.toLowerCase()
        return '<a href="&#109;&#97;&#105;&#108;&#116;&#111;&#58;' + aEncoded + '" ' + extra + '>' + tEncoded + '</a>'
      }
      return s
    }
  )

  Latte.prototype.registerPlugin(
    'function',
    'math',
    function (params, data)
    {
      var equation = params.__get('equation', null).replace(/pi\(\s*\)/g, 'PI')
      equation     = equation.replace(/ceil/g, 'Math.ceil')
        .replace(/abs/g, 'Math.abs')
        .replace(/cos/g, 'Math.cos')
        .replace(/exp/g, 'Math.exp')
        .replace(/floor/g, 'Math.floor')
        .replace(/log/g, 'Math.log')
        .replace(/max/g, 'Math.max')
        .replace(/min/g, 'Math.min')
        .replace(/PI/g, 'Math.PI')
        .replace(/pow/g, 'Math.pow')
        .replace(/rand/g, 'Math.rand')
        .replace(/round/g, 'Math.round')
        .replace(/sin/g, 'Math.sin')
        .replace(/sqrt/g, 'Math.sqrt')
        .replace(/srans/g, 'Math.srans')
        .replace(/tan/g, 'Math.tan')

      var words  = equation.match(/\w+/g)
      var i
      var j
      var tmp
      var banned = [
        'ceil', 'abs', 'cos', 'exp', 'floor', 'log10', 'log',
        'max', 'min', 'pi', 'pow', 'rand', 'round', 'sin', 'sqrt', 'srans', 'tan'
      ]

      for (i = 0; i < words.length; i++)
      {
        for (j = 0; j < (words.length - 1); j++)
        {
          if ((words[j] + '').length > (words[j + 1] + '').length)
          {
            tmp          = words[j]
            words[j]     = words[j + 1]
            words[j + 1] = tmp
          }
        }
      }

      for (i = 0; i < words.length; i++)
      {
        if (words[i] in params && banned.indexOf(words[i]) === -1)
        {
          equation = equation.replace(words[i], params[words[i]])
        }
      }
      var res = eval(equation) // eslint-disable-line no-eval

      if ('format' in params)
      {
        res = Number(phpJs.sprintf(params.format, res))
      }

      if ('assign' in params)
      {
        this.assignVar(params.assign, res, data)
        return ''
      }
      return res
    }
  )

  Latte.prototype.registerPlugin(
    'block',
    'textformat',
    function (params, content, data, repeat)
    {
      if (!content)
      {
        return ''
      }

      content = String(content)

      var wrap           = params.__get('wrap', 80)
      var wrapChar       = params.__get('wrap_char', '\n')
      var wrapCut        = params.__get('wrap_cut', false)
      var indentChar     = params.__get('indent_char', ' ')
      var indent         = params.__get('indent', 0)
      var indentStr      = (new Array(indent + 1)).join(indentChar)
      var indentFirst    = params.__get('indent_first', 0)
      var indentFirstStr = (new Array(indentFirst + 1)).join(indentChar)

      var style = params.__get('style', '')

      if (style === 'email')
      {
        wrap = 72
      }

      var paragraphs = content.split(/[\r\n]{2}/)
      for (var i = 0; i < paragraphs.length; ++i)
      {
        var p = paragraphs[i]
        if (!p)
        {
          continue
        }
        p = p.replace(/^\s+|\s+$/, '').replace(/\s+/g, ' ')
        if (indentFirst > 0)
        {
          p = indentFirstStr + p
        }
        p = this.modifiers.wordwrap(p, wrap - indent, wrapChar, wrapCut)
        if (indent > 0)
        {
          p = p.replace(/^/mg, indentStr)
        }
        paragraphs[i] = p
      }
      var s = paragraphs.join(wrapChar + wrapChar)
      if ('assign' in params)
      {
        this.assignVar(params.assign, s, data)
        return ''
      }
      return s
    }
  )



  String.prototype.fetch = function (data)
  { // eslint-disable-line no-extend-native
    var template = new Latte(this)
    return template.fetch(data)
  }

  return Latte
})
;(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
function findReplace(string, find, replace) {
	replace = replace != null ? replace : '';

	if (typeof string !== 'string') {
		return string;
	}

	var pattern, regex;
	if ((pattern = find.match(/^ *\/(.*)\/(.*) *$/))) {
		regex = new RegExp(pattern[1], 'g' + (pattern.length > 1 ? pattern[2] : ''));
	} else {
		regex = new RegExp(find, 'g');
	}

	return string.replace(regex, replace);
}

module.exports = findReplace;
},{}],2:[function(require,module,exports){
function getUID(length, characters) {
	var charactersLength, result = '';

	length = length != null ? length : 7;
	characters = characters != null ? characters : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	charactersLength = characters.length;

	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}

	return result;
}

function getiUID(length) {
	return getUID(length, 'abcdefghijklmnopqrstuvwxyz0123456789');
}

function getUID16(length) {
	return getUID(length, '0123456789abcdef')
}

module.exports = getUID;

module.exports.getiUID = getiUID;

module.exports.getUID16 = getUID16;

},{}],3:[function(require,module,exports){
function hasKeys(object, path) {
	var keys = path.split('.');

	for (var index in keys) {
		object = object[keys[index]];
		if (typeof object === 'undefined') {
			return false;
		}
	}

	return true;
}

module.exports = hasKeys;
},{}],4:[function(require,module,exports){
function isArrayLikeObject(value) {
	function isLength(length) {
		return typeof length == 'number' && length > -1;
	}

	return value !== null && typeof value == 'object' && isLength(value.length);
}

module.exports = isArrayLikeObject;
},{}],5:[function(require,module,exports){
var isEmptyStrict = require('./isEmptyStrict');

function isEmptyLoose(value) {
	if (isEmptyStrict(value)) {
		return true;
	}

	return ['undefined', 'null', 'false'].indexOf(String(value)) > -1;
}

module.exports = isEmptyLoose;
},{"./isEmptyStrict":6}],6:[function(require,module,exports){
function isEmptyStrict(value) {
	if (typeof value === 'object') {
		for (var key in value) {
			if (value.hasOwnProperty(key) || typeof value[key] !== 'function') {
				return false;
			}
		}
		return true;
	}

	return [undefined, false, 0, '0', ''].indexOf(value) > -1;
}

module.exports = isEmptyStrict;
},{}],7:[function(require,module,exports){
var isEmptyLoose = require('./isEmptyLoose');

function isNotEmptyLoose(value) {
	return !isEmptyLoose(value);
}

module.exports = isNotEmptyLoose;
},{"./isEmptyLoose":5}],8:[function(require,module,exports){
var isSetLoose = require('./isSetLoose');

function isNotSetLoose(value) {
	return !isSetLoose(value);
}

module.exports = isNotSetLoose;
},{"./isSetLoose":12}],9:[function(require,module,exports){
var isSetTag = require('./isSetTag');

function isNotSetTag(value) {
	return !isSetTag(value);
}

module.exports = isNotSetTag;
},{"./isSetTag":13}],10:[function(require,module,exports){
function isObject(value) {
	return (typeof value == 'object' || typeof value == 'function') && value !== null;
}

module.exports = isObject;
},{}],11:[function(require,module,exports){
function isObjectLike(value) {
	return typeof value == 'object' && value !== null;
}

module.exports = isObjectLike;
},{}],12:[function(require,module,exports){
function isSetLoose(value) {
	return ['undefined', 'null'].indexOf(String(value)) === -1;
}

module.exports = isSetLoose;
},{}],13:[function(require,module,exports){
function isSetTag(value) {
	return ['undefined', 'null'].indexOf(String(value)) === -1 && value !== '';
}

module.exports = isSetTag;
},{}],14:[function(require,module,exports){
function round(value, precision) {
	precision |= 0;

	if (precision === 0) {
		return Math.round(value);
	}

	var m = Math.pow(10, precision);
	return Math.round(value * m) / m;
}

module.exports = round;
},{}],15:[function(require,module,exports){
var toString = require('./toString');

function substr(string, start, length, validatePositions) {
	length = length != null ? length : null;
	validatePositions = validatePositions != null ? validatePositions : false;

	string = toString(string);
	start |= 0;
	length = ~~(length) || undefined;
	var end = string.length;

	if (start < 0) {
		start += end;
	}

	if (length != null) {
		end = length + (length > 0 ? start : end);
	}

	validatePositions && start > end && (start = [end, end = start][0]);

	return string.slice(start, end);
}

module.exports = substr;
},{"./toString":20}],16:[function(require,module,exports){
function toArray(value, delimiter) {
	if (typeof value === 'undefined' || value === null) {
		return [];
	}

	if (typeof value === 'string') {
		return value.length > 0 ? value.split(delimiter != null ? delimiter : '') : [value];
	}

	if (Array.isArray(value) || typeof value === 'object') {
		var arr = [];
		for (var key in value) {
			if (Array.isArray(value) || value.hasOwnProperty(key) || typeof value.constructor === 'function') {
				arr.push(value[key]);
			}
		}
		return arr;
	}

	return [value];
}

module.exports = toArray;
},{}],17:[function(require,module,exports){
function toAssociativeValues(value) {
	if (typeof value === 'undefined') {
		return [];
	}

	if (typeof value !== 'object' || value === null) {
		return [value];
	}

	var arr = [];

	for (var key in value) {
		if (value.hasOwnProperty(key) || typeof value[key] !== 'function') {
			arr.push(value[key]);
		}
	}

	return arr;
}

module.exports = toAssociativeValues;
},{}],18:[function(require,module,exports){
var toNumber = require('./toNumber');

function toBytes(value, precision) {
	if (value == null || +value == 0) {
		return '0 B';
	}

	if (value === true || typeof value === 'function') {
		return '1 B';
	}

	if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'bigint') {
		for (var key in value) {
			if (value.hasOwnProperty(key)) {
				return '1 B';
			}
		}
		return '0 B';
	}

	var bytes = +(String(value).replace(/^\s+|\s+$/g, ''));

	if (isNaN(bytes)) {
		return '1 B';
	}

	var units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
	var end = units.slice(-1)[0];
	var unit = units[0];

	for (var i = 0, len = units.length; i < len; i++) {
		unit = units[i];
		if ((Math.abs(bytes) || 0) < 1024 || unit === end) {
			break;
		}
		bytes = bytes / 1024;
	}

	return toNumber(bytes, (precision != null ? precision : 2)) + ' ' + unit;
}

module.exports = toBytes;
},{"./toNumber":19}],19:[function(require,module,exports){
var round = require('./round');

function toNumber(value, precision) {
	precision = precision != null ? precision : null;

	if (['number', 'boolean', 'string'].indexOf(typeof value) > -1) {
		if (typeof value == 'string') {
			value = value.replace(/^\s+|\s+$/g, '');
		}

		return precision != null ? round(+value, precision) : +value;
	}

	return value === null ? 0 : NaN;
}

module.exports = toNumber;
},{"./round":14}],20:[function(require,module,exports){
function toString(value, glue, keyGlue) {
	if (typeof value === 'string') {
		return value;
	}

	if (value == null) {
		return '';
	}

	glue = glue != null ? glue : ',';
	keyGlue = typeof keyGlue != 'undefined' ? keyGlue : '=';

	if (typeof value === 'object' || typeof value === 'function') {
		var str = '', currentGlue = '';
		for (var key in value) {
			if (value.hasOwnProperty(key) || typeof value[key] !== 'function') {
				str += currentGlue + ((keyGlue && key != ~~key ? key + keyGlue : '') + value[key]);
				currentGlue = glue;
			}
		}
		return str;
	}

	if (String(value) == '0' && (1 / value) == -(1 / 0)) {
		return '-0';
	}

	return String(value);
}

module.exports = toString;
},{}],21:[function(require,module,exports){
'use strict';

var reSpace = '[ \\t]+';
var reSpaceOpt = '[ \\t]*';
var reMeridian = '(?:([ap])\\.?m\\.?([\\t ]|$))';
var reHour24 = '(2[0-4]|[01]?[0-9])';
var reHour24lz = '([01][0-9]|2[0-4])';
var reHour12 = '(0?[1-9]|1[0-2])';
var reMinute = '([0-5]?[0-9])';
var reMinutelz = '([0-5][0-9])';
var reSecond = '(60|[0-5]?[0-9])';
var reSecondlz = '(60|[0-5][0-9])';
var reFrac = '(?:\\.([0-9]+))';

var reDayfull = 'sunday|monday|tuesday|wednesday|thursday|friday|saturday';
var reDayabbr = 'sun|mon|tue|wed|thu|fri|sat';
var reDaytext = reDayfull + '|' + reDayabbr + '|weekdays?';

var reReltextnumber = 'first|second|third|fourth|fifth|sixth|seventh|eighth?|ninth|tenth|eleventh|twelfth';
var reReltexttext = 'next|last|previous|this';
var reReltextunit = '(?:second|sec|minute|min|hour|day|fortnight|forthnight|month|year)s?|weeks|' + reDaytext;

var reYear = '([0-9]{1,4})';
var reYear2 = '([0-9]{2})';
var reYear4 = '([0-9]{4})';
var reYear4withSign = '([+-]?[0-9]{4})';
var reMonth = '(1[0-2]|0?[0-9])';
var reMonthlz = '(0[0-9]|1[0-2])';
var reDay = '(?:(3[01]|[0-2]?[0-9])(?:st|nd|rd|th)?)';
var reDaylz = '(0[0-9]|[1-2][0-9]|3[01])';

var reMonthFull = 'january|february|march|april|may|june|july|august|september|october|november|december';
var reMonthAbbr = 'jan|feb|mar|apr|may|jun|jul|aug|sept?|oct|nov|dec';
var reMonthroman = 'i[vx]|vi{0,3}|xi{0,2}|i{1,3}';
var reMonthText = '(' + reMonthFull + '|' + reMonthAbbr + '|' + reMonthroman + ')';

var reTzCorrection = '((?:GMT)?([+-])' + reHour24 + ':?' + reMinute + '?)';
var reDayOfYear = '(00[1-9]|0[1-9][0-9]|[12][0-9][0-9]|3[0-5][0-9]|36[0-6])';
var reWeekOfYear = '(0[1-9]|[1-4][0-9]|5[0-3])';

var reDateNoYear = reMonthText + '[ .\\t-]*' + reDay + '[,.stndrh\\t ]*';

function processMeridian(hour, meridian) {
	meridian = meridian && meridian.toLowerCase();

	switch (meridian) {
		case 'a':
			hour += hour === 12 ? -12 : 0;
			break;
		case 'p':
			hour += hour !== 12 ? 12 : 0;
			break;
	}

	return hour;
}

function processYear(yearStr) {
	var year = +yearStr;

	if (yearStr.length < 4 && year < 100) {
		year += year < 70 ? 2000 : 1900;
	}

	return year;
}

function lookupMonth(monthStr) {
	return {
		jan: 0,
		january: 0,
		i: 0,
		feb: 1,
		february: 1,
		ii: 1,
		mar: 2,
		march: 2,
		iii: 2,
		apr: 3,
		april: 3,
		iv: 3,
		may: 4,
		v: 4,
		jun: 5,
		june: 5,
		vi: 5,
		jul: 6,
		july: 6,
		vii: 6,
		aug: 7,
		august: 7,
		viii: 7,
		sep: 8,
		sept: 8,
		september: 8,
		ix: 8,
		oct: 9,
		october: 9,
		x: 9,
		nov: 10,
		november: 10,
		xi: 10,
		dec: 11,
		december: 11,
		xii: 11
	}[monthStr.toLowerCase()];
}

function lookupWeekday(dayStr) {
	var desiredSundayNumber = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

	var dayNumbers = {
		mon: 1,
		monday: 1,
		tue: 2,
		tuesday: 2,
		wed: 3,
		wednesday: 3,
		thu: 4,
		thursday: 4,
		fri: 5,
		friday: 5,
		sat: 6,
		saturday: 6,
		sun: 0,
		sunday: 0
	};

	return dayNumbers[dayStr.toLowerCase()] || desiredSundayNumber;
}

function lookupRelative(relText) {
	var relativeNumbers = {
		last: -1,
		previous: -1,
		this: 0,
		first: 1,
		next: 1,
		second: 2,
		third: 3,
		fourth: 4,
		fifth: 5,
		sixth: 6,
		seventh: 7,
		eight: 8,
		eighth: 8,
		ninth: 9,
		tenth: 10,
		eleventh: 11,
		twelfth: 12
	};

	var relativeBehavior = {
		this: 1
	};

	var relTextLower = relText.toLowerCase();

	return {
		amount: relativeNumbers[relTextLower],
		behavior: relativeBehavior[relTextLower] || 0
	};
}

function processTzCorrection(tzOffset, oldValue) {
	var reTzCorrectionLoose = /(?:GMT)?([+-])(\d+)(:?)(\d{0,2})/i;
	tzOffset = tzOffset && tzOffset.match(reTzCorrectionLoose);

	if (!tzOffset) {
		return oldValue;
	}

	var sign = tzOffset[1] === '-' ? 1 : -1;
	var hours = +tzOffset[2];
	var minutes = +tzOffset[4];

	if (!tzOffset[4] && !tzOffset[3]) {
		minutes = Math.floor(hours % 100);
		hours = Math.floor(hours / 100);
	}

	return sign * (hours * 60 + minutes);
}

var formats = {
	yesterday: {
		regex: /^yesterday/i,
		name: 'yesterday',
		callback: function callback() {
			this.rd -= 1;
			return this.resetTime();
		}
	},

	now: {
		regex: /^now/i,
		name: 'now'
		// do nothing
	},

	noon: {
		regex: /^noon/i,
		name: 'noon',
		callback: function callback() {
			return this.resetTime() && this.time(12, 0, 0, 0);
		}
	},

	midnightOrToday: {
		regex: /^(midnight|today)/i,
		name: 'midnight | today',
		callback: function callback() {
			return this.resetTime();
		}
	},

	tomorrow: {
		regex: /^tomorrow/i,
		name: 'tomorrow',
		callback: function callback() {
			this.rd += 1;
			return this.resetTime();
		}
	},

	timestamp: {
		regex: /^@(-?\d+)/i,
		name: 'timestamp',
		callback: function callback(match, timestamp) {
			this.rs += +timestamp;
			this.y = 1970;
			this.m = 0;
			this.d = 1;
			this.dates = 0;

			return this.resetTime() && this.zone(0);
		}
	},

	firstOrLastDay: {
		regex: /^(first|last) day of/i,
		name: 'firstdayof | lastdayof',
		callback: function callback(match, day) {
			if (day.toLowerCase() === 'first') {
				this.firstOrLastDayOfMonth = 1;
			} else {
				this.firstOrLastDayOfMonth = -1;
			}
		}
	},

	backOrFrontOf: {
		regex: RegExp('^(back|front) of ' + reHour24 + reSpaceOpt + reMeridian + '?', 'i'),
		name: 'backof | frontof',
		callback: function callback(match, side, hours, meridian) {
			var back = side.toLowerCase() === 'back';
			var hour = +hours;
			var minute = 15;

			if (!back) {
				hour -= 1;
				minute = 45;
			}

			hour = processMeridian(hour, meridian);

			return this.resetTime() && this.time(hour, minute, 0, 0);
		}
	},

	weekdayOf: {
		regex: RegExp('^(' + reReltextnumber + '|' + reReltexttext + ')' + reSpace + '(' + reDayfull + '|' + reDayabbr + ')' + reSpace + 'of', 'i'),
		name: 'weekdayof'
		// todo
	},

	mssqltime: {
		regex: RegExp('^' + reHour12 + ':' + reMinutelz + ':' + reSecondlz + '[:.]([0-9]+)' + reMeridian, 'i'),
		name: 'mssqltime',
		callback: function callback(match, hour, minute, second, frac, meridian) {
			return this.time(processMeridian(+hour, meridian), +minute, +second, +frac.substr(0, 3));
		}
	},

	timeLong12: {
		regex: RegExp('^' + reHour12 + '[:.]' + reMinute + '[:.]' + reSecondlz + reSpaceOpt + reMeridian, 'i'),
		name: 'timelong12',
		callback: function callback(match, hour, minute, second, meridian) {
			return this.time(processMeridian(+hour, meridian), +minute, +second, 0);
		}
	},

	timeShort12: {
		regex: RegExp('^' + reHour12 + '[:.]' + reMinutelz + reSpaceOpt + reMeridian, 'i'),
		name: 'timeshort12',
		callback: function callback(match, hour, minute, meridian) {
			return this.time(processMeridian(+hour, meridian), +minute, 0, 0);
		}
	},

	timeTiny12: {
		regex: RegExp('^' + reHour12 + reSpaceOpt + reMeridian, 'i'),
		name: 'timetiny12',
		callback: function callback(match, hour, meridian) {
			return this.time(processMeridian(+hour, meridian), 0, 0, 0);
		}
	},

	soap: {
		regex: RegExp('^' + reYear4 + '-' + reMonthlz + '-' + reDaylz + 'T' + reHour24lz + ':' + reMinutelz + ':' + reSecondlz + reFrac + reTzCorrection + '?', 'i'),
		name: 'soap',
		callback: function callback(match, year, month, day, hour, minute, second, frac, tzCorrection) {
			return this.ymd(+year, month - 1, +day) && this.time(+hour, +minute, +second, +frac.substr(0, 3)) && this.zone(processTzCorrection(tzCorrection));
		}
	},

	wddx: {
		regex: RegExp('^' + reYear4 + '-' + reMonth + '-' + reDay + 'T' + reHour24 + ':' + reMinute + ':' + reSecond),
		name: 'wddx',
		callback: function callback(match, year, month, day, hour, minute, second) {
			return this.ymd(+year, month - 1, +day) && this.time(+hour, +minute, +second, 0);
		}
	},

	exif: {
		regex: RegExp('^' + reYear4 + ':' + reMonthlz + ':' + reDaylz + ' ' + reHour24lz + ':' + reMinutelz + ':' + reSecondlz, 'i'),
		name: 'exif',
		callback: function callback(match, year, month, day, hour, minute, second) {
			return this.ymd(+year, month - 1, +day) && this.time(+hour, +minute, +second, 0);
		}
	},

	xmlRpc: {
		regex: RegExp('^' + reYear4 + reMonthlz + reDaylz + 'T' + reHour24 + ':' + reMinutelz + ':' + reSecondlz),
		name: 'xmlrpc',
		callback: function callback(match, year, month, day, hour, minute, second) {
			return this.ymd(+year, month - 1, +day) && this.time(+hour, +minute, +second, 0);
		}
	},

	xmlRpcNoColon: {
		regex: RegExp('^' + reYear4 + reMonthlz + reDaylz + '[Tt]' + reHour24 + reMinutelz + reSecondlz),
		name: 'xmlrpcnocolon',
		callback: function callback(match, year, month, day, hour, minute, second) {
			return this.ymd(+year, month - 1, +day) && this.time(+hour, +minute, +second, 0);
		}
	},

	clf: {
		regex: RegExp('^' + reDay + '/(' + reMonthAbbr + ')/' + reYear4 + ':' + reHour24lz + ':' + reMinutelz + ':' + reSecondlz + reSpace + reTzCorrection, 'i'),
		name: 'clf',
		callback: function callback(match, day, month, year, hour, minute, second, tzCorrection) {
			return this.ymd(+year, lookupMonth(month), +day) && this.time(+hour, +minute, +second, 0) && this.zone(processTzCorrection(tzCorrection));
		}
	},

	iso8601long: {
		regex: RegExp('^t?' + reHour24 + '[:.]' + reMinute + '[:.]' + reSecond + reFrac, 'i'),
		name: 'iso8601long',
		callback: function callback(match, hour, minute, second, frac) {
			return this.time(+hour, +minute, +second, +frac.substr(0, 3));
		}
	},

	dateTextual: {
		regex: RegExp('^' + reMonthText + '[ .\\t-]*' + reDay + '[,.stndrh\\t ]+' + reYear, 'i'),
		name: 'datetextual',
		callback: function callback(match, month, day, year) {
			return this.ymd(processYear(year), lookupMonth(month), +day);
		}
	},

	pointedDate4: {
		regex: RegExp('^' + reDay + '[.\\t-]' + reMonth + '[.-]' + reYear4),
		name: 'pointeddate4',
		callback: function callback(match, day, month, year) {
			return this.ymd(+year, month - 1, +day);
		}
	},

	pointedDate2: {
		regex: RegExp('^' + reDay + '[.\\t]' + reMonth + '\\.' + reYear2),
		name: 'pointeddate2',
		callback: function callback(match, day, month, year) {
			return this.ymd(processYear(year), month - 1, +day);
		}
	},

	timeLong24: {
		regex: RegExp('^t?' + reHour24 + '[:.]' + reMinute + '[:.]' + reSecond),
		name: 'timelong24',
		callback: function callback(match, hour, minute, second) {
			return this.time(+hour, +minute, +second, 0);
		}
	},

	dateNoColon: {
		regex: RegExp('^' + reYear4 + reMonthlz + reDaylz),
		name: 'datenocolon',
		callback: function callback(match, year, month, day) {
			return this.ymd(+year, month - 1, +day);
		}
	},

	pgydotd: {
		regex: RegExp('^' + reYear4 + '\\.?' + reDayOfYear),
		name: 'pgydotd',
		callback: function callback(match, year, day) {
			return this.ymd(+year, 0, +day);
		}
	},

	timeShort24: {
		regex: RegExp('^t?' + reHour24 + '[:.]' + reMinute, 'i'),
		name: 'timeshort24',
		callback: function callback(match, hour, minute) {
			return this.time(+hour, +minute, 0, 0);
		}
	},

	iso8601noColon: {
		regex: RegExp('^t?' + reHour24lz + reMinutelz + reSecondlz, 'i'),
		name: 'iso8601nocolon',
		callback: function callback(match, hour, minute, second) {
			return this.time(+hour, +minute, +second, 0);
		}
	},

	iso8601dateSlash: {
		// eventhough the trailing slash is optional in PHP
		// here it's mandatory and inputs without the slash
		// are handled by dateslash
		regex: RegExp('^' + reYear4 + '/' + reMonthlz + '/' + reDaylz + '/'),
		name: 'iso8601dateslash',
		callback: function callback(match, year, month, day) {
			return this.ymd(+year, month - 1, +day);
		}
	},

	dateSlash: {
		regex: RegExp('^' + reYear4 + '/' + reMonth + '/' + reDay),
		name: 'dateslash',
		callback: function callback(match, year, month, day) {
			return this.ymd(+year, month - 1, +day);
		}
	},

	american: {
		regex: RegExp('^' + reMonth + '/' + reDay + '/' + reYear),
		name: 'american',
		callback: function callback(match, month, day, year) {
			return this.ymd(processYear(year), month - 1, +day);
		}
	},

	americanShort: {
		regex: RegExp('^' + reMonth + '/' + reDay),
		name: 'americanshort',
		callback: function callback(match, month, day) {
			return this.ymd(this.y, month - 1, +day);
		}
	},

	gnuDateShortOrIso8601date2: {
		// iso8601date2 is complete subset of gnudateshort
		regex: RegExp('^' + reYear + '-' + reMonth + '-' + reDay),
		name: 'gnudateshort | iso8601date2',
		callback: function callback(match, year, month, day) {
			return this.ymd(processYear(year), month - 1, +day);
		}
	},

	iso8601date4: {
		regex: RegExp('^' + reYear4withSign + '-' + reMonthlz + '-' + reDaylz),
		name: 'iso8601date4',
		callback: function callback(match, year, month, day) {
			return this.ymd(+year, month - 1, +day);
		}
	},

	gnuNoColon: {
		regex: RegExp('^t?' + reHour24lz + reMinutelz, 'i'),
		name: 'gnunocolon',
		callback: function callback(match, hour, minute) {
			// this rule is a special case
			// if time was already set once by any preceding rule, it sets the captured value as year
			switch (this.times) {
				case 0:
					return this.time(+hour, +minute, 0, this.f);
				case 1:
					this.y = hour * 100 + +minute;
					this.times++;

					return true;
				default:
					return false;
			}
		}
	},

	gnuDateShorter: {
		regex: RegExp('^' + reYear4 + '-' + reMonth),
		name: 'gnudateshorter',
		callback: function callback(match, year, month) {
			return this.ymd(+year, month - 1, 1);
		}
	},

	pgTextReverse: {
		// note: allowed years are from 32-9999
		// years below 32 should be treated as days in datefull
		regex: RegExp('^' + '(\\d{3,4}|[4-9]\\d|3[2-9])-(' + reMonthAbbr + ')-' + reDaylz, 'i'),
		name: 'pgtextreverse',
		callback: function callback(match, year, month, day) {
			return this.ymd(processYear(year), lookupMonth(month), +day);
		}
	},

	dateFull: {
		regex: RegExp('^' + reDay + '[ \\t.-]*' + reMonthText + '[ \\t.-]*' + reYear, 'i'),
		name: 'datefull',
		callback: function callback(match, day, month, year) {
			return this.ymd(processYear(year), lookupMonth(month), +day);
		}
	},

	dateNoDay: {
		regex: RegExp('^' + reMonthText + '[ .\\t-]*' + reYear4, 'i'),
		name: 'datenoday',
		callback: function callback(match, month, year) {
			return this.ymd(+year, lookupMonth(month), 1);
		}
	},

	dateNoDayRev: {
		regex: RegExp('^' + reYear4 + '[ .\\t-]*' + reMonthText, 'i'),
		name: 'datenodayrev',
		callback: function callback(match, year, month) {
			return this.ymd(+year, lookupMonth(month), 1);
		}
	},

	pgTextShort: {
		regex: RegExp('^(' + reMonthAbbr + ')-' + reDaylz + '-' + reYear, 'i'),
		name: 'pgtextshort',
		callback: function callback(match, month, day, year) {
			return this.ymd(processYear(year), lookupMonth(month), +day);
		}
	},

	dateNoYear: {
		regex: RegExp('^' + reDateNoYear, 'i'),
		name: 'datenoyear',
		callback: function callback(match, month, day) {
			return this.ymd(this.y, lookupMonth(month), +day);
		}
	},

	dateNoYearRev: {
		regex: RegExp('^' + reDay + '[ .\\t-]*' + reMonthText, 'i'),
		name: 'datenoyearrev',
		callback: function callback(match, day, month) {
			return this.ymd(this.y, lookupMonth(month), +day);
		}
	},

	isoWeekDay: {
		regex: RegExp('^' + reYear4 + '-?W' + reWeekOfYear + '(?:-?([0-7]))?'),
		name: 'isoweekday | isoweek',
		callback: function callback(match, year, week, day) {
			day = day ? +day : 1;

			if (!this.ymd(+year, 0, 1)) {
				return false;
			}

			// get day of week for Jan 1st
			var dayOfWeek = new Date(this.y, this.m, this.d).getDay();

			// and use the day to figure out the offset for day 1 of week 1
			dayOfWeek = 0 - (dayOfWeek > 4 ? dayOfWeek - 7 : dayOfWeek);

			this.rd += dayOfWeek + (week - 1) * 7 + day;
		}
	},

	relativeText: {
		regex: RegExp('^(' + reReltextnumber + '|' + reReltexttext + ')' + reSpace + '(' + reReltextunit + ')', 'i'),
		name: 'relativetext',
		callback: function callback(match, relValue, relUnit) {
			// todo: implement handling of 'this time-unit'
			// eslint-disable-next-line no-unused-vars
			var _lookupRelative = lookupRelative(relValue),
				amount = _lookupRelative.amount,
				behavior = _lookupRelative.behavior;

			switch (relUnit.toLowerCase()) {
				case 'sec':
				case 'secs':
				case 'second':
				case 'seconds':
					this.rs += amount;
					break;
				case 'min':
				case 'mins':
				case 'minute':
				case 'minutes':
					this.ri += amount;
					break;
				case 'hour':
				case 'hours':
					this.rh += amount;
					break;
				case 'day':
				case 'days':
					this.rd += amount;
					break;
				case 'fortnight':
				case 'fortnights':
				case 'forthnight':
				case 'forthnights':
					this.rd += amount * 14;
					break;
				case 'week':
				case 'weeks':
					this.rd += amount * 7;
					break;
				case 'month':
				case 'months':
					this.rm += amount;
					break;
				case 'year':
				case 'years':
					this.ry += amount;
					break;
				case 'mon':
				case 'monday':
				case 'tue':
				case 'tuesday':
				case 'wed':
				case 'wednesday':
				case 'thu':
				case 'thursday':
				case 'fri':
				case 'friday':
				case 'sat':
				case 'saturday':
				case 'sun':
				case 'sunday':
					this.resetTime();
					this.weekday = lookupWeekday(relUnit, 7);
					this.weekdayBehavior = 1;
					this.rd += (amount > 0 ? amount - 1 : amount) * 7;
					break;
				case 'weekday':
				case 'weekdays':
					// todo
					break;
			}
		}
	},

	relative: {
		regex: RegExp('^([+-]*)[ \\t]*(\\d+)' + reSpaceOpt + '(' + reReltextunit + '|week)', 'i'),
		name: 'relative',
		callback: function callback(match, signs, relValue, relUnit) {
			var minuses = signs.replace(/[^-]/g, '').length;

			var amount = +relValue * Math.pow(-1, minuses);

			switch (relUnit.toLowerCase()) {
				case 'sec':
				case 'secs':
				case 'second':
				case 'seconds':
					this.rs += amount;
					break;
				case 'min':
				case 'mins':
				case 'minute':
				case 'minutes':
					this.ri += amount;
					break;
				case 'hour':
				case 'hours':
					this.rh += amount;
					break;
				case 'day':
				case 'days':
					this.rd += amount;
					break;
				case 'fortnight':
				case 'fortnights':
				case 'forthnight':
				case 'forthnights':
					this.rd += amount * 14;
					break;
				case 'week':
				case 'weeks':
					this.rd += amount * 7;
					break;
				case 'month':
				case 'months':
					this.rm += amount;
					break;
				case 'year':
				case 'years':
					this.ry += amount;
					break;
				case 'mon':
				case 'monday':
				case 'tue':
				case 'tuesday':
				case 'wed':
				case 'wednesday':
				case 'thu':
				case 'thursday':
				case 'fri':
				case 'friday':
				case 'sat':
				case 'saturday':
				case 'sun':
				case 'sunday':
					this.resetTime();
					this.weekday = lookupWeekday(relUnit, 7);
					this.weekdayBehavior = 1;
					this.rd += (amount > 0 ? amount - 1 : amount) * 7;
					break;
				case 'weekday':
				case 'weekdays':
					// todo
					break;
			}
		}
	},

	dayText: {
		regex: RegExp('^(' + reDaytext + ')', 'i'),
		name: 'daytext',
		callback: function callback(match, dayText) {
			this.resetTime();
			this.weekday = lookupWeekday(dayText, 0);

			if (this.weekdayBehavior !== 2) {
				this.weekdayBehavior = 1;
			}
		}
	},

	relativeTextWeek: {
		regex: RegExp('^(' + reReltexttext + ')' + reSpace + 'week', 'i'),
		name: 'relativetextweek',
		callback: function callback(match, relText) {
			this.weekdayBehavior = 2;

			switch (relText.toLowerCase()) {
				case 'this':
					this.rd += 0;
					break;
				case 'next':
					this.rd += 7;
					break;
				case 'last':
				case 'previous':
					this.rd -= 7;
					break;
			}

			if (isNaN(this.weekday)) {
				this.weekday = 1;
			}
		}
	},

	monthFullOrMonthAbbr: {
		regex: RegExp('^(' + reMonthFull + '|' + reMonthAbbr + ')', 'i'),
		name: 'monthfull | monthabbr',
		callback: function callback(match, month) {
			return this.ymd(this.y, lookupMonth(month), this.d);
		}
	},

	tzCorrection: {
		regex: RegExp('^' + reTzCorrection, 'i'),
		name: 'tzcorrection',
		callback: function callback(tzCorrection) {
			return this.zone(processTzCorrection(tzCorrection));
		}
	},

	ago: {
		regex: /^ago/i,
		name: 'ago',
		callback: function callback() {
			this.ry = -this.ry;
			this.rm = -this.rm;
			this.rd = -this.rd;
			this.rh = -this.rh;
			this.ri = -this.ri;
			this.rs = -this.rs;
			this.rf = -this.rf;
		}
	},

	year4: {
		regex: RegExp('^' + reYear4),
		name: 'year4',
		callback: function callback(match, year) {
			this.y = +year;
			return true;
		}
	},

	whitespace: {
		regex: /^[ .,\t]+/,
		name: 'whitespace'
		// do nothing
	},

	dateShortWithTimeLong: {
		regex: RegExp('^' + reDateNoYear + 't?' + reHour24 + '[:.]' + reMinute + '[:.]' + reSecond, 'i'),
		name: 'dateshortwithtimelong',
		callback: function callback(match, month, day, hour, minute, second) {
			return this.ymd(this.y, lookupMonth(month), +day) && this.time(+hour, +minute, +second, 0);
		}
	},

	dateShortWithTimeLong12: {
		regex: RegExp('^' + reDateNoYear + reHour12 + '[:.]' + reMinute + '[:.]' + reSecondlz + reSpaceOpt + reMeridian, 'i'),
		name: 'dateshortwithtimelong12',
		callback: function callback(match, month, day, hour, minute, second, meridian) {
			return this.ymd(this.y, lookupMonth(month), +day) && this.time(processMeridian(+hour, meridian), +minute, +second, 0);
		}
	},

	dateShortWithTimeShort: {
		regex: RegExp('^' + reDateNoYear + 't?' + reHour24 + '[:.]' + reMinute, 'i'),
		name: 'dateshortwithtimeshort',
		callback: function callback(match, month, day, hour, minute) {
			return this.ymd(this.y, lookupMonth(month), +day) && this.time(+hour, +minute, 0, 0);
		}
	},

	dateShortWithTimeShort12: {
		regex: RegExp('^' + reDateNoYear + reHour12 + '[:.]' + reMinutelz + reSpaceOpt + reMeridian, 'i'),
		name: 'dateshortwithtimeshort12',
		callback: function callback(match, month, day, hour, minute, meridian) {
			return this.ymd(this.y, lookupMonth(month), +day) && this.time(processMeridian(+hour, meridian), +minute, 0, 0);
		}
	}
};

var resultProto = {
	// date
	y: NaN,
	m: NaN,
	d: NaN,
	// time
	h: NaN,
	i: NaN,
	s: NaN,
	f: NaN,

	// relative shifts
	ry: 0,
	rm: 0,
	rd: 0,
	rh: 0,
	ri: 0,
	rs: 0,
	rf: 0,

	// weekday related shifts
	weekday: NaN,
	weekdayBehavior: 0,

	// first or last day of month
	// 0 none, 1 first, -1 last
	firstOrLastDayOfMonth: 0,

	// timezone correction in minutes
	z: NaN,

	// counters
	dates: 0,
	times: 0,
	zones: 0,

	// helper functions
	ymd: function ymd(y, m, d) {
		if (this.dates > 0) {
			return false;
		}

		this.dates++;
		this.y = y;
		this.m = m;
		this.d = d;
		return true;
	},
	time: function time(h, i, s, f) {
		if (this.times > 0) {
			return false;
		}

		this.times++;
		this.h = h;
		this.i = i;
		this.s = s;
		this.f = f;

		return true;
	},
	resetTime: function resetTime() {
		this.h = 0;
		this.i = 0;
		this.s = 0;
		this.f = 0;
		this.times = 0;

		return true;
	},
	zone: function zone(minutes) {
		if (this.zones <= 1) {
			this.zones++;
			this.z = minutes;
			return true;
		}

		return false;
	},
	toDate: function toDate(relativeTo) {
		if (this.dates && !this.times) {
			this.h = this.i = this.s = this.f = 0;
		}

		// fill holes
		if (isNaN(this.y)) {
			this.y = relativeTo.getFullYear();
		}

		if (isNaN(this.m)) {
			this.m = relativeTo.getMonth();
		}

		if (isNaN(this.d)) {
			this.d = relativeTo.getDate();
		}

		if (isNaN(this.h)) {
			this.h = relativeTo.getHours();
		}

		if (isNaN(this.i)) {
			this.i = relativeTo.getMinutes();
		}

		if (isNaN(this.s)) {
			this.s = relativeTo.getSeconds();
		}

		if (isNaN(this.f)) {
			this.f = relativeTo.getMilliseconds();
		}

		// adjust special early
		switch (this.firstOrLastDayOfMonth) {
			case 1:
				this.d = 1;
				break;
			case -1:
				this.d = 0;
				this.m += 1;
				break;
		}

		if (!isNaN(this.weekday)) {
			var date = new Date(relativeTo.getTime());
			date.setFullYear(this.y, this.m, this.d);
			date.setHours(this.h, this.i, this.s, this.f);

			var dow = date.getDay();

			if (this.weekdayBehavior === 2) {
				// To make "this week" work, where the current day of week is a "sunday"
				if (dow === 0 && this.weekday !== 0) {
					this.weekday = -6;
				}

				// To make "sunday this week" work, where the current day of week is not a "sunday"
				if (this.weekday === 0 && dow !== 0) {
					this.weekday = 7;
				}

				this.d -= dow;
				this.d += this.weekday;
			} else {
				var diff = this.weekday - dow;

				// some PHP magic
				if (this.rd < 0 && diff < 0 || this.rd >= 0 && diff <= -this.weekdayBehavior) {
					diff += 7;
				}

				if (this.weekday >= 0) {
					this.d += diff;
				} else {
					this.d -= 7 - (Math.abs(this.weekday) - dow);
				}

				this.weekday = NaN;
			}
		}

		// adjust relative
		this.y += this.ry;
		this.m += this.rm;
		this.d += this.rd;

		this.h += this.rh;
		this.i += this.ri;
		this.s += this.rs;
		this.f += this.rf;

		this.ry = this.rm = this.rd = 0;
		this.rh = this.ri = this.rs = this.rf = 0;

		var result = new Date(relativeTo.getTime());
		// since Date constructor treats years <= 99 as 1900+
		// it can't be used, thus this weird way
		result.setFullYear(this.y, this.m, this.d);
		result.setHours(this.h, this.i, this.s, this.f);

		// note: this is done twice in PHP
		// early when processing special relatives
		// and late
		// todo: check if the logic can be reduced
		// to just one time action
		switch (this.firstOrLastDayOfMonth) {
			case 1:
				result.setDate(1);
				break;
			case -1:
				result.setMonth(result.getMonth() + 1, 0);
				break;
		}

		// adjust timezone
		if (!isNaN(this.z) && result.getTimezoneOffset() !== this.z) {
			result.setUTCFullYear(result.getFullYear(), result.getMonth(), result.getDate());

			result.setUTCHours(result.getHours(), result.getMinutes() + this.z, result.getSeconds(), result.getMilliseconds());
		}

		return result;
	}
};

module.exports = function toTime(str, now) {
	//       discuss at: https://locutus.io/php/toTime/
	//      original by: Caio Ariede (https://caioariede.com)
	//      improved by: Kevin van Zonneveld (https://kvz.io)
	//      improved by: Caio Ariede (https://caioariede.com)
	//      improved by: A. Matías Quezada (https://amatiasq.com)
	//      improved by: preuter
	//      improved by: Brett Zamir (https://brett-zamir.me)
	//      improved by: Mirko Faber
	//         input by: David
	//      bugfixed by: Wagner B. Soares
	//      bugfixed by: Artur Tchernychev
	//      bugfixed by: Stephan Bösch-Plepelits (https://github.com/plepe)
	// reimplemented by: Rafał Kukawski
	//           note 1: Examples all have a fixed timestamp to prevent
	//           note 1: tests to fail because of variable time(zones)
	//        example 1: toTime('+1 day', 1129633200)
	//        returns 1: 1129719600
	//        example 2: toTime('+1 week 2 days 4 hours 2 seconds', 1129633200)
	//        returns 2: 1130425202
	//        example 3: toTime('last month', 1129633200)
	//        returns 3: 1127041200
	//        example 4: toTime('2009-05-04 08:30:00+00')
	//        returns 4: 1241425800
	//        example 5: toTime('2009-05-04 08:30:00+02:00')
	//        returns 5: 1241418600

	if (now == null) {
		now = Math.floor(Date.now() / 1000);
	}

	// the rule order is important
	// if multiple rules match, the longest match wins
	// if multiple rules match the same string, the first match wins
	var rules = [formats.yesterday, formats.now, formats.noon, formats.midnightOrToday, formats.tomorrow, formats.timestamp, formats.firstOrLastDay, formats.backOrFrontOf,
		// formats.weekdayOf, // not yet implemented
		formats.timeTiny12, formats.timeShort12, formats.timeLong12, formats.mssqltime, formats.timeShort24, formats.timeLong24, formats.iso8601long, formats.gnuNoColon, formats.iso8601noColon, formats.americanShort, formats.american, formats.iso8601date4, formats.iso8601dateSlash, formats.dateSlash, formats.gnuDateShortOrIso8601date2, formats.gnuDateShorter, formats.dateFull, formats.pointedDate4, formats.pointedDate2, formats.dateNoDay, formats.dateNoDayRev, formats.dateTextual, formats.dateNoYear, formats.dateNoYearRev, formats.dateNoColon, formats.xmlRpc, formats.xmlRpcNoColon, formats.soap, formats.wddx, formats.exif, formats.pgydotd, formats.isoWeekDay, formats.pgTextShort, formats.pgTextReverse, formats.clf, formats.year4, formats.ago, formats.dayText, formats.relativeTextWeek, formats.relativeText, formats.monthFullOrMonthAbbr, formats.tzCorrection, formats.dateShortWithTimeShort12, formats.dateShortWithTimeLong12, formats.dateShortWithTimeShort, formats.dateShortWithTimeLong, formats.relative, formats.whitespace];

	var result = Object.create(resultProto);

	while (str.length) {
		var longestMatch = null;
		var finalRule = null;

		for (var i = 0, l = rules.length; i < l; i++) {
			var format = rules[i];

			var match = str.match(format.regex);

			if (match) {
				if (!longestMatch || match[0].length > longestMatch[0].length) {
					longestMatch = match;
					finalRule = format;
				}
			}
		}

		if (!finalRule || finalRule.callback && finalRule.callback.apply(result, longestMatch) === false) {
			return false;
		}

		str = str.substr(longestMatch[0].length);
		finalRule = null;
		longestMatch = null;
	}

	return Math.floor(result.toDate(new Date(now * 1000)) / 1000);
};
},{}],22:[function(require,module,exports){
var toTime = require('./toTime');

function toUnixTime(date, preserveJsMs) {
	date = ['undefined', 'null', 'false', 'true'].indexOf(String(date)) > -1 ? new Date() : date;
	var divisor = preserveJsMs ? 1 : 1000;

	if (date instanceof Date) {
		return parseInt((date.getTime() / divisor).toFixed(0));
	}

	if (typeof date !== 'string' && typeof date !== 'number') {
		return NaN;
	}

	if (isNaN(date)) {
		date = toTime(date);
		return isNaN(date) || date === false ? NaN : date;
	}

	if (String(date).length === 14) { // mysql timestamp format of YYYYMMDDHHMMSS
		date = String(date);
		return Math.floor((new Date(date.substr(0, 4), date.substr(4, 2) - 1, date.substr(6, 2), date.substr(8, 2), date.substr(10, 2)).getTime() / divisor));
	}

	return isNaN(date) || date === Infinity ? NaN : ~~date;
}

module.exports = toUnixTime;
},{"./toTime":21}],23:[function(require,module,exports){
function toUpperCase(s, option, preserveCase) {
	option = option != null ? option : null;
	s = preserveCase || preserveCase == null ? String(s) : String(s).toLowerCase();

	if (['first', false, 0, '0'].indexOf(option) > -1) {
		var first = s.charAt(0).toUpperCase();
		var rest = s.slice(1);

		return first + rest;
	}

	if (['words', true, 1, '1'].indexOf(option) > -1) {

		return s.replace(/^(.)|\s+(.)/g, function ($1) {
			return $1.toUpperCase();
		});
	}

	return s.toUpperCase();
}

module.exports = toUpperCase;
},{}],24:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

module.exports = function _phpCastString(value) {
  // original by: Rafał Kukawski
  //   example 1: _phpCastString(true)
  //   returns 1: '1'
  //   example 2: _phpCastString(false)
  //   returns 2: ''
  //   example 3: _phpCastString('foo')
  //   returns 3: 'foo'
  //   example 4: _phpCastString(0/0)
  //   returns 4: 'NAN'
  //   example 5: _phpCastString(1/0)
  //   returns 5: 'INF'
  //   example 6: _phpCastString(-1/0)
  //   returns 6: '-INF'
  //   example 7: _phpCastString(null)
  //   returns 7: ''
  //   example 8: _phpCastString(undefined)
  //   returns 8: ''
  //   example 9: _phpCastString([])
  //   returns 9: 'Array'
  //   example 10: _phpCastString({})
  //   returns 10: 'Object'
  //   example 11: _phpCastString(0)
  //   returns 11: '0'
  //   example 12: _phpCastString(1)
  //   returns 12: '1'
  //   example 13: _phpCastString(3.14)
  //   returns 13: '3.14'

  var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);

  switch (type) {
    case 'boolean':
      return value ? '1' : '';
    case 'string':
      return value;
    case 'number':
      if (isNaN(value)) {
        return 'NAN';
      }

      if (!isFinite(value)) {
        return (value < 0 ? '-' : '') + 'INF';
      }

      return value + '';
    case 'undefined':
      return '';
    case 'object':
      if (Array.isArray(value)) {
        return 'Array';
      }

      if (value !== null) {
        return 'Object';
      }

      return '';
    case 'function':
    // fall through
    default:
      throw new Error('Unsupported value type');
  }
};

},{}],25:[function(require,module,exports){
'use strict';

module.exports = function array_reverse(array, preserveKeys) {
  // eslint-disable-line camelcase
  //  discuss at: https://locutus.io/php/array_reverse/
  // original by: Kevin van Zonneveld (https://kvz.io)
  // improved by: Karol Kowalski
  //   example 1: array_reverse( [ 'php', '4.0', ['green', 'red'] ], true)
  //   returns 1: { 2: ['green', 'red'], 1: '4.0', 0: 'php'}

  var isArray = Object.prototype.toString.call(array) === '[object Array]';
  var tmpArr = preserveKeys ? {} : [];
  var key = void 0;

  if (isArray && !preserveKeys) {
    return array.slice(0).reverse();
  }

  if (preserveKeys) {
    var keys = [];
    for (key in array) {
      keys.push(key);
    }

    var i = keys.length;
    while (i--) {
      key = keys[i];
      // @todo: don't rely on browsers keeping keys in insertion order
      // it's implementation specific
      // eg. the result will differ from expected in Google Chrome
      tmpArr[key] = array[key];
    }
  } else {
    for (key in array) {
      tmpArr.unshift(array[key]);
    }
  }

  return tmpArr;
};

},{}],26:[function(require,module,exports){
(function (global){(function (){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

module.exports = function strftime(fmt, timestamp) {
  //       discuss at: https://locutus.io/php/strftime/
  //      original by: Blues (https://tech.bluesmoon.info/)
  // reimplemented by: Brett Zamir (https://brett-zamir.me)
  //         input by: Alex
  //      bugfixed by: Brett Zamir (https://brett-zamir.me)
  //      improved by: Brett Zamir (https://brett-zamir.me)
  //           note 1: Uses global: locutus to store locale info
  //        example 1: strftime("%A", 1062462400); // Return value will depend on date and locale
  //        returns 1: 'Tuesday'

  var setlocale = require('../strings/setlocale');

  var $global = typeof window !== 'undefined' ? window : global;
  $global.$locutus = $global.$locutus || {};
  var $locutus = $global.$locutus;

  // ensure setup of localization variables takes place
  setlocale('LC_ALL', 0);

  var _xPad = function _xPad(x, pad, r) {
    if (typeof r === 'undefined') {
      r = 10;
    }
    for (; parseInt(x, 10) < r && r > 1; r /= 10) {
      x = pad.toString() + x;
    }
    return x.toString();
  };

  var locale = $locutus.php.localeCategories.LC_TIME;
  var lcTime = $locutus.php.locales[locale].LC_TIME;

  var _formats = {
    a: function a(d) {
      return lcTime.a[d.getDay()];
    },
    A: function A(d) {
      return lcTime.A[d.getDay()];
    },
    b: function b(d) {
      return lcTime.b[d.getMonth()];
    },
    B: function B(d) {
      return lcTime.B[d.getMonth()];
    },
    C: function C(d) {
      return _xPad(parseInt(d.getFullYear() / 100, 10), 0);
    },
    d: ['getDate', '0'],
    e: ['getDate', ' '],
    g: function g(d) {
      return _xPad(parseInt(this.G(d) / 100, 10), 0);
    },
    G: function G(d) {
      var y = d.getFullYear();
      var V = parseInt(_formats.V(d), 10);
      var W = parseInt(_formats.W(d), 10);

      if (W > V) {
        y++;
      } else if (W === 0 && V >= 52) {
        y--;
      }

      return y;
    },
    H: ['getHours', '0'],
    I: function I(d) {
      var I = d.getHours() % 12;
      return _xPad(I === 0 ? 12 : I, 0);
    },
    j: function j(d) {
      var ms = d - new Date('' + d.getFullYear() + '/1/1 GMT');
      // Line differs from Yahoo implementation which would be
      // equivalent to replacing it here with:
      ms += d.getTimezoneOffset() * 60000;
      var doy = parseInt(ms / 60000 / 60 / 24, 10) + 1;
      return _xPad(doy, 0, 100);
    },
    k: ['getHours', '0'],
    // not in PHP, but implemented here (as in Yahoo)
    l: function l(d) {
      var l = d.getHours() % 12;
      return _xPad(l === 0 ? 12 : l, ' ');
    },
    m: function m(d) {
      return _xPad(d.getMonth() + 1, 0);
    },
    M: ['getMinutes', '0'],
    p: function p(d) {
      return lcTime.p[d.getHours() >= 12 ? 1 : 0];
    },
    P: function P(d) {
      return lcTime.P[d.getHours() >= 12 ? 1 : 0];
    },
    s: function s(d) {
      // Yahoo uses return parseInt(d.getTime()/1000, 10);
      return Date.parse(d) / 1000;
    },
    S: ['getSeconds', '0'],
    u: function u(d) {
      var dow = d.getDay();
      return dow === 0 ? 7 : dow;
    },
    U: function U(d) {
      var doy = parseInt(_formats.j(d), 10);
      var rdow = 6 - d.getDay();
      var woy = parseInt((doy + rdow) / 7, 10);
      return _xPad(woy, 0);
    },
    V: function V(d) {
      var woy = parseInt(_formats.W(d), 10);
      var dow11 = new Date('' + d.getFullYear() + '/1/1').getDay();
      // First week is 01 and not 00 as in the case of %U and %W,
      // so we add 1 to the final result except if day 1 of the year
      // is a Monday (then %W returns 01).
      // We also need to subtract 1 if the day 1 of the year is
      // Friday-Sunday, so the resulting equation becomes:
      var idow = woy + (dow11 > 4 || dow11 <= 1 ? 0 : 1);
      if (idow === 53 && new Date('' + d.getFullYear() + '/12/31').getDay() < 4) {
        idow = 1;
      } else if (idow === 0) {
        idow = _formats.V(new Date('' + (d.getFullYear() - 1) + '/12/31'));
      }
      return _xPad(idow, 0);
    },
    w: 'getDay',
    W: function W(d) {
      var doy = parseInt(_formats.j(d), 10);
      var rdow = 7 - _formats.u(d);
      var woy = parseInt((doy + rdow) / 7, 10);
      return _xPad(woy, 0, 10);
    },
    y: function y(d) {
      return _xPad(d.getFullYear() % 100, 0);
    },
    Y: 'getFullYear',
    z: function z(d) {
      var o = d.getTimezoneOffset();
      var H = _xPad(parseInt(Math.abs(o / 60), 10), 0);
      var M = _xPad(o % 60, 0);
      return (o > 0 ? '-' : '+') + H + M;
    },
    Z: function Z(d) {
      return d.toString().replace(/^.*\(([^)]+)\)$/, '$1');
    },
    '%': function _(d) {
      return '%';
    }
  };

  var _date = typeof timestamp === 'undefined' ? new Date() : timestamp instanceof Date ? new Date(timestamp) : new Date(timestamp * 1000);

  var _aggregates = {
    c: 'locale',
    D: '%m/%d/%y',
    F: '%y-%m-%d',
    h: '%b',
    n: '\n',
    r: 'locale',
    R: '%H:%M',
    t: '\t',
    T: '%H:%M:%S',
    x: 'locale',
    X: 'locale'
  };

  // First replace aggregates (run in a loop because an agg may be made up of other aggs)
  while (fmt.match(/%[cDFhnrRtTxX]/)) {
    fmt = fmt.replace(/%([cDFhnrRtTxX])/g, function (m0, m1) {
      var f = _aggregates[m1];
      return f === 'locale' ? lcTime[m1] : f;
    });
  }

  // Now replace formats - we need a closure so that the date object gets passed through
  var str = fmt.replace(/%([aAbBCdegGHIjklmMpPsSuUVwWyYzZ%])/g, function (m0, m1) {
    var f = _formats[m1];
    if (typeof f === 'string') {
      return _date[f]();
    } else if (typeof f === 'function') {
      return f(_date);
    } else if ((typeof f === 'undefined' ? 'undefined' : _typeof(f)) === 'object' && typeof f[0] === 'string') {
      return _xPad(_date[f[0]](), f[1]);
    } else {
      // Shouldn't reach here
      return m1;
    }
  });

  return str;
};

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../strings/setlocale":31}],27:[function(require,module,exports){
(function (process){(function (){
'use strict';

module.exports = function getenv(varname) {
  //  discuss at: https://locutus.io/php/getenv/
  // original by: Brett Zamir (https://brett-zamir.me)
  //   example 1: getenv('LC_ALL')
  //   returns 1: false

  if (typeof process !== 'undefined' || !process.env || !process.env[varname]) {
    return false;
  }

  return process.env[varname];
};

}).call(this)}).call(this,require('_process'))
},{"_process":37}],28:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

module.exports = function explode(delimiter, string, limit) {
  //  discuss at: https://locutus.io/php/explode/
  // original by: Kevin van Zonneveld (https://kvz.io)
  //   example 1: explode(' ', 'Kevin van Zonneveld')
  //   returns 1: [ 'Kevin', 'van', 'Zonneveld' ]

  if (arguments.length < 2 || typeof delimiter === 'undefined' || typeof string === 'undefined') {
    return null;
  }
  if (delimiter === '' || delimiter === false || delimiter === null) {
    return false;
  }
  if (typeof delimiter === 'function' || (typeof delimiter === 'undefined' ? 'undefined' : _typeof(delimiter)) === 'object' || typeof string === 'function' || (typeof string === 'undefined' ? 'undefined' : _typeof(string)) === 'object') {
    return {
      0: ''
    };
  }
  if (delimiter === true) {
    delimiter = '1';
  }

  // Here we go...
  delimiter += '';
  string += '';

  var s = string.split(delimiter);

  if (typeof limit === 'undefined') return s;

  // Support for limit
  if (limit === 0) limit = 1;

  // Positive limit
  if (limit > 0) {
    if (limit >= s.length) {
      return s;
    }
    return s.slice(0, limit - 1).concat([s.slice(limit - 1).join(delimiter)]);
  }

  // Negative limit
  if (-limit >= s.length) {
    return [];
  }

  s.splice(s.length + limit);
  return s;
};

},{}],29:[function(require,module,exports){
'use strict';

module.exports = function htmlspecialchars(string, quoteStyle, charset, doubleEncode) {
  //       discuss at: https://locutus.io/php/htmlspecialchars/
  //      original by: Mirek Slugen
  //      improved by: Kevin van Zonneveld (https://kvz.io)
  //      bugfixed by: Nathan
  //      bugfixed by: Arno
  //      bugfixed by: Brett Zamir (https://brett-zamir.me)
  //      bugfixed by: Brett Zamir (https://brett-zamir.me)
  //       revised by: Kevin van Zonneveld (https://kvz.io)
  //         input by: Ratheous
  //         input by: Mailfaker (https://www.weedem.fr/)
  //         input by: felix
  // reimplemented by: Brett Zamir (https://brett-zamir.me)
  //           note 1: charset argument not supported
  //        example 1: htmlspecialchars("<a href='test'>Test</a>", 'ENT_QUOTES')
  //        returns 1: '&lt;a href=&#039;test&#039;&gt;Test&lt;/a&gt;'
  //        example 2: htmlspecialchars("ab\"c'd", ['ENT_NOQUOTES', 'ENT_QUOTES'])
  //        returns 2: 'ab"c&#039;d'
  //        example 3: htmlspecialchars('my "&entity;" is still here', null, null, false)
  //        returns 3: 'my &quot;&entity;&quot; is still here'

  var optTemp = 0;
  var i = 0;
  var noquotes = false;
  if (typeof quoteStyle === 'undefined' || quoteStyle === null) {
    quoteStyle = 2;
  }
  string = string || '';
  string = string.toString();

  if (doubleEncode !== false) {
    // Put this first to avoid double-encoding
    string = string.replace(/&/g, '&amp;');
  }

  string = string.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  var OPTS = {
    ENT_NOQUOTES: 0,
    ENT_HTML_QUOTE_SINGLE: 1,
    ENT_HTML_QUOTE_DOUBLE: 2,
    ENT_COMPAT: 2,
    ENT_QUOTES: 3,
    ENT_IGNORE: 4
  };
  if (quoteStyle === 0) {
    noquotes = true;
  }
  if (typeof quoteStyle !== 'number') {
    // Allow for a single string or an array of string flags
    quoteStyle = [].concat(quoteStyle);
    for (i = 0; i < quoteStyle.length; i++) {
      // Resolve string input to bitwise e.g. 'ENT_IGNORE' becomes 4
      if (OPTS[quoteStyle[i]] === 0) {
        noquotes = true;
      } else if (OPTS[quoteStyle[i]]) {
        optTemp = optTemp | OPTS[quoteStyle[i]];
      }
    }
    quoteStyle = optTemp;
  }
  if (quoteStyle & OPTS.ENT_HTML_QUOTE_SINGLE) {
    string = string.replace(/'/g, '&#039;');
  }
  if (!noquotes) {
    string = string.replace(/"/g, '&quot;');
  }

  return string;
};

},{}],30:[function(require,module,exports){
'use strict';

module.exports = function number_format(number, decimals, decPoint, thousandsSep) {
  // eslint-disable-line camelcase
  //  discuss at: https://locutus.io/php/number_format/
  // original by: Jonas Raoni Soares Silva (https://www.jsfromhell.com)
  // improved by: Kevin van Zonneveld (https://kvz.io)
  // improved by: davook
  // improved by: Brett Zamir (https://brett-zamir.me)
  // improved by: Brett Zamir (https://brett-zamir.me)
  // improved by: Theriault (https://github.com/Theriault)
  // improved by: Kevin van Zonneveld (https://kvz.io)
  // bugfixed by: Michael White (https://getsprink.com)
  // bugfixed by: Benjamin Lupton
  // bugfixed by: Allan Jensen (https://www.winternet.no)
  // bugfixed by: Howard Yeend
  // bugfixed by: Diogo Resende
  // bugfixed by: Rival
  // bugfixed by: Brett Zamir (https://brett-zamir.me)
  //  revised by: Jonas Raoni Soares Silva (https://www.jsfromhell.com)
  //  revised by: Luke Smith (https://lucassmith.name)
  //    input by: Kheang Hok Chin (https://www.distantia.ca/)
  //    input by: Jay Klehr
  //    input by: Amir Habibi (https://www.residence-mixte.com/)
  //    input by: Amirouche
  //   example 1: number_format(1234.56)
  //   returns 1: '1,235'
  //   example 2: number_format(1234.56, 2, ',', ' ')
  //   returns 2: '1 234,56'
  //   example 3: number_format(1234.5678, 2, '.', '')
  //   returns 3: '1234.57'
  //   example 4: number_format(67, 2, ',', '.')
  //   returns 4: '67,00'
  //   example 5: number_format(1000)
  //   returns 5: '1,000'
  //   example 6: number_format(67.311, 2)
  //   returns 6: '67.31'
  //   example 7: number_format(1000.55, 1)
  //   returns 7: '1,000.6'
  //   example 8: number_format(67000, 5, ',', '.')
  //   returns 8: '67.000,00000'
  //   example 9: number_format(0.9, 0)
  //   returns 9: '1'
  //  example 10: number_format('1.20', 2)
  //  returns 10: '1.20'
  //  example 11: number_format('1.20', 4)
  //  returns 11: '1.2000'
  //  example 12: number_format('1.2000', 3)
  //  returns 12: '1.200'
  //  example 13: number_format('1 000,50', 2, '.', ' ')
  //  returns 13: '100 050.00'
  //  example 14: number_format(1e-8, 8, '.', '')
  //  returns 14: '0.00000001'

  number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
  var n = !isFinite(+number) ? 0 : +number;
  var prec = !isFinite(+decimals) ? 0 : Math.abs(decimals);
  var sep = typeof thousandsSep === 'undefined' ? ',' : thousandsSep;
  var dec = typeof decPoint === 'undefined' ? '.' : decPoint;
  var s = '';

  var toFixedFix = function toFixedFix(n, prec) {
    if (('' + n).indexOf('e') === -1) {
      return +(Math.round(n + 'e+' + prec) + 'e-' + prec);
    } else {
      var arr = ('' + n).split('e');
      var sig = '';
      if (+arr[1] + prec > 0) {
        sig = '+';
      }
      return (+(Math.round(+arr[0] + 'e' + sig + (+arr[1] + prec)) + 'e-' + prec)).toFixed(prec);
    }
  };

  // @todo: for IE parseFloat(0.55).toFixed(0) = 0;
  s = (prec ? toFixedFix(n, prec).toString() : '' + Math.round(n)).split('.');
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
  }
  if ((s[1] || '').length < prec) {
    s[1] = s[1] || '';
    s[1] += new Array(prec - s[1].length + 1).join('0');
  }

  return s.join(dec);
};

},{}],31:[function(require,module,exports){
(function (global){(function (){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

module.exports = function setlocale(category, locale) {
  //  discuss at: https://locutus.io/php/setlocale/
  // original by: Brett Zamir (https://brett-zamir.me)
  // original by: Blues (https://hacks.bluesmoon.info/strftime/strftime.js)
  // original by: YUI Library (https://developer.yahoo.com/yui/docs/YAHOO.util.DateLocale.html)
  //      note 1: Is extensible, but currently only implements locales en,
  //      note 1: en_US, en_GB, en_AU, fr, and fr_CA for LC_TIME only; C for LC_CTYPE;
  //      note 1: C and en for LC_MONETARY/LC_NUMERIC; en for LC_COLLATE
  //      note 1: Uses global: locutus to store locale info
  //      note 1: Consider using https://demo.icu-project.org/icu-bin/locexp as basis for localization (as in i18n_loc_set_default())
  //      note 2: This function tries to establish the locale via the `window` global.
  //      note 2: This feature will not work in Node and hence is Browser-only
  //   example 1: setlocale('LC_ALL', 'en_US')
  //   returns 1: 'en_US'

  var getenv = require('../info/getenv');

  var categ = '';
  var cats = [];
  var i = 0;

  var _copy = function _copy(orig) {
    if (orig instanceof RegExp) {
      return new RegExp(orig);
    } else if (orig instanceof Date) {
      return new Date(orig);
    }
    var newObj = {};
    for (var _i in orig) {
      if (_typeof(orig[_i]) === 'object') {
        newObj[_i] = _copy(orig[_i]);
      } else {
        newObj[_i] = orig[_i];
      }
    }
    return newObj;
  };

  // Function usable by a ngettext implementation (apparently not an accessible part of setlocale(),
  // but locale-specific) See https://www.gnu.org/software/gettext/manual/gettext.html#Plural-forms
  // though amended with others from https://developer.mozilla.org/En/Localization_and_Plurals (new
  // categories noted with "MDC" below, though not sure of whether there is a convention for the
  // relative order of these newer groups as far as ngettext) The function name indicates the number
  // of plural forms (nplural) Need to look into https://cldr.unicode.org/ (maybe future JavaScript);
  // Dojo has some functions (under new BSD), including JSON conversions of LDML XML from CLDR:
  // https://bugs.dojotoolkit.org/browser/dojo/trunk/cldr and docs at
  // https://api.dojotoolkit.org/jsdoc/HEAD/dojo.cldr

  // var _nplurals1 = function (n) {
  //   // e.g., Japanese
  //   return 0
  // }
  var _nplurals2a = function _nplurals2a(n) {
    // e.g., English
    return n !== 1 ? 1 : 0;
  };
  var _nplurals2b = function _nplurals2b(n) {
    // e.g., French
    return n > 1 ? 1 : 0;
  };

  var $global = typeof window !== 'undefined' ? window : global;
  $global.$locutus = $global.$locutus || {};
  var $locutus = $global.$locutus;
  $locutus.php = $locutus.php || {};

  // Reconcile Windows vs. *nix locale names?
  // Allow different priority orders of languages, esp. if implement gettext as in
  // LANGUAGE env. var.? (e.g., show German if French is not available)
  if (!$locutus.php.locales || !$locutus.php.locales.fr_CA || !$locutus.php.locales.fr_CA.LC_TIME || !$locutus.php.locales.fr_CA.LC_TIME.x) {
    // Can add to the locales
    $locutus.php.locales = {};

    $locutus.php.locales.en = {
      LC_COLLATE: function LC_COLLATE(str1, str2) {
        // @todo: This one taken from strcmp, but need for other locales; we don't use localeCompare
        // since its locale is not settable
        return str1 === str2 ? 0 : str1 > str2 ? 1 : -1;
      },
      LC_CTYPE: {
        // Need to change any of these for English as opposed to C?
        an: /^[A-Za-z\d]+$/g,
        al: /^[A-Za-z]+$/g,
        ct: /^[\u0000-\u001F\u007F]+$/g,
        dg: /^[\d]+$/g,
        gr: /^[\u0021-\u007E]+$/g,
        lw: /^[a-z]+$/g,
        pr: /^[\u0020-\u007E]+$/g,
        pu: /^[\u0021-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007E]+$/g,
        sp: /^[\f\n\r\t\v ]+$/g,
        up: /^[A-Z]+$/g,
        xd: /^[A-Fa-f\d]+$/g,
        CODESET: 'UTF-8',
        // Used by sql_regcase
        lower: 'abcdefghijklmnopqrstuvwxyz',
        upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      },
      LC_TIME: {
        // Comments include nl_langinfo() constant equivalents and any
        // changes from Blues' implementation
        a: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        // ABDAY_
        A: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        // DAY_
        b: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        // ABMON_
        B: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        // MON_
        c: '%a %d %b %Y %r %Z',
        // D_T_FMT // changed %T to %r per results
        p: ['AM', 'PM'],
        // AM_STR/PM_STR
        P: ['am', 'pm'],
        // Not available in nl_langinfo()
        r: '%I:%M:%S %p',
        // T_FMT_AMPM (Fixed for all locales)
        x: '%m/%d/%Y',
        // D_FMT // switched order of %m and %d; changed %y to %Y (C uses %y)
        X: '%r',
        // T_FMT // changed from %T to %r  (%T is default for C, not English US)
        // Following are from nl_langinfo() or https://www.cptec.inpe.br/sx4/sx4man2/g1ab02e/strftime.4.html
        alt_digits: '',
        // e.g., ordinal
        ERA: '',
        ERA_YEAR: '',
        ERA_D_T_FMT: '',
        ERA_D_FMT: '',
        ERA_T_FMT: ''
      },
      // Assuming distinction between numeric and monetary is thus:
      // See below for C locale
      LC_MONETARY: {
        // based on Windows "english" (English_United States.1252) locale
        int_curr_symbol: 'USD',
        currency_symbol: '$',
        mon_decimal_point: '.',
        mon_thousands_sep: ',',
        mon_grouping: [3],
        // use mon_thousands_sep; "" for no grouping; additional array members
        // indicate successive group lengths after first group
        // (e.g., if to be 1,23,456, could be [3, 2])
        positive_sign: '',
        negative_sign: '-',
        int_frac_digits: 2,
        // Fractional digits only for money defaults?
        frac_digits: 2,
        p_cs_precedes: 1,
        // positive currency symbol follows value = 0; precedes value = 1
        p_sep_by_space: 0,
        // 0: no space between curr. symbol and value; 1: space sep. them unless symb.
        // and sign are adjacent then space sep. them from value; 2: space sep. sign
        // and value unless symb. and sign are adjacent then space separates
        n_cs_precedes: 1,
        // see p_cs_precedes
        n_sep_by_space: 0,
        // see p_sep_by_space
        p_sign_posn: 3,
        // 0: parentheses surround quantity and curr. symbol; 1: sign precedes them;
        // 2: sign follows them; 3: sign immed. precedes curr. symbol; 4: sign immed.
        // succeeds curr. symbol
        n_sign_posn: 0 // see p_sign_posn
      },
      LC_NUMERIC: {
        // based on Windows "english" (English_United States.1252) locale
        decimal_point: '.',
        thousands_sep: ',',
        grouping: [3] // see mon_grouping, but for non-monetary values (use thousands_sep)
      },
      LC_MESSAGES: {
        YESEXPR: '^[yY].*',
        NOEXPR: '^[nN].*',
        YESSTR: '',
        NOSTR: ''
      },
      nplurals: _nplurals2a
    };
    $locutus.php.locales.en_US = _copy($locutus.php.locales.en);
    $locutus.php.locales.en_US.LC_TIME.c = '%a %d %b %Y %r %Z';
    $locutus.php.locales.en_US.LC_TIME.x = '%D';
    $locutus.php.locales.en_US.LC_TIME.X = '%r';
    // The following are based on *nix settings
    $locutus.php.locales.en_US.LC_MONETARY.int_curr_symbol = 'USD ';
    $locutus.php.locales.en_US.LC_MONETARY.p_sign_posn = 1;
    $locutus.php.locales.en_US.LC_MONETARY.n_sign_posn = 1;
    $locutus.php.locales.en_US.LC_MONETARY.mon_grouping = [3, 3];
    $locutus.php.locales.en_US.LC_NUMERIC.thousands_sep = '';
    $locutus.php.locales.en_US.LC_NUMERIC.grouping = [];

    $locutus.php.locales.en_GB = _copy($locutus.php.locales.en);
    $locutus.php.locales.en_GB.LC_TIME.r = '%l:%M:%S %P %Z';

    $locutus.php.locales.en_AU = _copy($locutus.php.locales.en_GB);
    // Assume C locale is like English (?) (We need C locale for LC_CTYPE)
    $locutus.php.locales.C = _copy($locutus.php.locales.en);
    $locutus.php.locales.C.LC_CTYPE.CODESET = 'ANSI_X3.4-1968';
    $locutus.php.locales.C.LC_MONETARY = {
      int_curr_symbol: '',
      currency_symbol: '',
      mon_decimal_point: '',
      mon_thousands_sep: '',
      mon_grouping: [],
      p_cs_precedes: 127,
      p_sep_by_space: 127,
      n_cs_precedes: 127,
      n_sep_by_space: 127,
      p_sign_posn: 127,
      n_sign_posn: 127,
      positive_sign: '',
      negative_sign: '',
      int_frac_digits: 127,
      frac_digits: 127
    };
    $locutus.php.locales.C.LC_NUMERIC = {
      decimal_point: '.',
      thousands_sep: '',
      grouping: []
    };
    // D_T_FMT
    $locutus.php.locales.C.LC_TIME.c = '%a %b %e %H:%M:%S %Y';
    // D_FMT
    $locutus.php.locales.C.LC_TIME.x = '%m/%d/%y';
    // T_FMT
    $locutus.php.locales.C.LC_TIME.X = '%H:%M:%S';
    $locutus.php.locales.C.LC_MESSAGES.YESEXPR = '^[yY]';
    $locutus.php.locales.C.LC_MESSAGES.NOEXPR = '^[nN]';

    $locutus.php.locales.fr = _copy($locutus.php.locales.en);
    $locutus.php.locales.fr.nplurals = _nplurals2b;
    $locutus.php.locales.fr.LC_TIME.a = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'];
    $locutus.php.locales.fr.LC_TIME.A = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    $locutus.php.locales.fr.LC_TIME.b = ['jan', 'f\xE9v', 'mar', 'avr', 'mai', 'jun', 'jui', 'ao\xFB', 'sep', 'oct', 'nov', 'd\xE9c'];
    $locutus.php.locales.fr.LC_TIME.B = ['janvier', 'f\xE9vrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'ao\xFBt', 'septembre', 'octobre', 'novembre', 'd\xE9cembre'];
    $locutus.php.locales.fr.LC_TIME.c = '%a %d %b %Y %T %Z';
    $locutus.php.locales.fr.LC_TIME.p = ['', ''];
    $locutus.php.locales.fr.LC_TIME.P = ['', ''];
    $locutus.php.locales.fr.LC_TIME.x = '%d.%m.%Y';
    $locutus.php.locales.fr.LC_TIME.X = '%T';

    $locutus.php.locales.fr_CA = _copy($locutus.php.locales.fr);
    $locutus.php.locales.fr_CA.LC_TIME.x = '%Y-%m-%d';
  }
  if (!$locutus.php.locale) {
    $locutus.php.locale = 'en_US';
    // Try to establish the locale via the `window` global
    if (typeof window !== 'undefined' && window.document) {
      var d = window.document;
      var NS_XHTML = 'https://www.w3.org/1999/xhtml';
      var NS_XML = 'https://www.w3.org/XML/1998/namespace';
      if (d.getElementsByTagNameNS && d.getElementsByTagNameNS(NS_XHTML, 'html')[0]) {
        if (d.getElementsByTagNameNS(NS_XHTML, 'html')[0].getAttributeNS && d.getElementsByTagNameNS(NS_XHTML, 'html')[0].getAttributeNS(NS_XML, 'lang')) {
          $locutus.php.locale = d.getElementsByTagName(NS_XHTML, 'html')[0].getAttributeNS(NS_XML, 'lang');
        } else if (d.getElementsByTagNameNS(NS_XHTML, 'html')[0].lang) {
          // XHTML 1.0 only
          $locutus.php.locale = d.getElementsByTagNameNS(NS_XHTML, 'html')[0].lang;
        }
      } else if (d.getElementsByTagName('html')[0] && d.getElementsByTagName('html')[0].lang) {
        $locutus.php.locale = d.getElementsByTagName('html')[0].lang;
      }
    }
  }
  // PHP-style
  $locutus.php.locale = $locutus.php.locale.replace('-', '_');
  // @todo: locale if declared locale hasn't been defined
  if (!($locutus.php.locale in $locutus.php.locales)) {
    if ($locutus.php.locale.replace(/_[a-zA-Z]+$/, '') in $locutus.php.locales) {
      $locutus.php.locale = $locutus.php.locale.replace(/_[a-zA-Z]+$/, '');
    }
  }

  if (!$locutus.php.localeCategories) {
    $locutus.php.localeCategories = {
      LC_COLLATE: $locutus.php.locale,
      // for string comparison, see strcoll()
      LC_CTYPE: $locutus.php.locale,
      // for character classification and conversion, for example strtoupper()
      LC_MONETARY: $locutus.php.locale,
      // for localeconv()
      LC_NUMERIC: $locutus.php.locale,
      // for decimal separator (See also localeconv())
      LC_TIME: $locutus.php.locale,
      // for date and time formatting with strftime()
      // for system responses (available if PHP was compiled with libintl):
      LC_MESSAGES: $locutus.php.locale
    };
  }

  if (locale === null || locale === '') {
    locale = getenv(category) || getenv('LANG');
  } else if (Object.prototype.toString.call(locale) === '[object Array]') {
    for (i = 0; i < locale.length; i++) {
      if (!(locale[i] in $locutus.php.locales)) {
        if (i === locale.length - 1) {
          // none found
          return false;
        }
        continue;
      }
      locale = locale[i];
      break;
    }
  }

  // Just get the locale
  if (locale === '0' || locale === 0) {
    if (category === 'LC_ALL') {
      for (categ in $locutus.php.localeCategories) {
        // Add ".UTF-8" or allow ".@latint", etc. to the end?
        cats.push(categ + '=' + $locutus.php.localeCategories[categ]);
      }
      return cats.join(';');
    }
    return $locutus.php.localeCategories[category];
  }

  if (!(locale in $locutus.php.locales)) {
    // Locale not found
    return false;
  }

  // Set and get locale
  if (category === 'LC_ALL') {
    for (categ in $locutus.php.localeCategories) {
      $locutus.php.localeCategories[categ] = locale;
    }
  } else {
    $locutus.php.localeCategories[category] = locale;
  }

  return locale;
};

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../info/getenv":27}],32:[function(require,module,exports){
'use strict';

module.exports = function str_pad(input, padLength, padString, padType) {
  // eslint-disable-line camelcase
  //  discuss at: https://locutus.io/php/str_pad/
  // original by: Kevin van Zonneveld (https://kvz.io)
  // improved by: Michael White (https://getsprink.com)
  //    input by: Marco van Oort
  // bugfixed by: Brett Zamir (https://brett-zamir.me)
  //   example 1: str_pad('Kevin van Zonneveld', 30, '-=', 'STR_PAD_LEFT')
  //   returns 1: '-=-=-=-=-=-Kevin van Zonneveld'
  //   example 2: str_pad('Kevin van Zonneveld', 30, '-', 'STR_PAD_BOTH')
  //   returns 2: '------Kevin van Zonneveld-----'

  var half = '';
  var padToGo = void 0;

  var _strPadRepeater = function _strPadRepeater(s, len) {
    var collect = '';

    while (collect.length < len) {
      collect += s;
    }
    collect = collect.substr(0, len);

    return collect;
  };

  input += '';
  padString = padString !== undefined ? padString : ' ';

  if (padType !== 'STR_PAD_LEFT' && padType !== 'STR_PAD_RIGHT' && padType !== 'STR_PAD_BOTH') {
    padType = 'STR_PAD_RIGHT';
  }
  if ((padToGo = padLength - input.length) > 0) {
    if (padType === 'STR_PAD_LEFT') {
      input = _strPadRepeater(padString, padToGo) + input;
    } else if (padType === 'STR_PAD_RIGHT') {
      input = input + _strPadRepeater(padString, padToGo);
    } else if (padType === 'STR_PAD_BOTH') {
      half = _strPadRepeater(padString, Math.ceil(padToGo / 2));
      input = half + input + half;
      input = input.substr(0, padLength);
    }
  }

  return input;
};

},{}],33:[function(require,module,exports){
'use strict';

module.exports = function str_repeat(input, multiplier) {
  // eslint-disable-line camelcase
  //  discuss at: https://locutus.io/php/str_repeat/
  // original by: Kevin van Zonneveld (https://kvz.io)
  // improved by: Jonas Raoni Soares Silva (https://www.jsfromhell.com)
  // improved by: Ian Carter (https://euona.com/)
  //   example 1: str_repeat('-=', 10)
  //   returns 1: '-=-=-=-=-=-=-=-=-=-='

  var y = '';
  while (true) {
    if (multiplier & 1) {
      y += input;
    }
    multiplier >>= 1;
    if (multiplier) {
      input += input;
    } else {
      break;
    }
  }
  return y;
};

},{}],34:[function(require,module,exports){
'use strict';

module.exports = function strip_tags(input, allowed) {
  // eslint-disable-line camelcase
  //  discuss at: https://locutus.io/php/strip_tags/
  // original by: Kevin van Zonneveld (https://kvz.io)
  // improved by: Luke Godfrey
  // improved by: Kevin van Zonneveld (https://kvz.io)
  //    input by: Pul
  //    input by: Alex
  //    input by: Marc Palau
  //    input by: Brett Zamir (https://brett-zamir.me)
  //    input by: Bobby Drake
  //    input by: Evertjan Garretsen
  // bugfixed by: Kevin van Zonneveld (https://kvz.io)
  // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
  // bugfixed by: Kevin van Zonneveld (https://kvz.io)
  // bugfixed by: Kevin van Zonneveld (https://kvz.io)
  // bugfixed by: Eric Nagel
  // bugfixed by: Kevin van Zonneveld (https://kvz.io)
  // bugfixed by: Tomasz Wesolowski
  // bugfixed by: Tymon Sturgeon (https://scryptonite.com)
  // bugfixed by: Tim de Koning (https://www.kingsquare.nl)
  //  revised by: Rafał Kukawski (https://blog.kukawski.pl)
  //   example 1: strip_tags('<p>Kevin</p> <br /><b>van</b> <i>Zonneveld</i>', '<i><b>')
  //   returns 1: 'Kevin <b>van</b> <i>Zonneveld</i>'
  //   example 2: strip_tags('<p>Kevin <img src="someimage.png" onmouseover="someFunction()">van <i>Zonneveld</i></p>', '<p>')
  //   returns 2: '<p>Kevin van Zonneveld</p>'
  //   example 3: strip_tags("<a href='https://kvz.io'>Kevin van Zonneveld</a>", "<a>")
  //   returns 3: "<a href='https://kvz.io'>Kevin van Zonneveld</a>"
  //   example 4: strip_tags('1 < 5 5 > 1')
  //   returns 4: '1 < 5 5 > 1'
  //   example 5: strip_tags('1 <br/> 1')
  //   returns 5: '1  1'
  //   example 6: strip_tags('1 <br/> 1', '<br>')
  //   returns 6: '1 <br/> 1'
  //   example 7: strip_tags('1 <br/> 1', '<br><br/>')
  //   returns 7: '1 <br/> 1'
  //   example 8: strip_tags('<i>hello</i> <<foo>script>world<</foo>/script>')
  //   returns 8: 'hello world'
  //   example 9: strip_tags(4)
  //   returns 9: '4'

  var _phpCastString = require('../_helpers/_phpCastString');

  // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
  allowed = (((allowed || '') + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');

  var tags = /<\/?([a-z0-9]*)\b[^>]*>?/gi;
  var commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;

  var after = _phpCastString(input);
  // removes tha '<' char at the end of the string to replicate PHP's behaviour
  after = after.substring(after.length - 1) === '<' ? after.substring(0, after.length - 1) : after;

  // recursively remove tags to ensure that the returned string doesn't contain forbidden tags after previous passes (e.g. '<<bait/>switch/>')
  while (true) {
    var before = after;
    after = before.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
      return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
    });

    // return once no more tags are removed
    if (before === after) {
      return after;
    }
  }
};

},{"../_helpers/_phpCastString":24}],35:[function(require,module,exports){
'use strict';

module.exports = function strrev(string) {
  //       discuss at: https://locutus.io/php/strrev/
  //      original by: Kevin van Zonneveld (https://kvz.io)
  //      bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
  // reimplemented by: Brett Zamir (https://brett-zamir.me)
  //        example 1: strrev('Kevin van Zonneveld')
  //        returns 1: 'dlevennoZ nav niveK'
  //        example 2: strrev('a\u0301haB')
  //        returns 2: 'Baha\u0301' // combining
  //        example 3: strrev('A\uD87E\uDC04Z')
  //        returns 3: 'Z\uD87E\uDC04A' // surrogates
  //             test: 'skip-3'

  string = string + '';

  // Performance will be enhanced with the next two lines of code commented
  // out if you don't care about combining characters
  // Keep Unicode combining characters together with the character preceding
  // them and which they are modifying (as in PHP 6)
  // See https://unicode.org/reports/tr44/#Property_Table (Me+Mn)
  // We also add the low surrogate range at the beginning here so it will be
  // maintained with its preceding high surrogate

  var chars = ['\uDC00-\uDFFF', '\u0300-\u036F', '\u0483-\u0489', '\u0591-\u05BD', '\u05BF', '\u05C1', '\u05C2', '\u05C4', '\u05C5', '\u05C7', '\u0610-\u061A', '\u064B-\u065E', '\u0670', '\u06D6-\u06DC', '\u06DE-\u06E4', '\u06E7\u06E8', '\u06EA-\u06ED', '\u0711', '\u0730-\u074A', '\u07A6-\u07B0', '\u07EB-\u07F3', '\u0901-\u0903', '\u093C', '\u093E-\u094D', '\u0951-\u0954', '\u0962', '\u0963', '\u0981-\u0983', '\u09BC', '\u09BE-\u09C4', '\u09C7', '\u09C8', '\u09CB-\u09CD', '\u09D7', '\u09E2', '\u09E3', '\u0A01-\u0A03', '\u0A3C', '\u0A3E-\u0A42', '\u0A47', '\u0A48', '\u0A4B-\u0A4D', '\u0A51', '\u0A70', '\u0A71', '\u0A75', '\u0A81-\u0A83', '\u0ABC', '\u0ABE-\u0AC5', '\u0AC7-\u0AC9', '\u0ACB-\u0ACD', '\u0AE2', '\u0AE3', '\u0B01-\u0B03', '\u0B3C', '\u0B3E-\u0B44', '\u0B47', '\u0B48', '\u0B4B-\u0B4D', '\u0B56', '\u0B57', '\u0B62', '\u0B63', '\u0B82', '\u0BBE-\u0BC2', '\u0BC6-\u0BC8', '\u0BCA-\u0BCD', '\u0BD7', '\u0C01-\u0C03', '\u0C3E-\u0C44', '\u0C46-\u0C48', '\u0C4A-\u0C4D', '\u0C55', '\u0C56', '\u0C62', '\u0C63', '\u0C82', '\u0C83', '\u0CBC', '\u0CBE-\u0CC4', '\u0CC6-\u0CC8', '\u0CCA-\u0CCD', '\u0CD5', '\u0CD6', '\u0CE2', '\u0CE3', '\u0D02', '\u0D03', '\u0D3E-\u0D44', '\u0D46-\u0D48', '\u0D4A-\u0D4D', '\u0D57', '\u0D62', '\u0D63', '\u0D82', '\u0D83', '\u0DCA', '\u0DCF-\u0DD4', '\u0DD6', '\u0DD8-\u0DDF', '\u0DF2', '\u0DF3', '\u0E31', '\u0E34-\u0E3A', '\u0E47-\u0E4E', '\u0EB1', '\u0EB4-\u0EB9', '\u0EBB', '\u0EBC', '\u0EC8-\u0ECD', '\u0F18', '\u0F19', '\u0F35', '\u0F37', '\u0F39', '\u0F3E', '\u0F3F', '\u0F71-\u0F84', '\u0F86', '\u0F87', '\u0F90-\u0F97', '\u0F99-\u0FBC', '\u0FC6', '\u102B-\u103E', '\u1056-\u1059', '\u105E-\u1060', '\u1062-\u1064', '\u1067-\u106D', '\u1071-\u1074', '\u1082-\u108D', '\u108F', '\u135F', '\u1712-\u1714', '\u1732-\u1734', '\u1752', '\u1753', '\u1772', '\u1773', '\u17B6-\u17D3', '\u17DD', '\u180B-\u180D', '\u18A9', '\u1920-\u192B', '\u1930-\u193B', '\u19B0-\u19C0', '\u19C8', '\u19C9', '\u1A17-\u1A1B', '\u1B00-\u1B04', '\u1B34-\u1B44', '\u1B6B-\u1B73', '\u1B80-\u1B82', '\u1BA1-\u1BAA', '\u1C24-\u1C37', '\u1DC0-\u1DE6', '\u1DFE', '\u1DFF', '\u20D0-\u20F0', '\u2DE0-\u2DFF', '\u302A-\u302F', '\u3099', '\u309A', '\uA66F-\uA672', '\uA67C', '\uA67D', '\uA802', '\uA806', '\uA80B', '\uA823-\uA827', '\uA880', '\uA881', '\uA8B4-\uA8C4', '\uA926-\uA92D', '\uA947-\uA953', '\uAA29-\uAA36', '\uAA43', '\uAA4C', '\uAA4D', '\uFB1E', '\uFE00-\uFE0F', '\uFE20-\uFE26'];

  var graphemeExtend = new RegExp('(.)([' + chars.join('') + ']+)', 'g');

  // Temporarily reverse
  string = string.replace(graphemeExtend, '$2$1');
  return string.split('').reverse().join('');
};

},{}],36:[function(require,module,exports){
'use strict';

module.exports = function trim(str, charlist) {
  //  discuss at: https://locutus.io/php/trim/
  // original by: Kevin van Zonneveld (https://kvz.io)
  // improved by: mdsjack (https://www.mdsjack.bo.it)
  // improved by: Alexander Ermolaev (https://snippets.dzone.com/user/AlexanderErmolaev)
  // improved by: Kevin van Zonneveld (https://kvz.io)
  // improved by: Steven Levithan (https://blog.stevenlevithan.com)
  // improved by: Jack
  //    input by: Erkekjetter
  //    input by: DxGx
  // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
  //   example 1: trim('    Kevin van Zonneveld    ')
  //   returns 1: 'Kevin van Zonneveld'
  //   example 2: trim('Hello World', 'Hdle')
  //   returns 2: 'o Wor'
  //   example 3: trim(16, 1)
  //   returns 3: '6'

  var whitespace = [' ', '\n', '\r', '\t', '\f', '\x0b', '\xa0', '\u2000', '\u2001', '\u2002', '\u2003', '\u2004', '\u2005', '\u2006', '\u2007', '\u2008', '\u2009', '\u200A', '\u200B', '\u2028', '\u2029', '\u3000'].join('');
  var l = 0;
  var i = 0;
  str += '';

  if (charlist) {
    whitespace = (charlist + '').replace(/([[\]().?/*{}+$^:])/g, '$1');
  }

  l = str.length;
  for (i = 0; i < l; i++) {
    if (whitespace.indexOf(str.charAt(i)) === -1) {
      str = str.substring(i);
      break;
    }
  }

  l = str.length;
  for (i = l - 1; i >= 0; i--) {
    if (whitespace.indexOf(str.charAt(i)) === -1) {
      str = str.substring(0, i + 1);
      break;
    }
  }

  return whitespace.indexOf(str.charAt(0)) === -1 ? str : '';
};

},{}],37:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],38:[function(require,module,exports){
var htmlspecialchars = require('locutus/php/strings/htmlspecialchars');

Latte.prototype.registerPlugin(
  'modifier',
  'breaklines',
  function (s)
  {
    if (s == null)
    {
      return '';
    }

    return htmlspecialchars(s, 0, 'UTF-8').replace(/(\r\n|\n\r|\r|\n)/g, '<br />\n');
  }
);

},{"locutus/php/strings/htmlspecialchars":29}],39:[function(require,module,exports){
var toBytes = require('es5-util/js/toBytes');

Latte.prototype.registerPlugin(
  'modifier',
  'bytes',
  function (s, precision)
  {
    precision = precision != null ? precision : 2;
    return toBytes(s, precision);
  }
);

},{"es5-util/js/toBytes":18}],40:[function(require,module,exports){
var toUpperCase = require('es5-util/js/toUpperCase');

Latte.prototype.registerPlugin(
  'modifier',
  'capitalize',
  function (s, preserveCase)
  {
    return toUpperCase(s, 'words', !!preserveCase);
  }
);

},{"es5-util/js/toUpperCase":23}],41:[function(require,module,exports){
var isNotSetLoose = require('es5-util/js/isNotSetLoose');
var toUnixTime    = require('es5-util/js/toUnixTime');
var strftime      = require('locutus/php/datetime/strftime');

Latte.prototype.registerPlugin(
  'modifier',
  'date',
  function (time, format, defaultDate)
  {
    if (isNotSetLoose(time) || !time)
    {
      if (isNotSetLoose(defaultDate))
      {
        return '';
      }
      time = defaultDate;
    }

    return strftime(format != null ? format : '%b %e, %Y', toUnixTime(time));
  }
);

},{"es5-util/js/isNotSetLoose":8,"es5-util/js/toUnixTime":22,"locutus/php/datetime/strftime":26}],42:[function(require,module,exports){
var getDefaultTags = require('./../helpers/getDefaultTags');

Latte.getDefaultTags = getDefaultTags;

Latte.setDefaultTags = function (template, obj)
{
  return getDefaultTags(obj) + template;
};

},{"./../helpers/getDefaultTags":59}],43:[function(require,module,exports){
var toUpperCase = require('es5-util/js/toUpperCase');

Latte.prototype.registerPlugin(
  'modifier',
  'firstUpper',
  function (s, preserveCase)
  {
    return toUpperCase(s, 'first', !!preserveCase);
  }
);

},{"es5-util/js/toUpperCase":23}],44:[function(require,module,exports){
var toString = require('es5-util/js/toString');

Latte.prototype.registerPlugin(
  'modifier',
  'implode',
  function (arr, glue, keyGlue)
  {
    return toString(arr, glue != null ? glue : '', keyGlue);
  }
);

},{"es5-util/js/toString":20}],45:[function(require,module,exports){
var isObjectLike        = require('es5-util/js/isObjectLike');
var toAssociativeValues = require('es5-util/js/toAssociativeValues');

Latte.prototype.registerPlugin(
  'modifier',
  'length',
  function (s)
  {
    if (s == null)
    {
      return 0;
    }

    return (isObjectLike(s) ? toAssociativeValues(s) : s).length;
  }
);

},{"es5-util/js/isObjectLike":11,"es5-util/js/toAssociativeValues":17}],46:[function(require,module,exports){
var toNumber      = require('es5-util/js/toNumber');
var number_format = require('locutus/php/strings/number_format');

Latte.prototype.registerPlugin(
  'modifier',
  'number',
  function (s, decimals, dec_point, thousands_sep)
  {
    decimals      = decimals != null ? decimals : 0;
    dec_point     = dec_point != null ? dec_point : '.';
    thousands_sep = thousands_sep != null ? thousands_sep : ',';
    return number_format(toNumber(s), decimals, dec_point, thousands_sep);
  }
);

},{"es5-util/js/toNumber":19,"locutus/php/strings/number_format":30}],47:[function(require,module,exports){
var str_pad = require('locutus/php/strings/str_pad');

Latte.prototype.registerPlugin(
  'modifier',
  'padBoth',
  function (s, length, pad)
  {
    return str_pad(String(s), length, pad != null ? pad : ' ', 'STR_PAD_BOTH');
  }
);

},{"locutus/php/strings/str_pad":32}],48:[function(require,module,exports){
var str_pad = require('locutus/php/strings/str_pad');

Latte.prototype.registerPlugin(
  'modifier',
  'padLeft',
  function (s, length, pad)
  {
    return str_pad(String(s), length, pad != null ? pad : ' ', 'STR_PAD_LEFT');
  }
);

},{"locutus/php/strings/str_pad":32}],49:[function(require,module,exports){
var str_pad = require('locutus/php/strings/str_pad');

Latte.prototype.registerPlugin(
  'modifier',
  'padRight',
  function (s, length, pad)
  {
    return str_pad(String(s), length, pad != null ? pad : ' ', 'STR_PAD_RIGHT');
  }
);

},{"locutus/php/strings/str_pad":32}],50:[function(require,module,exports){
var str_repeat = require('locutus/php/strings/str_repeat');

Latte.prototype.registerPlugin(
  'modifier',
  'repeat',
  function (s, count)
  {
    return str_repeat(String(s), ~~count);
  }
);

},{"locutus/php/strings/str_repeat":33}],51:[function(require,module,exports){
var findReplace = require('es5-util/js/findReplace');

Latte.prototype.registerPlugin(
  'modifier',
  'replaceRe',
  function (s, find, replace)
  {
    return findReplace(s, find, replace);
  }
);

},{"es5-util/js/findReplace":1}],52:[function(require,module,exports){
var isArrayLikeObject = require('es5-util/js/isArrayLikeObject');
var toArray           = require('es5-util/js/toArray');
var array_reverse     = require('locutus/php/array/array_reverse');
var strrev            = require('locutus/php/strings/strrev');

Latte.prototype.registerPlugin(
  'modifier',
  'reverse',
  function (s, preserveKeys)
  {
    if (isArrayLikeObject(s))
    {
      return array_reverse(toArray(s), !!preserveKeys);
    }

    return strrev(String(s));
  });

},{"es5-util/js/isArrayLikeObject":4,"es5-util/js/toArray":16,"locutus/php/array/array_reverse":25,"locutus/php/strings/strrev":35}],53:[function(require,module,exports){
var strip_tags = require('locutus/php/strings/strip_tags');

Latte.prototype.registerPlugin(
  'modifier',
  'striptags',
  function (s)
  {
    return strip_tags(s);
  }
);

},{"locutus/php/strings/strip_tags":34}],54:[function(require,module,exports){
var substr = require('es5-util/js/substr');

var substring = function (s, start, length, validatePositions)
{
  return substr(s, start, length, !!validatePositions);
};

Latte.prototype.registerPlugin('modifier', 'substring', substring);
Latte.prototype.registerPlugin('modifier', 'substr', substring);

},{"es5-util/js/substr":15}],55:[function(require,module,exports){
var trim = require('locutus/php/strings/trim');

Latte.prototype.registerPlugin(
  'modifier',
  'trim',
  function (s, charlist)
  {
    charlist = charlist != null ? charlist : " \t\n\r\0\x0B";
    return trim(String(s), charlist);
  }
);

},{"locutus/php/strings/trim":36}],56:[function(require,module,exports){
var getNestedParts = require('./getNestedParts');
var replaceParts   = require('./replaceParts');
var explode        = require('es5-util/js/toArray');
var implode        = require('es5-util/js/toString');

function defaultFilter(s, ldelim, rdelim)
{
  var str = s,
      a,
      z;

  ldelim = ldelim != null ? ldelim : '{';
  rdelim = rdelim != null ? rdelim : '}';

  var re = new RegExp('([\\S\\s]*)(' + ldelim + '{1})(default{1})(\\s)([^' + rdelim + ']*?)(' + rdelim + '{1})([\\S\\s]*)', 'img');
  a      = str.replace(re, "$1");
  s      = str.replace(re, "$5");
  z      = str.replace(re, "$7");

  if (s === str)
  {
    return s;
  }

  var braces     = replaceParts(s, getNestedParts(s, '[', ']'), 24);
  var parens     = replaceParts(braces.s, getNestedParts(braces.s, '(', ')'), 24);
  var paramParts = explode(parens.s, ',');

  paramParts.forEach(function (param, index, paramParts)
  {
    var equalPos      = param.indexOf('=');
    var variable      = param.slice(0, equalPos).trim();
    var value         = param.slice(equalPos + 1).trim();
    paramParts[index] = ldelim + variable + ' = ' + variable + '|default:' + value + rdelim;
  });

  return defaultFilter(a + braces.returnParts(parens.returnParts(implode(paramParts, ''))) + z, ldelim, rdelim);
}

module.exports = defaultFilter;

},{"./getNestedParts":60,"./replaceParts":65,"es5-util/js/toArray":16,"es5-util/js/toString":20}],57:[function(require,module,exports){
var getNestedParts = require('./getNestedParts');
var replaceParts   = require('./replaceParts');
var replaceDelims  = require('./replaceDelims').replaceDelims;
var returnDelims   = require('./replaceDelims').returnDelims;

function encodeTemplate(str, ldelim, rdelim, length, getUID)
{
  ldelim = ldelim != null ? ldelim : '{';
  rdelim = rdelim != null ? rdelim : '}';
  length = length != null ? length : 24;

  var delims = replaceDelims(str, ldelim, rdelim);
  var braces = replaceParts(delims, getNestedParts(delims, '[', ']'), length, getUID);
  var parens = replaceParts(braces.s, getNestedParts(braces.s, '(', ')'), length, getUID);

  return {
    s     : parens.s,
    decode: function (newStr)
    {
      newStr = newStr != null ? newStr : parens.s;
      return returnDelims(braces.returnParts(parens.returnParts(newStr)));
    },
  };
}

module.exports = encodeTemplate;

},{"./getNestedParts":60,"./replaceDelims":64,"./replaceParts":65}],58:[function(require,module,exports){
var encodeTemplate = require('./encodeTemplate');
var replaceParts   = require('./replaceParts');
var explode        = require('locutus/php/strings/explode');

function forFilter(s, ldelim, rdelim)
{
  ldelim = ldelim != null ? ldelim : '{';
  rdelim = rdelim != null ? rdelim : '}';

  var es    = encodeTemplate(s, ldelim, rdelim);
  var re    = new RegExp(ldelim + '{1}(?:for ){1}([^};]*?);{1}([^};]*?);{1}([^}]*?)' + rdelim + '{1}', 'mg');
  var found = es.s.match(re);

  if (!found)
  {
    return s;
  }

  var replace = [];

  found.forEach(function (foundItem, i)
  {
    var parts,
        expr1,
        expr2,
        expr3,
        variable,
        step  = '1';
    foundItem = foundItem.slice(ldelim.length + 'for '.length, -ldelim.length);

    if ((parts = explode(';', foundItem, 3)).length !== 3)
    {
      return replace[i] = foundItem;
    }

    expr1 = parts[0].trim() || '$i = 0';
    expr2 = parts[1].trim();
    expr3 = parts[2].trim();

    var expr3match = expr3.match(/([+-]{1})([+-=]{1})([^, ;}]*)/) || [];
    if (expr3match[2] === '=')
    {
      step = expr3match[3] || '1';
    }
    if (expr3match[1] === '-')
    {
      step = '-' + step;
    }

    var expr2match = expr2.match(/([<>]{1})(=?) *(.*)/) || [];
    var glt        = expr2match[1] || '<';
    var glte       = expr2match[2] || '';
    var condition  = expr2match[3] || '2';

    if (glte !== '=')
    {
      condition += glt === '<' ? '-1' : '+1';
    }

    replace[i] = '{for ' + expr1 + ' to ' + condition + (step != '1' ? ' step ' + step : '') + '}';
  });

  var ep = replaceParts(es.s, found, 24);

  return es.decode(ep.returnParts(ep.s, replace));
}

module.exports = forFilter;

},{"./encodeTemplate":57,"./replaceParts":65,"locutus/php/strings/explode":28}],59:[function(require,module,exports){
var latteObjectFilter = require('./latteObjectFilter');

function getDefaultTags(obj)
{
  var s = [];

  for (var key in obj)
  {
    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(String(key)))
    {
      s.push('{$' + String(key) + ' = $' + String(key) + '|default:' + latteObjectFilter(obj[key]) + '}')
    }
  }

  return s.join('');
}

module.exports = getDefaultTags;

},{"./latteObjectFilter":62}],60:[function(require,module,exports){
function getNestedParts(str, open, close)
{
  if (str.length < 2)
  {
    return [];
  }

  close = close != null ? close : open;

  if (str.length === 2)
  {
    return str[0] === open && str[1] === close ? [str] : [];
  }

  var parts = [],
      nestedLevels = {},
      tags = [open, "'", '"', '`'],
      tagsPos,
      level = 0,
      escaped,
      currentChar;

  for (var i = 0, j = 0; i < str.length; i++, j = i)
  {
    currentChar = str[i];
    escaped     = false;

    if (nestedLevels[level])
    {
      if (currentChar === nestedLevels[level].closeTag)
      {
        if (level === 1 && close === nestedLevels[level].closeTag)
        {
          parts.push(str.slice(nestedLevels[level].startIndex, i + 1));
        }
        delete nestedLevels[level--];
      }
      else if ((tagsPos = tags.indexOf(currentChar)) > -1 && close === nestedLevels[level].closeTag)
      {
        nestedLevels[++level] = {
          startIndex: i,
          closeTag  : tagsPos === 0 ? close : tags[tagsPos],
        };
      }
    }
    else if ((tagsPos = tags.indexOf(currentChar)) > -1)
    {
      nestedLevels[++level] = {
        startIndex: i,
        closeTag  : tagsPos === 0 ? close : tags[tagsPos],
      };
    }

  }

  if (Object.keys(nestedLevels).length > 0)
  {
    parts.push(str.slice(nestedLevels[1].startIndex));
  }

  return parts;
}

module.exports = getNestedParts;

},{}],61:[function(require,module,exports){
var encodeTemplate = require('./encodeTemplate');
var replaceParts   = require('./replaceParts');
var explode        = require('es5-util/js/toArray');
var implode        = require('es5-util/js/toString');

function latteFilter(s, ldelim, rdelim)
{
  //  force comma after template name
  s = s.replace(/({include ["']{1}[A-Za-z0-9]+["']{1})(,?)/g, "$1,");

  ldelim = ldelim != null ? ldelim : '{';
  rdelim = rdelim != null ? rdelim : '}';

  var es    = encodeTemplate(s, ldelim, rdelim);
  var re    = new RegExp(ldelim + '{1}(include){1}\\s[^' + rdelim + ']*?' + rdelim + '{1}', 'img');
  var found = es.s.match(re);

  if (!found)
  {
    return s;
  }

  var replace = [];

  found.forEach(function (foundItem, i)
  {
    var foundItemInner = foundItem.slice(ldelim.length, -ldelim.length);
    var foundParts     = explode(foundItemInner, ',');
    var replacedParts  = [];

    foundParts.forEach(function (foundPart)
    {
      foundPart = foundPart.replace('=>', '=').trim();
      if (foundPart.length > 0)
      {
        replacedParts.push(foundPart);
      }
    });

    replace[i] = ldelim + implode(replacedParts, ' ').trim() + rdelim;
  });

  var ep = replaceParts(es.s, found, 24);

  return es.decode(ep.returnParts(ep.s, replace));
}

module.exports = latteFilter;

},{"./encodeTemplate":57,"./replaceParts":65,"es5-util/js/toArray":16,"es5-util/js/toString":20}],62:[function(require,module,exports){
var isArrayLikeObject = require('es5-util/js/isArrayLikeObject');
var isObject          = require('es5-util/js/isObject');

function latteObjectFilter(input)
{
  if (!isObject(input))
  {
    if (input == null)
    {
      return '""';
    }

    var noStringify = '!ns ';
    if (typeof input === 'string' && input.substring(0, noStringify.length) === noStringify)
    {
      return input.slice(noStringify.length);
    }

    return JSON.stringify(input);
  }

  var items = [];

  for (var key in input)
  {
    if (input.hasOwnProperty(key) || typeof input[key] !== 'function')
    {
      items.push((isArrayLikeObject(input) ? '' : '"' + key + '"=>') + latteObjectFilter(input[key]));
    }
  }

  return '[' + items.join(',') + ']';
}

module.exports = latteObjectFilter;

},{"es5-util/js/isArrayLikeObject":4,"es5-util/js/isObject":10}],63:[function(require,module,exports){
function nAttributesFilter(s, ldelim, rdelim)
{
  ldelim = ldelim != null ? ldelim : '{';
  rdelim = rdelim != null ? rdelim : '}';

  var re = new RegExp('(n:[A-Za-z0-9 ]+=[\\s]*)(["\'])(' + ldelim + '?)((?:(?!\\2)[^}])*)(' + rdelim + '?)(\\2)', 'img');
  return s.replace(re, "$1$2" + ldelim + "$4" + rdelim + "$2");
}

module.exports = nAttributesFilter;

},{}],64:[function(require,module,exports){
function replaceDelims(s, ldelim, rdelim)
{
  ldelim = ldelim != null ? ldelim : '{';
  rdelim = rdelim != null ? rdelim : '}';

  s = s.replace(new RegExp(ldelim + 'l' + rdelim, 'g'), '__ldelim__');
  s = s.replace(new RegExp(ldelim + 'r' + rdelim, 'g'), '__rdelim__');

  return s;
}

function returnDelims(s, ldelim, rdelim)
{
  ldelim = ldelim != null ? ldelim : '{';
  rdelim = rdelim != null ? rdelim : '}';

  s = s.replace(new RegExp('__ldelim__', 'g'), ldelim + 'l' + rdelim);
  s = s.replace(new RegExp('__rdelim__', 'g'), ldelim + 'r' + rdelim);

  return s;
}

function processDelims(s, ldelim, rdelim)
{
  ldelim = ldelim != null ? ldelim : '{';
  rdelim = rdelim != null ? rdelim : '}';

  s = s.replace(new RegExp(ldelim + 'l' + rdelim, 'g'), ldelim);
  s = s.replace(new RegExp(ldelim + 'r' + rdelim, 'g'), rdelim);

  return s;
};

module.exports.replaceDelims = replaceDelims;

module.exports.returnDelims = returnDelims;

module.exports.processDelims = processDelims;

},{}],65:[function(require,module,exports){
var getiUID = require('es5-util/js/getUID').getiUID;

function replaceParts(str, parts, length, getUID)
{
  getUID = getUID != null ? getUID : getiUID;

  var reference = new Map();

  function returnParts(newStr, newParts)
  {
    var counter = 0;
    reference.forEach(function (part, id)
    {
      var replacePart = newParts != null ? newParts[counter++] : part;
      newStr          = newStr.replace(id, replacePart)
    });

    return newStr;
  }

  function getId()
  {
    var id;

    do
    {
      id = getUID(length);
    }
    while (reference.has(id));

    return id;
  }

  parts.forEach(function (part)
  {
    var id = getId();

    reference.set(id, part);

    str = str.replace(part, id);
  });

  return {
    s          : str,
    returnParts: returnParts,
  };
}

module.exports = replaceParts;

},{"es5-util/js/getUID":2}],66:[function(require,module,exports){
var encodeTemplate = require('./encodeTemplate');
var replaceParts   = require('./replaceParts');
var explode        = require('locutus/php/strings/explode');

function ternaryFilter(s, ldelim, rdelim)
{
  ldelim = ldelim != null ? ldelim : '{';
  rdelim = rdelim != null ? rdelim : '}';

  var es    = encodeTemplate(s, ldelim, rdelim);
  var re    = new RegExp(ldelim + '{1}([^?' + rdelim + ']+?)\\?([^:?' + rdelim + ']*?)[:?]{1}([^' + rdelim + ']*?)' + rdelim + '{1}', 'mg');
  var found = es.s.match(re);

  if (!found)
  {
    return s;
  }

  var replace = [];

  found.forEach(function (foundItem, i)
  {
    var variable = null,
        condition,
        truthy,
        falsy,
        parts;

    condition = foundItem.slice(ldelim.length, -ldelim.length);
    parts     = explode(' = ', condition, 2);

    if (parts.length === 2)
    {
      variable  = parts[0].trim();
      condition = parts[1].trim();
    }

    if ((parts = explode(' ?? ', condition, 2)).length === 2)
    {
      truthy    = parts[0].trim();
      falsy     = parts[1].trim();
      condition = truthy + ' !== ' + "''";
    }
    else if ((parts = explode(' ?: ', condition, 2)).length === 2)
    {
      condition = truthy = parts[0].trim();
      falsy     = parts[1].trim();
    }
    else
    {
      if ((parts = explode(' ? ', condition, 2)).length < 2)
      {
        return replace[i] = foundItem;
      }

      if (parts.length === 2)
      {
        condition = parts[0].trim();
        truthy    = parts[1].trim();
      }

      if ((parts = explode(' : ', truthy, 2)).length < 2)
      {
        return replace[i] = foundItem;
      }

      if (parts.length === 2)
      {
        truthy = parts[0].trim();
        falsy  = parts[1].trim();
      }
    }

    if (!variable)
    {
      return replace[i] = '{if ' + condition + '}{' + truthy + '}{else}{' + falsy + '}{/if}';
    }

    replace[i] = '{if ' + condition + '}{' + variable + ' = ' + truthy + '}{else}{' + variable + ' = ' + falsy + '}{/if}';
  });

  var ep = replaceParts(es.s, found, 24);

  return es.decode(ep.returnParts(ep.s, replace));
}

module.exports = ternaryFilter;

},{"./encodeTemplate":57,"./replaceParts":65,"locutus/php/strings/explode":28}],67:[function(require,module,exports){
function varFilter(s, ldelim, rdelim)
{
  ldelim = ldelim != null ? ldelim : '{';
  rdelim = rdelim != null ? rdelim : '}';

  var prev = '',
      re = new RegExp('(' + ldelim + '{1})(var{1})(\\s)(.*)(' + rdelim + '{1})', 'img');

  while (prev !== s)
  {
    s = (prev = s).replace(re, "$1$4$5");
  }

  return s;
}

module.exports = varFilter;

},{}],68:[function(require,module,exports){
var defaultFilter = require('./../helpers/defaultFilter');

Latte.prototype.registerFilter('pre', function (s)
{
  return defaultFilter(s);
});

},{"./../helpers/defaultFilter":56}],69:[function(require,module,exports){
var processDelims = require('./../helpers/replaceDelims').processDelims;

Latte.prototype.registerPlugin(
  'function',
  'l',
  function (params, data)
  {
    return Latte.prototype.left_delimiter || data.latte.ldelim;
  }
);

Latte.prototype.registerPlugin(
  'function',
  'r',
  function (params, data)
  {
    return Latte.prototype.right_delimiter || data.latte.rdelim;
  }
);

Latte.prototype.registerFilter('post', function (s)
{
  return processDelims(s, this.latte.ldelim, this.latte.rdelim);
});

},{"./../helpers/replaceDelims":64}],70:[function(require,module,exports){
var hasKeys = require('es5-util/js/hasKeys');

if (hasKeys(Latte.prototype, 'filtersGlobal.params') || hasKeys(Latte.prototype, 'filters_global.params'))
{
  Latte.prototype.registerFilter('params', function (actualParams)
  {
    if (actualParams.hasOwnProperty('expand') && typeof actualParams.expand === 'object')
    {
      for (var prop in actualParams.expand)
      {
        actualParams[prop] = actualParams.expand[prop];
      }
    }

    return actualParams;
  });
}

Latte.prototype.registerFilter('pre', function (s)
{
  return s.replace(/({)(((?! \(expand\) ).)*)( \(expand\) )([^}]*)(})/img, "$1$2 expand=$5$6");
});

},{"es5-util/js/hasKeys":3}],71:[function(require,module,exports){
var forFilter = require('./../helpers/forFilter');

Latte.prototype.registerFilter('pre', function (s)
{
  return forFilter(s);
});

},{"./../helpers/forFilter":58}],72:[function(require,module,exports){
var latteFilter = require('./../helpers/latteFilter');

Latte.prototype.registerFilter('pre', function (s)
{
  return latteFilter(s);
});

},{"./../helpers/latteFilter":61}],73:[function(require,module,exports){
Latte.prototype.registerFilter('pre', function (s)
{
  return s.replace(new RegExp('\\$iterator->', 'g'), '$iterator@');
});

},{}],74:[function(require,module,exports){
var nAttributesFilter = require('./../helpers/nAttributesFilter');

Latte.prototype.registerFilter('pre', function (s)
{
  return nAttributesFilter(s, Latte.prototype.left_delimiter || this.ldelim || '{', Latte.prototype.right_delimiter || this.rdelim || '}');
});

},{"./../helpers/nAttributesFilter":63}],75:[function(require,module,exports){
var isEmptyLoose    = require('es5-util/js/isEmptyLoose');
var isNotEmptyLoose = require('es5-util/js/isNotEmptyLoose');
var isNotSetTag     = require('es5-util/js/isNotSetTag');
var isSetTag        = require('es5-util/js/isSetTag');

Latte.postProcess = function (htmlString)
{
  if (typeof $ !== 'function')
  {
    return htmlString;
  }

  var $dom = $($.parseHTML('<div>' + htmlString + '</div>'));

  $dom.find('[n\\:tag-if]').each(function (index, el)
  {
    var $el = $(el),
        attr = 'n:tag-if';

    isSetTag($el.attr(attr).trim()) ? $el.removeAttr(attr) : $el.replaceWith($el.html());
  });

  $dom.find('[n\\:ifcontent]').each(function (index, el)
  {
    var $el = $(el),
        attr = 'n:ifcontent';

    isSetTag($el.html().trim()) ? $el.removeAttr(attr) : $el.remove();
  });

  $dom.find('[n\\:ifset]').each(function (index, el)
  {
    var $el = $(el),
        attr = 'n:ifset';

    isSetTag($el.attr(attr).trim()) ? $el.removeAttr(attr) : $el.remove();
  });

  $dom.find('[n\\:ifnotset]').each(function (index, el)
  {
    var $el = $(el),
        attr = 'n:ifnotset';

    isNotSetTag($el.attr(attr).trim()) ? $el.removeAttr(attr) : $el.remove();
  });

  $dom.find('[n\\:ifempty]').each(function (index, el)
  {
    var $el = $(el),
        attr = 'n:ifempty';

    isEmptyLoose($el.attr(attr).trim()) ? $el.removeAttr(attr) : $el.remove();
  });

  $dom.find('[n\\:ifnotempty]').each(function (index, el)
  {
    var $el = $(el),
        attr = 'n:ifnotempty';

    isNotEmptyLoose($el.attr(attr).trim()) ? $el.removeAttr(attr) : $el.remove();
  });

  return $dom.html();
};

},{"es5-util/js/isEmptyLoose":5,"es5-util/js/isNotEmptyLoose":7,"es5-util/js/isNotSetTag":9,"es5-util/js/isSetTag":13}],76:[function(require,module,exports){
Latte.prototype.registerPlugin(
  'block',
  'spaceless',
  function (params, content, data, repeat)
  {
    if (repeat.value)
    {
      return '';
    }
    return content.replace(/[ \t]*[\r\n]+[ \t]*/g, '');
  }
);

},{}],77:[function(require,module,exports){
var ternaryFilter = require('./../helpers/ternaryFilter');

Latte.prototype.registerFilter('pre', function (s)
{
  return ternaryFilter(s);
});

},{"./../helpers/ternaryFilter":66}],78:[function(require,module,exports){
var varFilter = require('./../helpers/varFilter');

Latte.prototype.registerFilter('pre', function (s)
{
  return varFilter(s);
});

},{"./../helpers/varFilter":67}]},{},[56,57,58,59,60,61,62,63,64,65,66,67,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,68,69,70,71,72,73,74,75,76,77,78]);
