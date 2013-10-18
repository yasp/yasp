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
        'https://raw.github.com/necolas/normalize.css/master/normalize.css'
      ],
      'src/lib/fonts': [
        'https://raw.github.com/twbs/bootstrap/master/dist/fonts/glyphicons-halflings-regular.eot',
        'https://raw.github.com/twbs/bootstrap/master/dist/fonts/glyphicons-halflings-regular.svg',
        'https://raw.github.com/twbs/bootstrap/master/dist/fonts/glyphicons-halflings-regular.ttf',
        'https://raw.github.com/twbs/bootstrap/master/dist/fonts/glyphicons-halflings-regular.woff'
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
