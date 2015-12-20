"use babel"

import Parser from '../../lib/parser/rust'

describe('ParserRust', () => {

  let parser;

  beforeEach(() => {
    waitsForPromise(() => atom.packages.activatePackage('docblockr'))
    runs(() => {
      parser = new Parser(atom.config.get('docblockr'))
    })
  })

  describe('parseFunction()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('formatFunction()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })
})
