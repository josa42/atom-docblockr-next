"use babel"

import Parser from '../../lib/parser/actionscript'

describe('ParserActionScript', () => {

  let parser;

  beforeEach(() => {
    waitsForPromise(() => atom.packages.activatePackage('docblockr'))
    runs(() => {
      parser = new Parser(atom.config.get('docblockr'))
    })
  })

  describe('parseFunction()', () => {

    it('should parse anonymous function', () => {
      const out = parser.parseFunction('function (a:String)')
      expect(out).toEqual([null, 'a:String', null, {} ])
    })

    it('should parse function', () => {
      const out = parser.parseFunction('name : function(a:String)')

      // expect(out).toEqual([ 'name', 'a:String', null, {} ])
      expect(out).toEqual([ null, 'a:String', null, {} ])
    })

    it('should parse function', () => {
      const out = parser.parseFunction('function name(a:String)')

      // expect(out).toEqual([ 'name', 'a:String', null, {} ])
      expect(out).toEqual([ null, 'a:String', null, {} ])
    })

    it('should parse function', () => {
      const out = parser.parseFunction('name = function(a:String)')

      // expect(out).toEqual([ 'name', 'a:String', null, {} ])
      expect(out).toEqual([ null, 'a:String', null, {} ])
    })
  })

  describe('parseVar()', () => {
    it('should always return null', () => {
      const out = parser.parseVar('foo = "Bar"')
      expect(out).toEqual(null)
    })
  })

  describe('getArgName()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('getArgType()', () => {
    it('should always return null', () => {
      const out = parser.parseVar('')
      expect(out).toEqual(null)
    })
  })
})
