# mocks.classes
mocks.classes.value 'EditSession', (content) ->
  @content = content or ''

  lines = @content.split '\n'
  @getLength = -> lines.length
  @getLine = (row) ->
    lines[row]

  @setUseSoftTabs = jasmine.createSpy 'setUseSoftTabs'
  @setTabSize = jasmine.createSpy 'setTabSize'
  @setUseWrapMode = jasmine.createSpy 'setUseWrapMode'
  @setWrapLimitRange = jasmine.createSpy 'setWrapLimitRange'
  @setFoldStyle = jasmine.createSpy 'setFoldStyle'
  @unfold = jasmine.createSpy 'unfold'
  @$setFolding = jasmine.createSpy '$setFolding'
  @foldAll = jasmine.createSpy 'foldAll'

  @reset = ->
    @setUseSoftTabs.reset()
    @setTabSize.reset()
    @setUseWrapMode.reset()
    @setWrapLimitRange.reset()
    @setFoldStyle.reset()
    @unfold.reset()
    @$setFolding.reset()
    @foldAll.reset()
  @

mocks.classes.value 'VimHandler', ->
mocks.classes.value 'EmacsHandler', ->

mocks.classes.factory 'AceRange', ->
  AceRange = (start, end) ->
    @start = start
    @end = end
    @

  AceRange.fromPoints = (start, end) ->
    new AceRange start, end

  AceRange
