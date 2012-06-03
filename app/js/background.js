chrome.experimental.app.onLaunched.addListener(function () {
  var options = {
    frame: 'custom',
    width: 900,
    height: 900
  };

  chrome.appWindow.create('index.html', options, function (win) {
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