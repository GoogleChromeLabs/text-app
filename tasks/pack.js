module.exports = function(grunt) {
  grunt.registerTask('pack', 'Create zip package of the app.', function(arg) {
    var version = grunt.config('manifest').version;
    var exec = require('child_process').exec;

    var copyAll = function(src, dest) {
      grunt.log.writeln('Copy ' + src + ' -> ' + dest);
      grunt.file.expand(src).forEach(function(filepath) {
        grunt.file.copy(filepath, filepath.replace(/^app\//, dest));
      });
    };

    var copyOne = function(src, dest, process) {
      grunt.log.writeln('Copy ' + src + ' -> ' + dest);
      grunt.file.copy(src, dest, {process: process});
    };

    var cssFile = grunt.config('concat.css.dest').replace(/^build/, 'css');
    var jsFile = grunt.config('concat.js.dest').replace(/^build/, 'js');
    var angularFile = 'lib/angular/angular.js';
    var aceFolder = 'lib/ace/src-noconflict/';

    if (arg === 'min') {
      // create minified package
      jsFile = jsFile.replace('.js', '.min.js');
      angularFile = angularFile.replace('.js', '.min.js');
      aceFolder = 'lib/ace/src-min-noconflict/';
      version += '-min';
    }

    var DST = 'build/package-' + version + '/';

    // copy files
    copyOne('build/textdrive.js', DST + jsFile);
    copyOne('build/textdrive.css', DST + cssFile);
    copyAll('app/manifest.json', DST);
    copyAll('app/js/background.js', DST);
    copyAll('app/icon/*x*.png', DST);


    // copy and rewrite index.html
    copyOne('app/index.html', DST + 'index.html', function(content) {
      content = content.replace(/<!-- APP-CSS -->(.|\n)*<!-- APP-CSS-END -->/m, '<link href="' + cssFile + '" rel="stylesheet">');
      content = content.replace(/\n<!-- APP-JS -->(.|\n)*<!-- APP-JS-END -->/m, '<script src="' + jsFile + '" type="text/javascript"></script>');
      content = content.replace('lib/angular/angular.js', angularFile);
      content = content.replace(/lib\/ace\/src-noconflict\//g, aceFolder);
      return content;
    });

    // angular
    copyAll('app/' + angularFile, DST);

    // font-awesome
    copyAll('app/lib/font-awesome/css/font-awesome.css', DST);
    copyAll('app/lib/font-awesome/font/fontawesome-webfont.*', DST);

    // ace
    copyAll('app/' + aceFolder + '*.js', DST);

    // create a zip
    exec('zip -vr build/textdrive-' + version + '.zip ' + DST, this.async());
  });
};
