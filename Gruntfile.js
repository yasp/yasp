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
  });

  grunt.loadNpmTasks('grunt-curl');

  grunt.registerTask('default', [ ]);
  grunt.registerTask('deps', [ 'curl-dir' ]);
};
