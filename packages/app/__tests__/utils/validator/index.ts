import { validateJsonRpcFields } from '../../../src/utils/validator'
import fixtures from './fixtures.json'

describe('Test utils module', () => {
  describe('Test validateJsonRpcFields', () => {
    const fixtureTable: [string, [any], string | null][] = Object.entries(fixtures.validateJsonRpcFields)
      .map(
        ([
          name, { params, exception }
        ]: [string, { params: any, exception: string | null }]) => ([name, params, exception])
      )
    test.each(fixtureTable)(`%s`, (_name, params, exception) => {
      expect.assertions(1)
      if (exception) {
        expect(() => validateJsonRpcFields(...params)).toThrowError((exception))

      } else {
        expect(() => validateJsonRpcFields(...params)).not.toThrowError()
      }
    })

  })
})
