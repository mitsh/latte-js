define(['parser/parser', 'processor/processor', 'util/objectmerge'], function (LatteParser, LatteProcessor, objectMerge)
{
  var version = '@VERSION'

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

  return Latte
})
