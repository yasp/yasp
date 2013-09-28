module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    'curl-dir': {
      'src/lib/js': [
        'http://code.jquery.com/jquery-1.10.2.min.js',
        'http://code.jquery.com/qunit/qunit-1.12.0.js',
        'https://raw.github.com/AStepaniuk/qunit-parameterize/master/qunit-parameterize.js'
      ],
      'src/lib/css': [
        'http://code.jquery.com/qunit/qunit-1.12.0.css'
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
    }
  });

  grunt.loadNpmTasks('grunt-curl');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-doctool');

  grunt.registerTask('default', [ ]);
  grunt.registerTask('deps', [ 'curl-dir' ]);
  grunt.registerTask('test', [ 'qunit' ]);
  grunt.registerTask('commandsjs', [ 'doctool' ]);
};
