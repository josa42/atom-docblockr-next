"use babel"

import Parser from '../../lib/languages/rust'

describe('ParserRust', () => {

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

  describe('format_function()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })
})
