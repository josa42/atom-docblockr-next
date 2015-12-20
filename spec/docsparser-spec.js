"use babel"

import DocsParser from '../lib/docsparser';

class BasicParse extends DocsParser {
  setupSettings() {
    this.settings = { typeTag: 'type' };
  }
}

describe('DocsParser()', () => {

  let parser;

  beforeEach(() => {
    waitsForPromise(() => atom.packages.activatePackage('docblockr-next'))
    runs(() => {
      parser = new BasicParse()
    })
  })

  describe('isExistingComment()', () => {
    it('should comment line', () => {
      expect(parser.isExistingComment(' * test')).toBe(true)
      expect(parser.isExistingComment('test')).toBe(false)
    });
  });

  describe('parse()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('formatVar()', () => {
    // it('should', () => {
    //   expect(parser.formatVar('foo', 'bar', 'string')).toBe(['${1:[foo description]}', '@type ${1:string}'])
    // })
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('getTypeInfo()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('formatFunction()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('getFunctionReturnType()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('parseArgs()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('getArgType()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('getArgName()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('addExtraTags()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('guessTypeFromName()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('getMatchingNotations()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('getDefinition()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

})
