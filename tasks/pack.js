module.exports = function(grunt) {
  grunt.registerTask('pack', 'Create zip package of the app.', function() {
    var version = grunt.config('manifest').version;
    var DST = 'build/package-' + version + '/';
    var exec = require('child_process').exec;

    var copyAll = function(src, dest) {
      grunt.file.expand(src).forEach(function(filepath) {
        // grunt.log.writeln('Copy ' + filepath ' -> ' + filepath.replace(/^app\//, dest));
        grunt.file.copy(filepath, filepath.replace(/^app\//, dest));
      });
    };

    var cssFile = grunt.config('concat.css.dest').replace(/^build/, 'css');
    var jsFile = grunt.config('concat.js.dest').replace(/^build/, 'js');

    // copy files
    grunt.file.copy('build/textdrive.js', DST + jsFile);
    grunt.file.copy('build/textdrive.css', DST + cssFile);
    copyAll('app/manifest.json', DST);
    copyAll('app/js/background.js', DST);
    copyAll('app/icon_*.png', DST);


    // copy and rewrite index.html
    grunt.file.copy('app/index.html', DST + 'index.html', {
      process: function(content) {
        content = content.replace(/<!-- APP-CSS -->(.|\n)*<!-- APP-CSS-END -->/m, '<link href="' + cssFile + '" rel="stylesheet">');
        return content.replace(/\n<!-- APP-JS -->(.|\n)*<!-- APP-JS-END -->/m, '<script src="' + jsFile + '" type="text/javascript"></script>');
      }
    });

    // angular
    copyAll('app/lib/angular/angular.js', DST);

    // bootstrap
    copyAll('app/lib/bootstrap/css/bootstrap.css', DST);
    copyAll('app/lib/bootstrap/img/glyphicons-*.png', DST);

    // font-awesome
    copyAll('app/lib/font-awesome/css/font-awesome.css', DST);
    copyAll('app/lib/font-awesome/font/fontawesome-webfont.*', DST);

    // ace
    copyAll('app/lib/ace/src-noconflict/*.js', DST);

    // create a zip
    exec('zip -vr build/textdrive-' + version + '.zip ' + DST, this.async());
  });
};
