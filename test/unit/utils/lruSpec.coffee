describe 'util.lru', ->
  lru = A = B = C = null

  beforeEach inject (_lru_) ->
    lru = _lru_
    A = {}
    B = {}
    C = {}


  describe 'touch', ->

    it 'should add item if not in the queue yet and move it to head', ->
      lru.touch A
      expect(lru.head()).toBe A

      lru.touch B
      expect(lru.head()).toBe B


    it 'should move given item to head', ->
      lru.touch A
      lru.touch B
      lru.touch A

      expect(lru.head()).toBe A


  describe 'remove', ->

    it 'should remove item from queue', ->
      lru.touch A
      lru.touch B
      lru.touch A
      expect(lru.head()).toBe A

      lru.remove A
      expect(lru.head()).toBe B

      lru.remove B
      expect(lru.head()).toBe null
