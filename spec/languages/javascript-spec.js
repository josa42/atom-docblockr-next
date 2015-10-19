"use babel"

import Parser from '../../lib/languages/javascript'

describe('ParserJavascript', () => {

  let parser;

  beforeEach(() => {
    waitsForPromise(() => atom.packages.activatePackage('docblockr'))
    runs(() => {
      parser = new Parser(atom.config.get('docblockr'))
    })
  })

  describe('parse_function()', () => {
    it('should parse anonymous function', () => {
      const out = parser.parse_function('function() {}')
      expect(out).toEqual(['function', '', null])
    })

    it('should parse named function', () => {
      const out = parser.parse_function('function foo() {}')
      expect(out).toEqual(['foo', '', null])
    })

    it('should parse function params', () => {
      const out = parser.parse_function('function foo(foo, bar) {}')
      expect(out).toEqual(['foo', 'foo, bar', null])
    })

    it('should parse function params width default', () => {
      const out = parser.parse_function('function foo(foo = "test", bar = \'test\') {}')
      expect(out).toEqual(['foo', 'foo = "test", bar = \'test\'', null])
    })
  })

  describe('parse_var()', () => {

    it('should return var "foo" with value "{}"', () => {
      const out = parser.parse_var('var foo = {}')
      expect(out).toEqual(['foo', '{}'])
    })

    it('should return var "foo" with value "[]"', () => {
      const out = parser.parse_var('var foo = []')
      expect(out).toEqual(['foo', '[]'])
    })

    it('should return var "foo" with value "\'foo\'"', () => {
      const out = parser.parse_var('var foo = \'foo\'')
      expect(out).toEqual(['foo', '\'foo\''])
    })

    it('should return var "foo" with value "123"', () => {
      const out = parser.parse_var('var foo = 123')
      expect(out).toEqual(['foo', '123'])
    })
  })

  describe('guess_type_from_value()', () => {

    it('should return Number', () => {
      expect(parser.guess_type_from_value('1')).toEqual('Number')
      expect(parser.guess_type_from_value('1.1')).toEqual('Number')
      expect(parser.guess_type_from_value('-1')).toEqual('Number')
      expect(parser.guess_type_from_value('-1.1')).toEqual('Number')
      expect(parser.guess_type_from_value('+1')).toEqual('Number')
      expect(parser.guess_type_from_value('+1.1')).toEqual('Number')
    })

    it('should not return Number', () => {
      expect(parser.guess_type_from_value('+1.1b')).toEqual(null)
    })

    it('should not return String', () => {
      expect(parser.guess_type_from_value('"Foo bar"')).toEqual('String')
      expect(parser.guess_type_from_value('\'Foo bar\'')).toEqual('String')
      expect(parser.guess_type_from_value('"1"')).toEqual('String')
    })

    it('should not return Array', () => {
      expect(parser.guess_type_from_value('[]')).toEqual('Array')
      expect(parser.guess_type_from_value('[1, 2, "foo"]')).toEqual('Array')
      expect(parser.guess_type_from_value('new Array()')).toEqual('Array')
    })

    it('should not return Object', () => {
      expect(parser.guess_type_from_value('{ foo: "bar" }')).toEqual('Object')
      expect(parser.guess_type_from_value('{ "foo": "bar" }')).toEqual('Object')
      expect(parser.guess_type_from_value('new Object()')).toEqual('Object')
      expect(parser.guess_type_from_value('Object.create()')).toEqual('Object')
    })

    it('should not return FooClass', () => {
      expect(parser.guess_type_from_value('new FooClass()')).toEqual('FooClass')
      expect(parser.guess_type_from_value('FooClass.create({ no: 1})')).toEqual('FooClass')
    })

    it('should not return Boolean', () => {
      expect(parser.guess_type_from_value('true')).toEqual('Boolean')
      expect(parser.guess_type_from_value('false')).toEqual('Boolean')
    })

    it('should not return RegExp', () => {
      expect(parser.guess_type_from_value('/.*/')).toEqual('RegExp')
      expect(parser.guess_type_from_value('new RegExp(\'.*\')')).toEqual('RegExp')
    })
  })
})
