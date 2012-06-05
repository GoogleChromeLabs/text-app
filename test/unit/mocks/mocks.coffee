mocks = angular.module 'mocks', []

mocks.factory 'editor', ->
  focus: jasmine.createSpy 'focus'
  setSession: jasmine.createSpy 'focus'
  clearSession: jasmine.createSpy 'focus'
  setTheme: jasmine.createSpy 'setTheme'
  setKeyboardHandler: jasmine.createSpy 'setKeyboardHandler'

mocks.value 'EditSession', (content) -> @content = content
mocks.value 'VimHandler', ->
mocks.value 'EmacsHandler', ->

mocks.value 'localStorage', {
  _data: {},
  setItem: (key, data) -> @_data[key] = data
  getItem: (key) -> @_data[key]
}

beforeEach module 'TD', 'mocks'