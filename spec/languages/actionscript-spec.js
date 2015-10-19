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
    it('should be implemented', () => expect(false).toBe(true))
  })

  describe('parse_var()', () => {
    it('should be implemented', () => expect(false).toBe(true))
  })

  describe('get_arg_name()', () => {
    it('should be implemented', () => expect(false).toBe(true))
  })

  describe('get_arg_type()', () => {
    it('should be implemented', () => expect(false).toBe(true))
  })
})
