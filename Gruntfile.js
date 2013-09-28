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
      ],
    },
    qunit: {
      all: ['src/app/test/*.html']
    }
  });

  grunt.loadNpmTasks('grunt-curl');
  grunt.loadNpmTasks('grunt-contrib-qunit');

  grunt.registerTask('default', [ ]);
  grunt.registerTask('deps', [ 'curl-dir' ]);
  grunt.registerTask('test', [ 'qunit' ]);
};
