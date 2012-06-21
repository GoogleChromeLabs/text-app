chrome.experimental.app.onLaunched.addListener(function (launchData) {
  var options = {
    frame: 'none',
    minWidth: 400,
    minHeight: 400,
    width: 900,
    height: 900
  };

  chrome.appWindow.create('index.html', options, function (win) {
    win.launchData = launchData;
//    win.onload = function () {};
  });
});


//chrome.runtime.onInstalled.addListener(function() {
//  console.log('INSTALLED');
//});


//chrome.experimental.identity.getAuthToken(function(token) {
//  console.log('token', token);
//
//});