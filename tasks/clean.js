module.exports = function(grunt) {
  grunt.registerTask('clean', 'Clean the whole build directory.', function() {
    require('child_process').exec('rm -rdf build', this.async());
  });
};
