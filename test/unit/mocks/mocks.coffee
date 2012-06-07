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


# mocks.localStorage
m = angular.module 'mocks.localStorage', []
m.factory 'localStorage', ->
  _data: {}
  setItem: (key, data) -> @_data[key] = data
  getItem: (key) -> @_data[key]


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

# all mocks
m = angular.module 'mocks', ['mocks.editor', 'mocks.localStorage', 'mocks.classes']
m.value 'focus', ->

# load the default module before each test
# TODO(vojta): this should be placed somewhere else
beforeEach module 'TD.app'