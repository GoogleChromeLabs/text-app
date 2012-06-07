# mocks.classes
mocks.classes.value 'EditSession', (content) ->
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

mocks.classes.value 'VimHandler', ->
mocks.classes.value 'EmacsHandler', ->