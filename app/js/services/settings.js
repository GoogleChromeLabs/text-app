var WhiteTheme = function(name, id) {
  this.name = name;
  this.id = id || 'ace/theme/' + name.toLowerCase().replace(/\s/g, '_');
  this.cls = 'ace-theme-white';
};

var BlackTheme = function(name, id) {
  WhiteTheme.call(this, name, id);
  this.cls = 'ace-theme-black';
};

app.service('settings', function(editor, localStorage, log) {
  this.THEMES = [
    new WhiteTheme('Chrome'),
    new WhiteTheme('Clouds'),
    new BlackTheme('Clouds Midnight'),
    new BlackTheme('Cobalt'),
    new WhiteTheme('Crimson Editor'),
    new WhiteTheme('Dawn'),
    new WhiteTheme('Dreamweaver'),
    new WhiteTheme('Eclipse'),
    new BlackTheme('idleFingers', 'ace/theme/idle_fingers'),
    new BlackTheme('krTheme', 'ace/theme/kr_theme'),
    new BlackTheme('Merbivore'),
    new BlackTheme('Merbivore Soft'),
    new BlackTheme('Mono Industrial'),
    new BlackTheme('Monokai'),
    new BlackTheme('Pastel on dark'),
    new BlackTheme('Solarized Dark'),
    new WhiteTheme('Solarized Light'),
    new WhiteTheme('TextMate'),
    new BlackTheme('Twilight'),
    new WhiteTheme('Tomorrow'),
    new BlackTheme('Tomorrow Night'),
    new BlackTheme('Tomorrow Night Blue'),
    new BlackTheme('Tomorrow Night Bright'),
    new BlackTheme('Tomorrow Night 80s', 'ace/theme/tomorrow_night_eighties'),
    new BlackTheme('Vibrant Ink')
  ];

  var self = this, data = {};
  var defineProperty = function(name, behavior) {
    self.__defineGetter__(name, function() {
      return data[name];
    });

    self.__defineSetter__(name, function(value) {
      data[name] = value;
      behavior.call(self, value);
    });
  };

  defineProperty('theme', function(theme) {
    editor.setTheme(theme.id);
  });

  this.store = function() {
    localStorage.setItem('theme', this.theme.id);
    log('saving theme', this.theme.id);
  };

  this.load = function() {
    var id = localStorage.getItem('theme') || 'ace/theme/monokai';

    for (var i = 0; i < this.THEMES.length; i++) {
      if (this.THEMES[i].id === id) {

        this.theme = this.THEMES[i];
        log('loaded theme', this.theme.id);
        break;
      }
    }
  };
});