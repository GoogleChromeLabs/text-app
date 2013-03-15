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

/**
 * @param {Object.<string, Object>} launchData
 * Handle onLaunch event.
 */
Background.prototype.launch = function(launchData) {
  var options = {
    frame: (this.ifShowFrame_() ? 'chrome' : 'none'),
    minWidth: 400,
    minHeight: 400,
    width: 700,
    height: 700,
    left: 0,
    top: 0
  };

  var entries = [];
  if (launchData && launchData['items']) {
    for (var i = 0; i < launchData['items'].length; i++) {
      entries.push(launchData['items'][i]['entry']);
    }
  }

  if (entries.length > 0 && this.windows_.length > 0) {
    console.log('Opening files in existing window.');
    this.windows_[0].openEntries(entries);
  } else {
    this.entriesToOpen_.push.apply(this.entriesToOpen_, entries);
    console.log('Files to open:', this.entriesToOpen_);
    chrome.app.window.create('index.html', options, function(win) {
      console.log('Window opened:', win);
      win.onClosed.addListener(this.onWindowClosed.bind(this, win));
    }.bind(this));
  }
};

/**
 * @param {Window} win
 * Handle onClosed.
 */
Background.prototype.onWindowClosed = function(win) {
  console.log('Window closed:', win);
  if (!win.contentWindow || !win.contentWindow.textDrive)
    return;
  var td = win.contentWindow.textDrive;
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
  var blob = new Blob([contents], {type: 'text/plain'});
  chrome.fileSystem.getWritableEntry(
      entry,
      function(entry2) {
        entry2.createWriter(function(writer) {
          writer.onerror = util.handleFSError;

          writer.onwriteend = function(e) {
            // File truncated.
            writer.onwriteend = function(e) {
              console.log('Saved', entry.name);
            };

            writer.write(blob);
          }.bind(this);

          writer.truncate(blob.size);
        }.bind(this));
      }.bind(this));
};

/**
 * @param {TextDrive} td
 * Called by the TextDrive object in the window when the window is ready.
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

var background = new Background();
chrome.app.runtime.onLaunched.addListener(background.launch.bind(background));


/* Exports */
window['background'] = background;
Background.prototype['onWindowReady'] = Background.prototype.onWindowReady;
