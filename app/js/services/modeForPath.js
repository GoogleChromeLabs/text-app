TD.factory('modeForPath', function(MODES) {
  return function(path) {
    for (var i = 0, ii = MODES.length; i < ii; i++) {
      if (MODES[i].supportsFile(path)) {
        return MODES[i];
      }
    }

    // default
    return MODES.byId.text;
  };
});
