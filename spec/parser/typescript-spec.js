"use babel"

import Parser from '../../lib/parser/typescript'

describe('ParserTypeScript', () => {

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

  describe('getArgType()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('getArgName()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('parseVar()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('getFunctionReturnType()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('guessTypeFromValue()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

})
