/*global module:false*/
/*global require:false*/
module.exports = function(grunt) {

  grunt.initConfig({
    manifest: '<json:app/manifest.json>',
    meta: {
      manifestPath: 'app/manifest.json',
      prefix: '(function(angular) {',
      suffix: '})(window.angular);',
      banner: '/* <%= manifest.name %> - v<%= manifest.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %> */'
    },
    lint: {
      files: ['grunt.js', 'app/js/app.js', 'app/js/*/*.js']
    },
    concat: {
      js: {
        src: ['<banner:meta.prefix>', 'app/js/app.js', 'app/js/*/*.js', '<banner:meta.suffix>'],
        dest: 'build/textdrive.js'
      },
      css: {
        src: ['app/css/*.css'],
        dest: 'build/textdrive.css'
      }
    },
    min: {
      app: {
        src: ['<banner:meta.banner>', '<config:concat.js.dest>'],
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
        TD: true,
        angular: true,
        ace: true,

        PERSISTENT: true,
        FileError: true,
        chrome: true,
        WebKitBlobBuilder: true
      }
    },
    coffee: {
      unit: ['test/unit/*/*.coffee']
    },
    less: {
      app: ['app/less/*.less']
    },
    watch: {
      unit: {
        files: 'test/unit/*/*.coffee',
        tasks: 'coffee:unit'
      },
      css: {
        files: 'app/less/*.less',
        tasks: 'less:app'
      }
    }
  });

  grunt.loadTasks('tasks');
  grunt.registerTask('build', 'less concat min');
  grunt.registerTask('default', 'clean build pack');
};
