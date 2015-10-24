"use babel"

import DocblockrWorker from '../lib/docblockr-worker'

xdescribe('DocblockrWorker()', () => {

  let docblockrWorker;

  beforeEach(() => {
    waitsForPromise(() => atom.packages.activatePackage('docblockr'))
    runs(() => {
      docblockrWorker = new DocblockrWorker()
    })
  })

  describe('update_config()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('validate_request()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('parse_command()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('trim_auto_whitespace_command()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('indent_command()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('join_command()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('decorate_command()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('decorate_multiline_command()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('deindent_command()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('reparse_command()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('wrap_lines_command()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('get_indent_spaces()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('initialize()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('counter()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('repeat()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('write()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('erase()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('fill_array()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('read_line()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('scope_range()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('get_parser()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('generate_snippet()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('substitute_variables()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('align_tags()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('fix_tab_stops()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });

  describe('create_snippet()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  });
})
