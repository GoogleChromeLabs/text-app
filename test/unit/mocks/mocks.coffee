# mocks.editor
m = angular.module 'mocks.editor', []
m.factory 'editor', ->
  focus: jasmine.createSpy 'focus'
  setSession: jasmine.createSpy 'focus'
  clearSession: jasmine.createSpy 'focus'
  setTheme: jasmine.createSpy 'setTheme'
  setKeyboardHandler: jasmine.createSpy 'setKeyboardHandler'


# mocks.ace
m = angular.module 'mocks.ace', []
m.factory 'ace', ->
  ace = jasmine.createSpyObj 'ace', ['setTheme', 'setKeyboardHandler', 'setShowPrintMargin', 'focus']
  ace.setSession = (session) -> @_session = session
  ace.getSession = -> @_session
  ace


# mocks.storage
m = angular.module 'mocks.storage', []

# mock version of chrome.storage.local
# http://code.google.com/chrome/extensions/trunk/storage.html
m.factory 'chromeStorage', ->
  _data: {}
  _queue: []

  set: (data, fn) ->
    angular.extend(@_data, data)
    @_queue.push fn

  get: (keys, fn) ->
    # TODO(vojta): accept null and string as keys
    result = {}
    data = @_data
    keys.forEach (key) ->
      result[key] = data[key]

    @_queue.push ->
      fn result

  _flush: ->
    while @_queue.length
      @_queue.shift()()
    undefined


# mocks.classes
m = angular.module 'mocks.classes', []
m.value 'EditSession', (content) ->
  @content = content
  @setUseSoftTabs = jasmine.createSpy 'setUseSoftTabs'
  @setTabSize = jasmine.createSpy 'setTabSize'
  @setUseWrapMode = jasmine.createSpy 'setUseWrapMode'
  @setWrapLimitRange = jasmine.createSpy 'setWrapLimitRange'
  @setFoldStyle = jasmine.createSpy 'setFoldStyle'
  @reset = ->
    @setUseSoftTabs.reset()
    @setTabSize.reset()
    @setUseWrapMode.reset()
    @setWrapLimitRange.reset()
    @setFoldStyle.reset()
  @

m.value 'VimHandler', ->
m.value 'EmacsHandler', ->


# mocks.log
m = angular.module 'mocks.log', []
m.value 'log', ->


# all mocks
m = angular.module 'mocks', ['mocks.editor', 'mocks.storage', 'mocks.classes']
m.value 'focus', ->

# load the default module before each test
# TODO(vojta): this should be placed somewhere else
beforeEach module 'TD.app', 'mocks.log'
