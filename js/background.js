/**
 * @constructor
 */
function Background() {
  this.entriesToOpen_ = [];
  this.windows_ = [];
}

/**
 * @return {boolean}
 * True if the system window frame should be shown. It is on the systems where
 * borderless window can't be dragged or resized.
 */
Background.prototype.ifShowFrame_ = function() {
  var version = parseInt(navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);
  var os = 'other';
  if (navigator.appVersion.indexOf('Linux') != -1) {
    os = 'linux';
  } else if (navigator.appVersion.indexOf('CrOS') != -1) {
    os = 'cros';
  } else if (navigator.appVersion.indexOf('Mac OS X') != -1) {
    os = 'mac';
  }

  return os === 'linux' && version < 27 ||
         os === 'mac' && version < 25;
};

Background.prototype.newWindow = function() {
  var options = {
    frame: (this.ifShowFrame_() ? 'chrome' : 'none'),
    minWidth: 400,
    minHeight: 400,
    width: 700,
    height: 700
  };


  chrome.app.window.create('index.html', options, function(win) {
    console.log('Window opened:', win);
    win.onClosed.addListener(this.onWindowClosed.bind(this, win));
  }.bind(this));
};

/**
 * @param {Object.<string, Object>} launchData
 * Handle onLaunch event.
 */
Background.prototype.launch = function(launchData) {
  var entries = [];
  if (launchData && launchData['items']) {
    for (var i = 0; i < launchData['items'].length; i++) {
      entries.push(launchData['items'][i]['entry']);
    }
  }

  if (this.windows_.length == 0)
    this.newWindow();

  for (var i = 0; i < entries.length; i++) {
    chrome.fileSystem.getWritableEntry(
        entries[i],
        function(entry) {
          if (this.windows_.length > 0) {
            this.windows_[0].openEntries([entry]);
          } else {
            this.entriesToOpen_.push(entry);
          }
        }.bind(this));
  }
};

/**
 * @param {Window} win
 * Handle onClosed.
 */
Background.prototype.onWindowClosed = function(win) {
  console.log('Window closed:', win);
  if (!win.contentWindow || !win.contentWindow.textApp) {
    console.warn('No Text.app object in the window being closed:',
                 win.contentWindow, win.contentWindow.textApp);
    return;
  }
  var td = win.contentWindow.textApp;
  for (var i = 0; i < this.windows_.length; i++) {
    if (td === this.windows_[i]) {
      this.windows_.splice(i, 1);
    }
  }

  var toSave = td.getFilesToSave();
  console.log('Got ' + toSave.length + ' files to save:', toSave);
  for (var i = 0; i < toSave.length; i++) {
    var entry = toSave[i].entry;
    var contents = toSave[i].contents;
    this.saveFile_(entry, contents);
  }
};

/**
 * @param {FileEntry} entry
 * @param {string} contents
 */
Background.prototype.saveFile_ = function(entry, contents) {
  util.writeFile(
      entry, contents, function() {console.log('Saved', entry.name);});
};

/**
 * @param {TextApp} td
 * Called by the TextApp object in the window when the window is ready.
 */
Background.prototype.onWindowReady = function(td) {
  this.windows_.push(td);
  td.setHasChromeFrame(this.ifShowFrame_());

  if (this.entriesToOpen_.length > 0) {
    td.openEntries(this.entriesToOpen_);
    this.entriesToOpen_ = [];
  } else {
    td.openNew();
  }
};

/**
 * @param {FileEntry} entry
 * @param {function(FileEntry)} callback
 * Make a copy of a file entry.
 */
Background.prototype.copyFileEntry = function(entry, callback) {
  chrome.fileSystem.getWritableEntry(entry, callback);
};

var background = new Background();
chrome.app.runtime.onLaunched.addListener(background.launch.bind(background));


/* Exports */
window['background'] = background;
Background.prototype['copyFileEntry'] = Background.prototype.copyFileEntry;
Background.prototype['onWindowReady'] = Background.prototype.onWindowReady;
Background.prototype['newWindow'] = Background.prototype.newWindow;
