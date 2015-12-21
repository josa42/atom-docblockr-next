"use babel"

import Parser from '../../lib/parser/coffee'

describe('ParserCoffeeScript', () => {

  let parser

  beforeEach(() => {
    waitsForPromise(() => atom.packages.activatePackage('docblockr-next'))
    runs(() => {
      parser = new Parser(atom.config.get('docblockr-next'))
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
})
