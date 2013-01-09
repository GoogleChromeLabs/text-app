var entriesToOpen = [];
var instances = [];

function ifShowFrame() {
  var version = parseInt(navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);
  var os = 'other';
  if (navigator.appVersion.indexOf('Linux') != -1) {
    os = 'linux';
  } else if (navigator.appVersion.indexOf('CrOS') != -1) {
    os = 'cros';
  }

  return (os === 'linux' && version < 26) ||
         (os === 'cros' && version < 24);
}

function launch(launchData) {
  var options = {
    frame: (ifShowFrame() ? 'chrome' : 'none'),
    minWidth: 400,
    minHeight: 400,
    width: 700,
    height: 750,
    left: 0,
    top: 0
  };

  var entries = [];
  if (launchData && launchData.items) {
    for (var i = 0; i < launchData.items.length; i++) {
      entries.push(launchData.items[i].entry);
    }
  }

  if (entries.length > 0 && instances.length > 0) {
    console.log('Opening files in existing window.');
    instances[0].openEntries(entries);
  } else {
    entriesToOpen.push.apply(entriesToOpen, entries);
    console.log('Files to open:', entriesToOpen);
    chrome.app.window.create('index.html', options, function(win) {
      console.log('Window opened:', win);
      win.onClosed.addListener(onWindowClosed.bind(undefined, win));
    });
  }
}

function onWindowClosed(win) {
  console.log('Window closed:', win);
  if (!win.contentWindow || !win.contentWindow.textDrive)
    return;
  var td = win.contentWindow.textDrive;
  for (var i = 0; i < instances.length; i++) {
    if (td === instances[i]) {
      instances.splice(i, 1);
    }
  }
};

function onWindowReady(td) {
  instances.push(td);
  td.setHasChromeFrame(ifShowFrame());
  openEntriesInWindow(td);
};

function openEntriesInWindow(td) {
  if (entriesToOpen.length > 0) {
    td.openEntries(entriesToOpen);
    entriesToOpen = [];
  } else {
    td.openNew();
  }
};

chrome.app.runtime.onLaunched.addListener(launch);
