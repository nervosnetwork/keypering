import simpleStrategy from '../../../src/auth/strategy/simple'

describe('Test simple strategy', () => {
  it('should retrun simple token', () => {
    const fixture = {
      id: 'id',
      time: Date.now().toString(),
      salt: 'salt'
    }
    const expected = `${fixture.id}:${fixture.time}:${fixture.salt}`
    expect(simpleStrategy(fixture.id, fixture.time, fixture.salt)).toBe(expected)
  })
})
