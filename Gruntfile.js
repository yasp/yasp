module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    doctool: {
      commandsjs: {
        converter: "commandsjs",
        input: "src/app/instructions/",
        output: "src/app/js/commands.js"
      },
      html: {
        converter: "htmlsimple",
        input: "src/app/instructions/",
        output: "src/app/help/help.html"
      },
/*      complex: {
        converter: "htmlcomplex",
        input: "src/app/instructions/",
        output: "src/app/help/complex_help.html"
      }*/
    },
    watch: {
      commands: {
        files: ['src/app/instructions/**/*.js'],
        tasks: ['doctool']
      },
      doc: {
        files: ['src/app/**/*.js'],
        tasks: ['jsdoc:dist']
      }
    },
    jsdoc : {
      dist : {
        src: [
          './src/app/js/**/*.js',
        ],
        options: {
          destination: 'doc/jsdoc'
        }
      }
    },
    connect: {
      server: {
        options: {
          port: 8082,
          base: 'src',
          keepalive: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-doctool');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-jsdoc');

  grunt.registerTask('default', [ ]);
  grunt.registerTask('commands', [ 'doctool' ]);
  grunt.registerTask('watchcommands', [ 'watch:commands' ]);
  grunt.registerTask('http', [ 'connect' ]);
  grunt.registerTask('doc', [ 'jsdoc' ]);
  grunt.registerTask('watchdoc', [ 'watch:doc' ]);
};
