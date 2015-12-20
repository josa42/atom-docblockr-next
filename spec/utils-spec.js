"use babel"

import { escape, isNumeric } from '../lib/utils'

describe('utils', () => {
  xdescribe('escape()', () => {
    it('should be implemented', () => expect(false).toBe(true))

    it('should escape', () => {
      // not sure what this does actually

      // expect(escape('$foo')).toBe('$foo')
      // expect(escape('foo {')).toBe('foo {')
      // expect(escape('foo {}')).toBe('foo {}')
    })
  })

  describe('isNumeric()', () => {
    it('should identify numbers', () => {
      expect(isNumeric(NaN)).toBe(false)
      expect(isNumeric("test")).toBe(false)
      expect(isNumeric("1")).toBe(true)
      expect(isNumeric("-1")).toBe(true)
      expect(isNumeric("+1")).toBe(true)
      expect(isNumeric(1)).toBe(true)
      expect(isNumeric(1.1)).toBe(true)
    })
  })

})
