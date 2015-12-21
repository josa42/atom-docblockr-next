"use babel"

import Parser from '../../lib/parser/javascript'

describe('ParserJavascript', () => {

  let parser

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

  describe('guessTypeFromValue()', () => {

    it('should return Number', () => {
      expect(parser.guessTypeFromValue('1')).toEqual('Number')
      expect(parser.guessTypeFromValue('1.1')).toEqual('Number')
      expect(parser.guessTypeFromValue('-1')).toEqual('Number')
      expect(parser.guessTypeFromValue('-1.1')).toEqual('Number')
      expect(parser.guessTypeFromValue('+1')).toEqual('Number')
      expect(parser.guessTypeFromValue('+1.1')).toEqual('Number')
    })

    it('should not return Number', () => {
      expect(parser.guessTypeFromValue('+1.1b')).toEqual(null)
    })

    it('should not return String', () => {
      expect(parser.guessTypeFromValue('"Foo bar"')).toEqual('String')
      expect(parser.guessTypeFromValue('\'Foo bar\'')).toEqual('String')
      expect(parser.guessTypeFromValue('"1"')).toEqual('String')
    })

    it('should not return Array', () => {
      expect(parser.guessTypeFromValue('[]')).toEqual('Array')
      expect(parser.guessTypeFromValue('[1, 2, "foo"]')).toEqual('Array')
      expect(parser.guessTypeFromValue('new Array()')).toEqual('Array')
    })

    it('should not return Object', () => {
      expect(parser.guessTypeFromValue('{ foo: "bar" }')).toEqual('Object')
      expect(parser.guessTypeFromValue('{ "foo": "bar" }')).toEqual('Object')
      expect(parser.guessTypeFromValue('new Object()')).toEqual('Object')
      expect(parser.guessTypeFromValue('Object.create()')).toEqual('Object')
    })

    it('should not return FooClass', () => {
      expect(parser.guessTypeFromValue('new FooClass()')).toEqual('FooClass')
      expect(parser.guessTypeFromValue('FooClass.create({ no: 1})')).toEqual('FooClass')
    })

    it('should not return Boolean', () => {
      expect(parser.guessTypeFromValue('true')).toEqual('Boolean')
      expect(parser.guessTypeFromValue('false')).toEqual('Boolean')
    })

    it('should not return RegExp', () => {
      expect(parser.guessTypeFromValue('/.*/')).toEqual('RegExp')
      expect(parser.guessTypeFromValue('new RegExp(\'.*\')')).toEqual('RegExp')
    })
  })
})
