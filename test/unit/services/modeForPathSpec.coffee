describe 'services.modeForPath', ->

  it 'should return mode based on extension of given path', inject (modeForPath) ->
    mode = modeForPath 'some/path.js'
    expect(mode.id).toBe 'ace/mode/javascript'
    expect(mode.name).toBe 'JavaScript'


  it 'should return text mode by default', inject (modeForPath) ->
    mode = modeForPath 'unknown.path'
    expect(mode.id).toBe 'ace/mode/text'
    expect(mode.name).toBe 'Text'
