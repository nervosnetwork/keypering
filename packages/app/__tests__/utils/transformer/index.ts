import { shannonToCkb } from '../../../src/utils/transformer'
import fixtures from './fixtures.json'

describe('Test transformer', () => {
  describe('Test shannonToCkb', () => {
    const fixtureTable = fixtures.shannonToCkb
    test.each(fixtureTable)(`%s`, fixture => {
      expect(shannonToCkb(fixture.shannons as string)).toBe(fixture.expected)
    })

    it('should start with + when show positive is true', () => {
      expect(shannonToCkb('123', true)).toBe('+0.00000123')
    })
    it('should have no comma if delimiter is empty string', () => {
      expect(shannonToCkb('1234567890123456789', false, '')).toBe('12345678901.23456789')
    })
  })
})

