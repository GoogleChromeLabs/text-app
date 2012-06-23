describe 'services tabs', ->
  tabs = tabDeselectedSpy = null

  beforeEach module 'mocks'

  beforeEach inject (_tabs_, $rootScope) ->
    tabDeselectedSpy = jasmine.createSpy 'tabDeselected'
    $rootScope.$on 'tab_deselected', tabDeselectedSpy
    tabs = _tabs_


  describe 'add', ->

    it 'should append new tab', ->
      tabs.add null, 'content1'
      tabs.add null, 'content2'

      expect(tabs.length).toBe 2


    it 'should select the tab', ->
      tabs.add null, 'a'
      expect(tabs.current.session.content).toBe 'a'

      tabs.add null, 'b'
      expect(tabs.current.session.content).toBe 'b'


    it 'should append it after current tab', ->
      tabs.add null, 'a'
      tabs.add null, 'c'
      tabs.select tabs[0] # select a
      tabs.add null, 'b'

      expect(tabs.length).toBe 3
      expect(tabs[0].session.content).toBe 'a'
      expect(tabs[1].session.content).toBe 'b'
      expect(tabs[2].session.content).toBe 'c'



  describe 'select', ->

    it 'should make given tab current', inject (Tab) ->
      tab = new Tab
      tabs.select tab
      expect(tabs.current).toBe tab
      expect(tabDeselectedSpy).not.toHaveBeenCalled()

      tab = new Tab
      tabs.select tab
      expect(tabs.current).toBe tab
      expect(tabDeselectedSpy).toHaveBeenCalled()


    it 'should set session and focus editor', inject (editor, Tab) ->
      tab = new Tab
      tabs.select tab
      expect(editor.setSession).toHaveBeenCalledWith tab.session
      expect(editor.focus).toHaveBeenCalled()


    it 'should clear session if null given', inject (editor) ->
      tabs.add()
      tabs.select null

      expect(tabs.current).toBe null
      expect(editor.clearSession).toHaveBeenCalled()


  describe 'selectByFile', ->

    it 'should return true if tab with given file found', inject (Tab) ->
      tabs.add fullPath: 'path/a'
      tabs.add()

      expect(tabs.selectByFile fullPath: 'path/a').toBe true
      expect(tabs.current.file.fullPath).toBe 'path/a'


    it 'should return false if no tab with given file', ->
      tabs.add fullPath: 'something'
      tabs.add()

      expect(tabs.selectByFile fullPath: 'different').toBe false


  describe 'close', ->

    it 'should close current tab and select previously used one', ->
      tabs.add null, 'a'
      tabs.add null, 'b'
      tabs.add null, 'c'
      tabs.select tabs[0] # select a
      tabs.select tabs[2] # select c
      tabs.close()

      expect(tabs.current.session.content).toBe 'a'


    it 'should broadcast "tab_deselected"', ->
      tabs.add null, 'a'
      tabs.close()

      expect(tabDeselectedSpy).toHaveBeenCalled()


    it 'should close given tab', ->
      tabs.add null, 'a'
      tabs.add null, 'b'
      tabs.add null, 'c'
      tabs.close tabs[1]

      expect(tabs[0].session.content).toBe 'a'
      expect(tabs[1].session.content).toBe 'c'
