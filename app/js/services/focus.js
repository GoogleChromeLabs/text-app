app.value('focus', function(selector) {
  setTimeout(function() {
    document.querySelector(selector).focus();
  }, 0);
});