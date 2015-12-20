"use babel"

import Parser from '../../lib/parser/java'

describe('ParserJava', () => {

  let parser;

  beforeEach(() => {
    waitsForPromise(() => atom.packages.activatePackage('docblockr'))
    runs(() => {
      parser = new Parser(atom.config.get('docblockr'))
    })
  })

  describe('parse_function()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('parse_var()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('guess_type_from_value()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('format_function()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('get_function_return_type()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('get_definition()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })
})
