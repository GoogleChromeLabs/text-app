var Theme = function(name, id) {
  this.name = name;
  this.id = id || 'ace/theme/' + name.toLowerCase().replace(/\s/g, '_');
  this.cls = this.id.replace(/[_\/]/g, '-');
};

var LightTheme = function() {
  Theme.apply(this, arguments);
  this.cls += ' ace-theme-light';
};

var DarkTheme = function() {
  Theme.apply(this, arguments);
  this.cls += ' ace-theme-dark';
};


TD.value('THEMES', [
  new LightTheme('Chrome'),
  new LightTheme('Clouds'),
  new DarkTheme('Clouds Midnight'),
  new DarkTheme('Cobalt'),
  new LightTheme('Crimson Editor'),
  new LightTheme('Dawn'),
  new LightTheme('Dreamweaver'),
  new LightTheme('Eclipse'),
  new DarkTheme('idleFingers', 'ace/theme/idle_fingers'),
  new DarkTheme('krTheme', 'ace/theme/kr_theme'),
  new DarkTheme('Merbivore'),
  new DarkTheme('Merbivore Soft'),
  new DarkTheme('Mono Industrial'),
  new DarkTheme('Monokai'),
  new DarkTheme('Pastel on dark'),
  new DarkTheme('Solarized Dark'),
  new LightTheme('Solarized Light'),
  new LightTheme('TextMate'),
  new DarkTheme('Twilight'),
  new LightTheme('Tomorrow'),
  new DarkTheme('Tomorrow Night'),
  new DarkTheme('Tomorrow Night Blue'),
  new DarkTheme('Tomorrow Night Bright'),
  new DarkTheme('Tomorrow Night 80s', 'ace/theme/tomorrow_night_eighties'),
  new DarkTheme('Vibrant Ink')
]);
