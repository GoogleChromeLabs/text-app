/*global module:false*/
module.exports = function(grunt) {

  grunt.initConfig({
    manifest: '<json:app/manifest.json>',
    meta: {
      prefix: '(function(angular) {',
      suffix: '})(window.angular);',
      banner: '/* <%= manifest.name %> - v<%= manifest.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %> */'
    },
    lint: {
      files: ['grunt.js', 'app/js/app.js', 'app/js/*/*.js']
    },
    concat: {
      app: {
        src: ['<banner:meta.prefix>', 'app/js/app.js', 'app/js/*/*.js', '<banner:meta.suffix>'],
        dest: 'build/textdrive.js'
      }
    },
    min: {
      app: {
        src: ['<banner:meta.banner>', '<config:concat.app.dest>'],
        dest: 'build/textdrive.min.js'
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true,
        proto: true
      },
      globals: {
        angular: true,
        ace: true,
        app: true,
        PERSISTENT: true,
        FileError: true,
        EditSession: true
      }
    },
    coffee: {
      unit: ['test/unit/*/*Spec.coffee']
    },
    watch: {
      files: 'test/unit/*/*Spec.coffee',
      tasks: 'coffee:unit'
    }
  });

  grunt.registerMultiTask('coffee', 'Compile coffee script', function() {
    var coffee = require('coffee-script');

    grunt.file.expandFiles(this.data).forEach(function(filepath) {
      grunt.log.writeln('Compiling ' + filepath);
      try {
        // TODO(vojta): make this async
        var js = coffee.compile(grunt.file.read(filepath), {bare: true});
        if (js) grunt.file.write(filepath.replace(/\.coffee$/, '.js'), js);
      }
      catch (e) {
        grunt.log.error(e.message);
      }
    });
  });

  // TODO(vojta): refactor this hardcoded mess
  // TODO(vojta): bump version
  grunt.registerTask('pack', 'Create zip package of the app.', function() {
    var DST = 'build/package/';
    /*global require:false*/
    var exec = require('child_process').exec;

    // concat css files
    // TODO(vojta): use LESS
    grunt.file.write(DST + 'textdrive.css', grunt.file.read('app/css/app.css') + grunt.file.read('app/css/tabs.css'));

    // copy files
    grunt.file.copy('app/manifest.json', DST + 'manifest.json');
    grunt.file.copy('app/js/background.js', DST + 'js/background.js');
    grunt.file.copy('build/textdrive.js', DST + 'js/textdrive.js');
    grunt.file.copy('app/icon_128.png', DST + 'icon_128.png');

    // replace index.html stuff
    var content = grunt.file.read('app/index.html');
    content = content.replace('css/app.css', 'textdrive.css');
    content = content.replace(/\n(.*)css\/tabs\.css(.*)\n/, '\n');
    content = content.replace('lib/ace/src/ace-uncompressed-noconflict.js', 'lib/ace/ace-uncompressed-noconflict.js');
    content = content.replace('js/app.js', 'js/textdrive.js');
    content = content.replace(/<!--controllers-->(.|\n)*<\/body>/m, '</body>');

    grunt.file.write(DST + 'index.html', content);

    // angular
    grunt.file.copy('app/lib/angular/angular.js', DST + 'lib/angular/angular.js');

    // bootstrap
    grunt.file.copy('app/lib/bootstrap/css/bootstrap.css', DST + 'lib/bootstrap/css/bootstrap.css');
    grunt.file.copy('app/lib/bootstrap/img/glyphicons-halflings.png', DST + 'lib/bootstrap/img/glyphicons-halflings.png');
    grunt.file.copy('app/lib/bootstrap/img/glyphicons-halflings-white.png', DST + 'lib/bootstrap/img/glyphicons-halflings-white.png');

    // font-awesome
    grunt.file.copy('app/lib/font-awesome/css/font-awesome.css', DST + 'lib/font-awesome/css/font-awesome.css');
    grunt.file.copy('app/lib/font-awesome/font/fontawesome-webfont.eot', DST + 'lib/font-awesome/font/fontawesome-webfont.eot');
    grunt.file.copy('app/lib/font-awesome/font/fontawesome-webfont.svg', DST + 'lib/font-awesome/font/fontawesome-webfont.svg');
    grunt.file.copy('app/lib/font-awesome/font/fontawesome-webfont.svgz', DST + 'lib/font-awesome/font/fontawesome-webfont.svgz');
    grunt.file.copy('app/lib/font-awesome/font/fontawesome-webfont.ttf', DST + 'lib/font-awesome/font/fontawesome-webfont.ttf');
    grunt.file.copy('app/lib/font-awesome/font/fontawesome-webfont.woff', DST + 'lib/font-awesome/font/fontawesome-webfont.woff');

    // ace
    grunt.file.copy('app/lib/ace/src/ace-uncompressed-noconflict.js', DST + 'lib/ace/ace-uncompressed-noconflict.js');
    grunt.file.copy('app/lib/ace/src/theme-monokai-uncompressed-noconflict.js', DST + 'lib/ace/theme-monokai-uncompressed-noconflict.js');
    grunt.file.copy('app/lib/ace/src/mode-javascript-uncompressed-noconflict.js', DST + 'lib/ace/mode-javascript-uncompressed-noconflict.js');
    grunt.file.copy('app/lib/ace/src/worker-javascript.js', DST + 'lib/ace/worker-javascript.js');

    // create a zip
    exec('zip -vr build/textdrive.zip ' + DST, this.async());
  });

  // Default task.
  grunt.registerTask('default', 'lint concat min');
};
