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

  describe('parseFunction()', () => {
    it('should parse anonymous function', () => {
      const out = parser.parseFunction('function() {}')
      expect(out).toEqual(null) // TODO Check if valid
      // expect(out).toEqual(['function', '', null])
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
    it('should return name and value', () => {
      expect(parser.parseVar('$y = 1')).toEqual(['$y', '1'])
    })

    it('should return not type', () => {
      expect(parser.parseVar('$y')).toEqual(null) // TODO Check if valid
    })
  })

  describe('getArgName()', () => {
    it('should return name', () => {
      expect(parser.parseVar('$y = 1')).toEqual(['$y', '1'])
      expect(parser.parseVar('$y')).toEqual(null) // TODO Check if valid
    })
  })

  describe('parseVar()', () => {

    it('should return var "foo" with value "new Foo()"', () => {
      expect(parser.parseVar('$foo = new Foo();')).toEqual(['$foo', 'new Foo()'])
    })

    it('should return var "foo" with value "[]"', () => {
      expect(parser.parseVar('$foo = array();')).toEqual(['$foo', 'array()'])
    })

    it('should return var "foo" with value "\'foo\'"', () => {
      expect(parser.parseVar('$foo = \'foo\';')).toEqual(['$foo', '\'foo\''])
    })

    it('should return var "foo" with value "123"', () => {
      expect(parser.parseVar('$foo = 123;')).toEqual(['$foo', '123'])
    })
  })

  describe('guessTypeFromValue()', () => {

    it('should return integer', () => {
      expect(parser.guessTypeFromValue('1')).toEqual('integer')
      expect(parser.guessTypeFromValue('-1')).toEqual('integer')
      expect(parser.guessTypeFromValue('+1')).toEqual('integer')
    })

    it('should return Number', () => {
      expect(parser.guessTypeFromValue('1.1')).toEqual('float')
      expect(parser.guessTypeFromValue('-1.1')).toEqual('float')
      expect(parser.guessTypeFromValue('+1.1')).toEqual('float')
    })

    it('should not return number', () => {
      expect(parser.guessTypeFromValue('+1.1b')).toEqual(null)
    })

    it('should return string', () => {
      expect(parser.guessTypeFromValue('"Foo bar"')).toEqual('string')
      expect(parser.guessTypeFromValue('\'Foo bar\'')).toEqual('string')
      expect(parser.guessTypeFromValue('"1"')).toEqual('string')
    })

    it('should return array', () => {
      expect(parser.guessTypeFromValue('array()')).toEqual('array')
      expect(parser.guessTypeFromValue('array( "foo" => "bar" )')).toEqual('array')
      expect(parser.guessTypeFromValue('array( "foo", "bar" )')).toEqual('array')
      // expect(parser.guessTypeFromValue('[]')).toEqual('array')
      // expect(parser.guessTypeFromValue('[1, 2, "foo"]')).toEqual('array')
    })

    it('should return Object', () => {
      // expect(parser.guessTypeFromValue('{ foo: "bar" }')).toEqual('Object')
      // expect(parser.guessTypeFromValue('{ "foo": "bar" }')).toEqual('Object')
      expect(parser.guessTypeFromValue('new Object()')).toEqual('Object')
    })

    it('should return FooClass', () => {
      expect(parser.guessTypeFromValue('new FooClass()')).toEqual('FooClass')
    })

    it('should return boolean', () => {
      expect(parser.guessTypeFromValue('true')).toEqual('boolean')
      expect(parser.guessTypeFromValue('True')).toEqual('boolean')
      expect(parser.guessTypeFromValue('TRUE')).toEqual('boolean')
      expect(parser.guessTypeFromValue('false')).toEqual('boolean')
      expect(parser.guessTypeFromValue('False')).toEqual('boolean')
      expect(parser.guessTypeFromValue('FALSE')).toEqual('boolean')
    })
  })

  describe('getFunctionReturnType()', () => {
    it('should return null for __construct', () => {
      expect(parser.getFunctionReturnType('__construct', null)).toEqual(null)
    })

    it('should return null for __destruct', () => {
      expect(parser.getFunctionReturnType('__destruct', null)).toEqual(null)
    })

    it('should return null for __set', () => {
      expect(parser.getFunctionReturnType('__set', null)).toEqual(null)
    })

    it('should return null for __unset', () => {
      expect(parser.getFunctionReturnType('__unset', null)).toEqual(null)
    })

    it('should return null for __wakeup', () => {
      expect(parser.getFunctionReturnType('__wakeup', null)).toEqual(null)
    })
  })
})
