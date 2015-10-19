"use babel"

import DocblockrWorker from '../lib/docblockr-worker'

describe('DocblockrWorker()', () => {

  let docblockrWorker;

  beforeEach(() => {
    waitsForPromise(() => atom.packages.activatePackage('docblockr'))
    runs(() => {
      docblockrWorker = new DocblockrWorker()
    })
  })

  describe('update_config()', () => {
    it('should be implemented', () => expect(false).toBe(true))
  });

  describe('validate_request()', () => {
    it('should be implemented', () => expect(false).toBe(true))
  });

  describe('parse_command()', () => {
    it('should be implemented', () => expect(false).toBe(true))
  });

  describe('trim_auto_whitespace_command()', () => {
    it('should be implemented', () => expect(false).toBe(true))
  });

  describe('indent_command()', () => {
    it('should be implemented', () => expect(false).toBe(true))
  });

  describe('join_command()', () => {
    it('should be implemented', () => expect(false).toBe(true))
  });

  describe('decorate_command()', () => {
    it('should be implemented', () => expect(false).toBe(true))
  });

  describe('decorate_multiline_command()', () => {
    it('should be implemented', () => expect(false).toBe(true))
  });

  describe('deindent_command()', () => {
    it('should be implemented', () => expect(false).toBe(true))
  });

  describe('reparse_command()', () => {
    it('should be implemented', () => expect(false).toBe(true))
  });

  describe('wrap_lines_command()', () => {
    it('should be implemented', () => expect(false).toBe(true))
  });

  describe('get_indent_spaces()', () => {
    it('should be implemented', () => expect(false).toBe(true))
  });

  describe('initialize()', () => {
    it('should be implemented', () => expect(false).toBe(true))
  });

  describe('counter()', () => {
    it('should be implemented', () => expect(false).toBe(true))
  });

  describe('repeat()', () => {
    it('should be implemented', () => expect(false).toBe(true))
  });

  describe('write()', () => {
    it('should be implemented', () => expect(false).toBe(true))
  });

  describe('erase()', () => {
    it('should be implemented', () => expect(false).toBe(true))
  });

  describe('fill_array()', () => {
    it('should be implemented', () => expect(false).toBe(true))
  });

  describe('read_line()', () => {
    it('should be implemented', () => expect(false).toBe(true))
  });

  describe('scope_range()', () => {
    it('should be implemented', () => expect(false).toBe(true))
  });

  describe('get_parser()', () => {
    it('should be implemented', () => expect(false).toBe(true))
  });

  describe('generate_snippet()', () => {
    it('should be implemented', () => expect(false).toBe(true))
  });

  describe('substitute_variables()', () => {
    it('should be implemented', () => expect(false).toBe(true))
  });

  describe('align_tags()', () => {
    it('should be implemented', () => expect(false).toBe(true))
  });

  describe('fix_tab_stops()', () => {
    it('should be implemented', () => expect(false).toBe(true))
  });

  describe('create_snippet()', () => {
    it('should be implemented', () => expect(false).toBe(true))
  });

})
