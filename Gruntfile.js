module.exports = function (grunt) {
  'use strict'

  if (!grunt.option('filename')) {
    grunt.option('filename', 'latte.js')
  }

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    browserify: {
      js: {
        src: ['src/filters/**/*.js', 'src/tags/**/*.js'],
        dest: 'src/addonFunctions.js'
      }
    },
    build: {
      all: {
        dest: "dist/<%= grunt.option('filename') %>"
      }
    },
    eslint: {
      src: ['src/**/*.js', '!src/filters/**/*.js', '!src/tags/**/*.js', '!src/utils/**/*.js', '!src/addonFunctions.js', 'Gruntfile.js', 'karma.conf.js', 'test/**/*.js', 'build/*.js']
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js'
      }
    },
    uglify: {
      all: {
        options: {
          preserveComments: false,
          sourceMap: false,
          report: 'min',
          banner: '/*!\n' +
            ' * LatteJS template engine (v<%= pkg.version %>)\n' +
            ' * https://opensource.org/licenses/MIT\n' +
            ' */\n'
        },
        files: {
          "dist/<%= grunt.option('filename').replace('.js', '.min.js') %>": ["dist/<%= grunt.option('filename') %>"]
        }
      }
    },
    copy: {
      main: {
        files: [
          {
            src: "dist/<%= grunt.option('filename').replace('.js', '.min.js') %>",
            dest: "examples/simple/<%= grunt.option('filename').replace('.js', '.min.js') %>"
          },
          {
            src: "dist/<%= grunt.option('filename').replace('.js', '.min.js') %>",
            dest: "examples/requirejs/js/<%= grunt.option('filename').replace('.js', '.min.js') %>"
          }
        ]
      }
    }
  })

  // Load grunt tasks from NPM packages
  require('load-grunt-tasks')(grunt)

  // Integrate LatteJS specific tasks
  grunt.loadTasks('build/tasks')

  // Register tasks from karma, uglify and copy.
  grunt.loadNpmTasks('grunt-karma')
  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-contrib-copy')
  grunt.loadNpmTasks('grunt-browserify')

  // Order goes as test, compile, compress and distribute.
  grunt.registerTask('default', ['eslint', 'browserify', 'karma', 'build', 'uglify', 'copy'])
}
