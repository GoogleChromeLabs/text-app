describe 'services.settings', ->
  settings = storage = editor = null

  beforeEach inject (_settings_, localStorage, _editor_) ->
    settings = _settings_
    storage = localStorage
    editor = _editor_


  it 'should setTheme on editor', ->
    settings.theme = settings.THEMES[0]
    expect(editor.setTheme).toHaveBeenCalledWith 'ace/theme/chrome'


  describe 'load', ->

    it 'should load theme from localStorage', ->
      storage.setItem 'theme', 'ace/theme/monokai'
      settings.load()

      expect(settings.theme).toBeDefined()
      expect(settings.theme.name).toBe 'Monokai'


    it 'should load keyMode from localStorage', ->
      storage.setItem 'keyMode', 'vim'
      settings.load()

      expect(settings.keyMode).toBeDefined()
      expect(settings.keyMode.name).toBe 'Vim'


  describe 'store', ->

    it 'should save theme into localStorage', ->
      settings.theme = settings.THEMES[0]
      settings.store()

      expect(storage.getItem 'theme').toBe 'ace/theme/chrome'


    it 'should save keyMode into localStorage', ->
      settings.keyMode = settings.KEY_MODES[1]
      settings.store()

      expect(storage.getItem 'keyMode').toBe 'vim'
