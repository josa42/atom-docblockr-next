"use babel"

import Parser from '../../lib/parser/php'

describe('ParserPhp', () => {

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
      expect(out).toEqual(null) // TODO Check if valid
      // expect(out).toEqual(['function', '', null])
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

  describe('get_arg_type()', () => {
    it('should return name and value', () => {
      expect(parser.parse_var('$y = 1')).toEqual(['$y', '1'])
    })

    it('should return not type', () => {
      expect(parser.parse_var('$y')).toEqual(null) // TODO Check if valid
    })
  })

  describe('get_arg_name()', () => {
    it('should return name', () => {
      expect(parser.parse_var('$y = 1')).toEqual(['$y', '1'])
      expect(parser.parse_var('$y')).toEqual(null) // TODO Check if valid
    })
  })

  describe('parse_var()', () => {

    it('should return var "foo" with value "new Foo()"', () => {
      expect(parser.parse_var('$foo = new Foo();')).toEqual(['$foo', 'new Foo()'])
    })

    it('should return var "foo" with value "[]"', () => {
      expect(parser.parse_var('$foo = array();')).toEqual(['$foo', 'array()'])
    })

    it('should return var "foo" with value "\'foo\'"', () => {
      expect(parser.parse_var('$foo = \'foo\';')).toEqual(['$foo', '\'foo\''])
    })

    it('should return var "foo" with value "123"', () => {
      expect(parser.parse_var('$foo = 123;')).toEqual(['$foo', '123'])
    })
  })

  describe('guess_type_from_value()', () => {

    it('should return integer', () => {
      expect(parser.guess_type_from_value('1')).toEqual('integer')
      expect(parser.guess_type_from_value('-1')).toEqual('integer')
      expect(parser.guess_type_from_value('+1')).toEqual('integer')
    })

    it('should return Number', () => {
      expect(parser.guess_type_from_value('1.1')).toEqual('float')
      expect(parser.guess_type_from_value('-1.1')).toEqual('float')
      expect(parser.guess_type_from_value('+1.1')).toEqual('float')
    })

    it('should not return number', () => {
      expect(parser.guess_type_from_value('+1.1b')).toEqual(null)
    })

    it('should return string', () => {
      expect(parser.guess_type_from_value('"Foo bar"')).toEqual('string')
      expect(parser.guess_type_from_value('\'Foo bar\'')).toEqual('string')
      expect(parser.guess_type_from_value('"1"')).toEqual('string')
    })

    it('should return array', () => {
      expect(parser.guess_type_from_value('array()')).toEqual('array')
      expect(parser.guess_type_from_value('array( "foo" => "bar" )')).toEqual('array')
      expect(parser.guess_type_from_value('array( "foo", "bar" )')).toEqual('array')
      // expect(parser.guess_type_from_value('[]')).toEqual('array')
      // expect(parser.guess_type_from_value('[1, 2, "foo"]')).toEqual('array')
    })

    it('should return Object', () => {
      // expect(parser.guess_type_from_value('{ foo: "bar" }')).toEqual('Object')
      // expect(parser.guess_type_from_value('{ "foo": "bar" }')).toEqual('Object')
      expect(parser.guess_type_from_value('new Object()')).toEqual('Object')
    })

    it('should return FooClass', () => {
      expect(parser.guess_type_from_value('new FooClass()')).toEqual('FooClass')
    })

    it('should return boolean', () => {
      expect(parser.guess_type_from_value('true')).toEqual('boolean')
      expect(parser.guess_type_from_value('True')).toEqual('boolean')
      expect(parser.guess_type_from_value('TRUE')).toEqual('boolean')
      expect(parser.guess_type_from_value('false')).toEqual('boolean')
      expect(parser.guess_type_from_value('False')).toEqual('boolean')
      expect(parser.guess_type_from_value('FALSE')).toEqual('boolean')
    })
  })

  describe('get_function_return_type()', () => {
    it('should return null for __construct', () => {
      expect(parser.get_function_return_type('__construct', null)).toEqual(null)
    })

    it('should return null for __destruct', () => {
      expect(parser.get_function_return_type('__destruct', null)).toEqual(null)
    })

    it('should return null for __set', () => {
      expect(parser.get_function_return_type('__set', null)).toEqual(null)
    })

    it('should return null for __unset', () => {
      expect(parser.get_function_return_type('__unset', null)).toEqual(null)
    })

    it('should return null for __wakeup', () => {
      expect(parser.get_function_return_type('__wakeup', null)).toEqual(null)
    })
  })
})
