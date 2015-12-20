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

  describe('parseFunction()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('parseVar()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('guessTypeFromValue()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('formatFunction()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('getFunctionReturnType()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('getDefinition()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })
})
