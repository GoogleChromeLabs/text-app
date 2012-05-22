chrome.experimental.app.onLaunched.addListener(function() {
  var opts = {
    url: 'index.html',
    width: 1024,
    height: 768,
    left: 100,
    top: 100,
    type: 'shell'
  };
  chrome.windows.create(opts, function(tab) {
    //var targetId = tab.id;
  });
});




chrome.runtime.onInstalled.addListener(function() {
  console.log('INSTALLED');
});


//chrome.experimental.identity.getAuthToken(function(token) {
//  console.log('token', token);
//
//});