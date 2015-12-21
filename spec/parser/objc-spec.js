"use babel"

import Parser from '../../lib/parser/objc'

describe('ParserObjC', () => {

  let parser

  beforeEach(() => {
    waitsForPromise(() => atom.packages.activatePackage('docblockr-next'))
    runs(() => {
      parser = new Parser(atom.config.get('docblockr-next'))
    })
  })

  describe('getDefinition()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('parseFunction()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('parseArgs()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('getFunctionReturnType()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('parseVar()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })
})
