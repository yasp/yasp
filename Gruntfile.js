module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    'curl-dir': {
      'src/lib/js': [
        'http://code.jquery.com/jquery-1.10.2.min.js',
        'http://code.jquery.com/qunit/qunit-1.12.0.js',
        'https://raw.github.com/AStepaniuk/qunit-parameterize/master/qunit-parameterize.js',
        'https://raw.github.com/twbs/bootstrap/master/dist/js/bootstrap.min.js',
        'https://raw.github.com/marijnh/CodeMirror/master/lib/codemirror.js'
        
      ],
      'src/lib/css': [
        'http://code.jquery.com/qunit/qunit-1.12.0.css',
        'https://raw.github.com/twbs/bootstrap/master/dist/css/bootstrap.min.css',
        'https://raw.github.com/marijnh/CodeMirror/master/lib/codemirror.css',
        'https://raw.github.com/necolas/normalize.css/master/normalize.css',
        'https://raw.github.com/marijnh/CodeMirror/master/lib/codemirror.css'
      ],
      'src/lib/fonts': [
        'https://raw.github.com/twbs/bootstrap/master/dist/fonts/glyphicons-halflings-regular.eot',
        'https://raw.github.com/twbs/bootstrap/master/dist/fonts/glyphicons-halflings-regular.svg',
        'https://raw.github.com/twbs/bootstrap/master/dist/fonts/glyphicons-halflings-regular.ttf',
        'https://raw.github.com/twbs/bootstrap/master/dist/fonts/glyphicons-halflings-regular.woff'
      ],
      'src/lib/themes': [
        'https://raw.github.com/marijnh/CodeMirror/master/theme/3024-day.css',
        'https://raw.github.com/marijnh/CodeMirror/master/theme/3024-night.css',
        'https://raw.github.com/marijnh/CodeMirror/master/theme/ambiance.css',
        'https://raw.github.com/marijnh/CodeMirror/master/theme/base16-dark.css',
        'https://raw.github.com/marijnh/CodeMirror/master/theme/base16-light.css',
        'https://raw.github.com/marijnh/CodeMirror/master/theme/blackboard.css',
        'https://raw.github.com/marijnh/CodeMirror/master/theme/cobalt.css',
        'https://raw.github.com/marijnh/CodeMirror/master/theme/eclipse.css',
        'https://raw.github.com/marijnh/CodeMirror/master/theme/cobalt.css',
        'https://raw.github.com/marijnh/CodeMirror/master/theme/elegant.css',
        'https://raw.github.com/marijnh/CodeMirror/master/theme/midnight.css',
        'https://raw.github.com/marijnh/CodeMirror/master/theme/monokai.css',
        'https://raw.github.com/marijnh/CodeMirror/master/theme/neat.css',
        'https://raw.github.com/marijnh/CodeMirror/master/theme/night.css',
        'https://raw.github.com/marijnh/CodeMirror/master/theme/paraiso-dark.css',
        'https://raw.github.com/marijnh/CodeMirror/master/theme/paraiso-light.css',
        'https://raw.github.com/marijnh/CodeMirror/master/theme/rubyblue.css',
        'https://raw.github.com/marijnh/CodeMirror/master/theme/solarized.css',
        'https://raw.github.com/marijnh/CodeMirror/master/theme/the-matrix.css',
        'https://raw.github.com/marijnh/CodeMirror/master/theme/tomorrow-night-eighties.css',
        'https://raw.github.com/marijnh/CodeMirror/master/theme/twilight.css',
        'https://raw.github.com/marijnh/CodeMirror/master/theme/vibrant-ink.css',
        'https://raw.github.com/marijnh/CodeMirror/master/theme/xq-dark.css',
        'https://raw.github.com/marijnh/CodeMirror/master/theme/xq-light.css'
      ],
      'src/lib/addon': [
        'https://raw.github.com/marijnh/CodeMirror/master/addon/hint/show-hint.js',
        'https://raw.github.com/marijnh/CodeMirror/master/addon/hint/show-hint.css',
        'https://raw.github.com/marijnh/CodeMirror/master/addon/lint/lint.js',
        'https://raw.github.com/marijnh/CodeMirror/master/addon/lint/lint.css'
      ]
    },
    qunit: {
      test: ['src/app/test/index.html']
    },
    doctool: {
      doc: {
        converter: "commandsjs",
        input: "src/app/instructions/",
        output: "src/app/js/commands.js"
      }
    },
    watch: {
      watchcommands: {
        files: ['src/app/instructions/**/*.js'],
        tasks: ['doctool:doc']
      }
    }
  });

  grunt.loadNpmTasks('grunt-curl');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-doctool');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', [ ]);
  grunt.registerTask('deps', [ 'curl-dir' ]);
  grunt.registerTask('test', [ 'qunit' ]);
  grunt.registerTask('commandsjs', [ 'doctool' ]);
  grunt.registerTask('watchcommands', [ 'watch' ]);
};
