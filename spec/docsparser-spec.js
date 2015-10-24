"use babel"

import DocsParser from '../lib/docsparser';

class BasicParse extends DocsParser {
  setup_settings() {
    this.settings = { typeTag: 'type' };
  }
}

describe('DocsParser()', () => {

  let parser;

  beforeEach(() => {
    waitsForPromise(() => atom.packages.activatePackage('docblockr'))
    runs(() => {
      parser = new BasicParse()
    })
  })

  describe('is_existing_comment()', () => {
    it('should comment line', () => {
      expect(parser.is_existing_comment(' * test')).toBe(true)
      expect(parser.is_existing_comment('test')).toBe(false)
    });
  });

  describe('is_numeric()', () => {
    it('should identify numbers', () => {
      expect(parser.is_numeric(NaN)).toBe(false)
      expect(parser.is_numeric("test")).toBe(false)
      expect(parser.is_numeric("1")).toBe(true)
      expect(parser.is_numeric("-1")).toBe(true)
      expect(parser.is_numeric("+1")).toBe(true)
      expect(parser.is_numeric(1)).toBe(true)
      expect(parser.is_numeric(1.1)).toBe(true)
    })
  });

  describe('parse()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('format_var()', () => {
    // it('should', () => {
    //   expect(parser.format_var('foo', 'bar', 'string')).toBe(['${1:[foo description]}', '@type ${1:string}'])
    // })
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('get_type_info()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('format_function()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('get_function_return_type()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('parse_args()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('get_arg_type()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('get_arg_name()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('add_extra_tags()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('guess_type_from_name()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('get_matching_notations()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('get_definition()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

})
