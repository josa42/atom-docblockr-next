"use babel"

import DocblockrWorker from '../lib/docblockr-worker'

xdescribe('DocblockrWorker()', () => {

  let docblockrWorker

  beforeEach(() => {
    waitsForPromise(() => atom.packages.activatePackage('docblockr-next'))
    runs(() => {
      docblockrWorker = new DocblockrWorker()
    })
  })

  describe('update_config()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('validate_request()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('parse_command()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('trim_auto_whitespace_command()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('indent_command()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('join_command()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('decorate_command()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('decorate_multiline_command()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('deindent_command()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('reparse_command()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('wrap_lines_command()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('get_indent_spaces()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('initialize()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('counter()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('repeat()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('write()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('erase()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('fillArray()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('readLine()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('scopeRange()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('getParser()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('generateSnippet()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('substituteVariables()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('alignTags()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('fixTabStops()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })

  describe('createSnippet()', () => {
    xit('should be implemented', () => expect(false).toBe(true))
  })
})
