module.exports = function(grunt) {
 grunt.registerMultiTask('less', 'Compile less styles.', function() {
    var less = require('less');
    // using patched grunt, see https://github.com/cowboy/grunt/issues/46
    var files = grunt._watch_changed_files || grunt.file.expand(this.data);

    files.forEach(function(filepath) {
      less.render(grunt.file.read(filepath), function(e, css) {
        if (e) {
          grunt.log.error(e.message);
        } else {
          var cssPath = filepath.replace(/less/g, 'css');
          grunt.file.write(cssPath, css);
          grunt.log.writeln('Generated ' + cssPath);
        }
      });
    });
  });
};
