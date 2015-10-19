"use babel"

import Parser from '../../lib/languages/objc'

describe('ParserObjC', () => {

  let parser;

  beforeEach(() => {
    waitsForPromise(() => atom.packages.activatePackage('docblockr'))
    runs(() => {
      parser = new Parser(atom.config.get('docblockr'))
    })
  })

  describe('get_definition()', () => {
    it('should be implemented', () => expect(false).toBe(true))
  })

  describe('parse_function()', () => {
    it('should be implemented', () => expect(false).toBe(true))
  })

  describe('parse_args()', () => {
    it('should be implemented', () => expect(false).toBe(true))
  })

  describe('get_function_return_type()', () => {
    it('should be implemented', () => expect(false).toBe(true))
  })

  describe('parse_var()', () => {
    it('should be implemented', () => expect(false).toBe(true))
  })
})
