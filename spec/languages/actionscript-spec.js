"use babel"

import Parser from '../../lib/languages/actionscript'

describe('ParserActionScript', () => {

  let parser;

  beforeEach(() => {
    waitsForPromise(() => atom.packages.activatePackage('docblockr'))
    runs(() => {
      parser = new Parser(atom.config.get('docblockr'))
    })
  })

  describe('parse_function()', () => {

    it('should parse anonymous function', () => {
      const out = parser.parse_function('function (a:String)')
      expect(out).toEqual([null, 'a:String', null, {} ])
    })

    it('should parse function', () => {
      const out = parser.parse_function('name : function(a:String)')

      // expect(out).toEqual([ 'name', 'a:String', null, {} ])
      expect(out).toEqual([ null, 'a:String', null, {} ])
    })

    it('should parse function', () => {
      const out = parser.parse_function('function name(a:String)')

      // expect(out).toEqual([ 'name', 'a:String', null, {} ])
      expect(out).toEqual([ null, 'a:String', null, {} ])
    })

    it('should parse function', () => {
      const out = parser.parse_function('name = function(a:String)')

      // expect(out).toEqual([ 'name', 'a:String', null, {} ])
      expect(out).toEqual([ null, 'a:String', null, {} ])
    })
  })

  describe('parse_var()', () => {
    it('should always return null', () => {
      const out = parser.parse_var('foo = "Bar"')
      expect(out).toEqual(null)
    })
  })

  describe('get_arg_name()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('get_arg_type()', () => {
    it('should always return null', () => {
      const out = parser.parse_var('')
      expect(out).toEqual(null)
    })
  })
})
