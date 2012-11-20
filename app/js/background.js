chrome.app.runtime.onLaunched.addListener(function (launchData) {
  var options = {
    frame: 'none',
    minWidth: 400,
    minHeight: 400,
    width: 700,
    height: 750,
    left: 0,
    top: 0
  };

  chrome.app.window.create('index.html', options, function (win) {
    console.log('Window created.', launchData);
  });
});
