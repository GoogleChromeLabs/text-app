describe 'services.settings', ->
  settings = storage = null

  # use all mocks
  beforeEach module 'mocks'

  beforeEach inject (_settings_, chromeStorage) ->
    settings = _settings_
    storage = chromeStorage

  describe 'on', ->

    it 'should call listeners when a property change', ->
      themeSpy = jasmine.createSpy 'theme'
      keyModeSpy = jasmine.createSpy 'keyMode'
      softTabsSpy = jasmine.createSpy 'softTabs'
      softWrapSpy = jasmine.createSpy 'softWrap'

      settings.on 'theme', themeSpy
      settings.on 'keyMode', keyModeSpy
      settings.on 'softTabs', softTabsSpy
      settings.on 'softWrap', softWrapSpy

      value = {}
      settings.theme = value
      expect(themeSpy).toHaveBeenCalledWith value

      settings.keyMode = value
      expect(keyModeSpy).toHaveBeenCalledWith value

      settings.softTabs = value
      expect(softTabsSpy).toHaveBeenCalledWith value

      settings.softWrap = value
      expect(softWrapSpy).toHaveBeenCalledWith value


  describe 'load', ->

    it 'should load theme from storage', ->
      storage._data.settings = theme: 'ace/theme/monokai'
      settings.load()

      storage._flush()
      expect(settings.theme).toBeDefined()
      expect(settings.theme.name).toBe 'Monokai'


    it 'should load keyMode from storage', ->
      storage._data.settings = keyMode: 'vim'
      settings.load()

      storage._flush()
      expect(settings.keyMode).toBeDefined()
      expect(settings.keyMode.name).toBe 'Vim'


    it 'should load useSoftTabs from storage', ->
      storage._data.settings = softTabs: -1
      settings.load()

      storage._flush()
      expect(settings.softTabs).toBe -1

      storage._data.settings = softTabs: 4
      settings.load()

      storage._flush()
      expect(settings.softTabs).toBe 4


    it 'should load softWrap', ->
      storage._data.settings = softWrap: 0
      settings.load()

      storage._flush()
      expect(settings.softWrap).toBe 0

      storage._data.settings = softWrap: -1
      settings.load()

      storage._flush()
      expect(settings.softWrap).toBe -1


    it 'should load maxOpenTabs', ->
      storage._data.settings = maxOpenTabs: 5
      settings.load()

      storage._flush()
      expect(settings.maxOpenTabs).toBe 5


    it 'should set defaults', ->
      settings.load()
      storage._flush()

      expect(settings.softTabs).toBe 2
      expect(settings.keyMode.id).toBe 'ace'
      expect(settings.theme.id).toBe 'ace/theme/monokai'
      expect(settings.softWrap).toBe 0
      expect(settings.maxOpenTabs).toBe 10


    it 'should $digest', inject ($rootScope) ->
      tabSize = null
      $rootScope.$watch -> tabSize = settings.tabSize

      storage._data.settings = tabSize: 15
      settings.load()
      storage._flush()

      expect(tabSize).toBe 15


  describe 'store', ->

    it 'should save theme to storage', ->
      settings.theme = settings.THEMES[0]
      settings.store()

      expect(storage._data.settings.theme).toBe 'ace/theme/chrome'


    it 'should save keyMode to storage', ->
      settings.keyMode = settings.KEY_MODES[1]
      settings.store()

      expect(storage._data.settings.keyMode).toBe 'vim'


    it 'should save softTabs to storage', ->
      settings.softTabs = 4
      settings.store()

      expect(storage._data.settings.softTabs).toBe 4


    it 'should save softWrap to storage', ->
      settings.softWrap = -1
      settings.store()

      expect(storage._data.settings.softWrap).toBe -1

      settings.softWrap = 0
      settings.store()

      expect(storage._data.settings.softWrap).toBe 0
