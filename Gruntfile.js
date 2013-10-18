module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    'curl-dir': {
      'src/lib/js': [
        'http://code.jquery.com/jquery-1.10.2.min.js',
        'http://code.jquery.com/qunit/qunit-1.12.0.js',
        'https://raw.github.com/AStepaniuk/qunit-parameterize/master/qunit-parameterize.js',
        'http://netdna.bootstrapcdn.com/bootstrap/3.0.0/js/bootstrap.min.js'
        
      ],
      'src/lib/css': [
        'http://code.jquery.com/qunit/qunit-1.12.0.css',
        'http://netdna.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap.min.css'
      ]
    },
    qunit: {
      test: ['src/app/test/*.html']
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
