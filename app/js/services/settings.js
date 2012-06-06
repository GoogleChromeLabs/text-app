var WhiteTheme = function(name, id) {
  this.name = name;
  this.id = id || 'ace/theme/' + name.toLowerCase().replace(/\s/g, '_');
  this.cls = 'ace-theme-white';
};

var BlackTheme = function(name, id) {
  WhiteTheme.call(this, name, id);
  this.cls = 'ace-theme-black';
};


app.service('settings', function(localStorage, log, VimHandler, EmacsHandler) {
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

  this.KEY_MODES = [
    {name: 'ACE', id: 'ace', handler: null},
    {name: 'Vim', id: 'vim', handler: VimHandler},
    {name: 'Emacs', id: 'emacs', handler: EmacsHandler}
  ];


  var data = {};
  var listeners = {};
  var self = this;

  var defineProperty = function(name) {
    self.__defineGetter__(name, function() {
      return data[name];
    });

    self.__defineSetter__(name, function(value) {
      data[name] = value;

      if (!listeners[name]) {
        return;
      }

      listeners[name].forEach(function(fn) {
        fn(value);
      });
    });
  };

  defineProperty('theme');
  defineProperty('keyMode');
  defineProperty('useSoftTabs');
  defineProperty('tabSize');

  this.on = function(name, fn) {
    if (!listeners[name]) {
      listeners[name] = [];
    }

    listeners[name].push(fn);
  };

  this.store = function() {
    // theme
    localStorage.setItem('theme', this.theme.id);
    log('saving theme', this.theme.id);

    // keyMode
    localStorage.setItem('keyMode', this.keyMode.id);
    log('saving keyMode', this.keyMode.id);

    // useSoftTabs
    localStorage.setItem('useSoftTabs', this.useSoftTabs ? '1' : '0');
    log('saving useSoftTabs', this.useSoftTabs);

    // tabSize
    localStorage.setItem('tabSize', String(this.tabSize));
    log('saving tabSize', this.tabSize);
  };

  this.load = function() {
    var id, i;

    // theme
    id = localStorage.getItem('theme') || 'ace/theme/monokai';
    for (i = 0; i < this.THEMES.length; i++) {
      if (this.THEMES[i].id === id) {
        this.theme = this.THEMES[i];
        log('loaded theme', this.theme.id);
        break;
      }
    }

    // keyMode
    id = localStorage.getItem('keyMode') || 'ace';
    for (i = 0; i < this.KEY_MODES.length; i++) {
      if (this.KEY_MODES[i].id === id) {
        this.keyMode = this.KEY_MODES[i];
        log('loaded keyMode', this.keyMode.id);
        break;
      }
    }

    // useSoftTabs
    this.useSoftTabs = !!parseInt(localStorage.getItem('useSoftTabs') || '1', 10);
    log('loaded useSoftTabs', this.useSoftTabs);

    // tabSize
    this.tabSize = parseInt(localStorage.getItem('tabSize') || '4', 10);
    log('loaded tabSize', this.tabSize);
  };
});