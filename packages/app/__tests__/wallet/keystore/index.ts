import { getKeystoreFromXPrv, checkPassword, decryptKeystore } from '../../../src/wallet/keystore'

// REFACTOR: use existing test cases in neuron, should be reorgnized later
describe('Test getKeystoreFromXPrv', () => {
  const fixture = {
    privateKey: 'e8f32e723decf4051aefac8e2c93c9c5b214313817cdb01a1494b917c8436b35',
    publicKey: '0339a36013301597daef41fbe593a02cc513d0b55527ec2df1050e2e8ff49c85c2',
    chainCode: '873dff81c02f525623fd1fe5167eac3a55a049de3d314bb42ee227ffed37d508',
  }

  describe('load and check password', () => {
    const password = 'hello~!23'
    const keystore = getKeystoreFromXPrv(
      Buffer.from(`${fixture.privateKey}${fixture.chainCode}`, 'hex'),
      password
    )
    it('check wrong password', () => {
      expect(checkPassword(keystore, `wrong ${password}`)).toBe(false)
    })

    it('check correct password', () => {
      expect(checkPassword(keystore, password)).toBe(true)
    })

    it('decrypts', () => {
      expect(decryptKeystore(keystore, password)).toBe(`${fixture.privateKey}${fixture.chainCode}`)
    })

  })
})
