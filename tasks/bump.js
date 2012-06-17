module.exports = function(grunt) {
  grunt.registerTask('bump', 'Increment the version number.', function(versionType) {
    var manifest = grunt.config('manifest');
    var type = {
      patch: 2,
      minor: 1,
      major: 0
    };

    // increment the minor version
    var parts = manifest.version.split('.');
    var idx = type[versionType || 'patch'];

    parts[idx] = parseInt(parts[idx], 10) + 1;
    while(++idx < parts.length) {
      parts[idx] = 0;
    }
    manifest.version = parts.join('.');

    grunt.file.write(grunt.config('meta.manifestPath'), JSON.stringify(manifest, null, '  '));
    grunt.log.write('Manifest version bumped to ' + manifest.version);
  });
};
