"use babel"

import Parser from '../../lib/parser/rust'

describe('ParserRust', () => {

  let parser;

  beforeEach(() => {
    waitsForPromise(() => atom.packages.activatePackage('docblockr-next'))
    runs(() => {
      parser = new Parser(atom.config.get('docblockr-next'))
    })
  })

  describe('parseFunction()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('formatFunction()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })
})
