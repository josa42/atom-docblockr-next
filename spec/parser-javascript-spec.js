"use babel"

import Parser from '../lib/parser/javascript'

describe('ParserJavascript', () => {

  let parser;

  beforeEach(() => {
    waitsForPromise(() => atom.packages.activatePackage('docblockr-next'))
    runs(() => {
      parser = new Parser(atom.config.get('docblockr-next'))
    })
  })

  describe('parseFunction()', () => {
    it('should parse anonymous function', () => {
      const out = parser.parseFunction('function() {}')
      expect(out).toEqual(['function', '', null])
    })

    it('should parse named function', () => {
      const out = parser.parseFunction('function foo() {}')
      expect(out).toEqual(['foo', '', null])
    })

    it('should parse function params', () => {
      const out = parser.parseFunction('function foo(foo, bar) {}')
      expect(out).toEqual(['foo', 'foo, bar', null])
    })

    it('should parse function params width default', () => {
      const out = parser.parseFunction('function foo(foo = "test", bar = \'test\') {}')
      expect(out).toEqual(['foo', 'foo = "test", bar = \'test\'', null])
    })
  })

  describe('getArgType()', () => {
    it('should return no type', () => {
      const out = parser.getArgType('foo')
      expect(out).toEqual(null)
    })

    it('should return "Object" for "{}"', () => {
      const out = parser.getArgType('foo = {}')
      expect(out).toEqual('Object')
    })

    it('should return "Foo" for "new Foo()"', () => {
      const out = parser.getArgType('foo = new Foo()')
      expect(out).toEqual('Foo')
    })

    it('should return "Array" for "[]"', () => {
      const out = parser.getArgType('foo = []')
      expect(out).toEqual('Array')
    })

    it('should return "Array" for "[1, 2, 3]"', () => {
      const out = parser.getArgType('foo = [1, 2, 3]')
      expect(out).toEqual('Array')
    })

    it('should return "String" for "\'foo\'"', () => {
      const out = parser.getArgType('foo = \'foo\'')
      expect(out).toEqual('String')
    })

    it('should return "String" for "\'new Foo()\'"', () => {
      const out = parser.getArgType('foo = \'new Foo()\'')
      expect(out).toEqual('String')
    })

    it('should return "String" for "\'123\'"', () => {
      const out = parser.getArgType('foo = \'123\'')
      expect(out).toEqual('String')
    })

    it('should return "String" for "\'[]\'"', () => {
      const out = parser.getArgType('foo = \'[]\'')
      expect(out).toEqual('String')
    })

    it('should return "Number" for "123"', () => {
      const out = parser.getArgType('foo = 123')
      expect(out).toEqual('Number')
    })

    it('should return "Number" for "1.23"', () => {
      const out = parser.getArgType('foo = 1.23')
      expect(out).toEqual('Number')
    })
  })

  describe('getArgName()', () => {
    it('should return argument "foo"', () => {
      const out = parser.getArgName('foo')
      expect(out).toEqual('foo')
    })

    it('should return optional argument "foo" with default value "{}"', () => {
      const out = parser.getArgName('foo = {}')
      expect(out).toEqual('[foo={}]')
    })

    it('should return optional argument "foo" with default value "[]"', () => {
      const out = parser.getArgName('foo = []')
      expect(out).toEqual('[foo=[]]')
    })

    it('should return optional argument "foo" with default value "[1, 2, 3]"', () => {
      const out = parser.getArgName('foo = [1, 2, 3]')
      expect(out).toEqual('[foo=[1, 2, 3]]')
    })

    it('should return optional argument "foo" with default value "\'foo\'"', () => {
      const out = parser.getArgName('foo = \'foo\'')
      expect(out).toEqual('[foo=\'foo\']')
    })

    it('should return optional argument "foo" with default value "123"', () => {
      const out = parser.getArgName('foo = 123')
      expect(out).toEqual('[foo=123]')
    })
  })

  describe('parseVar()', () => {

    it('should return var "foo" with value "{}"', () => {
      const out = parser.parseVar('var foo = {}')
      expect(out).toEqual(['foo', '{}'])
    })

    it('should return var "foo" with value "[]"', () => {
      const out = parser.parseVar('var foo = []')
      expect(out).toEqual(['foo', '[]'])
    })

    it('should return var "foo" with value "\'foo\'"', () => {
      const out = parser.parseVar('var foo = \'foo\'')
      expect(out).toEqual(['foo', '\'foo\''])
    })

    it('should return var "foo" with value "123"', () => {
      const out = parser.parseVar('var foo = 123')
      expect(out).toEqual(['foo', '123'])
    })
  })
})
