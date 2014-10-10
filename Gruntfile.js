/*global module:false*/
module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: {
        files: ['client/**/*.js', 'app.js', 'lib/**/*.js']
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task.
  grunt.registerTask('default', ['jshint']);

};
