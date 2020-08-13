jest.mock('fs')
import {
  getKeystoreFromXPrv,
  checkPassword,
  decryptKeystore,
  getDerivedKey,
  getKeystoreFromPath
} from '../../../src/wallet/keystore'
import { mockWallet } from '../../../__mock__'
import { IncorrectPasswordException } from '../../../src/exception'
import fsMock from 'fs'

describe('Test keystore module', () => {

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

      it('should throw an error if password is incorrect', () => {
        const INCORRECT_PASSWORD = 'incorrect password'
        expect(() => decryptKeystore(keystore, INCORRECT_PASSWORD)).toThrow(new IncorrectPasswordException())
      })

    })
  })

  describe('Test getDerivedKey', () => {
    const keystore = mockWallet.keystores[0]
    it('should return derivedKey if password is correct', () => {
      const PASSWORD = 'Aa111111'
      expect(getDerivedKey(keystore, PASSWORD)).toHaveLength(32)
    })
  })

  describe('Test getKeystoreFromPath', () => {
    const keystore = mockWallet.keystores[0]

    beforeEach(() => {
      jest.spyOn(fsMock, 'readFileSync').mockReturnValue(JSON.stringify(keystore))
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should return if keystore exists and password is correct', () => {
      const PASSWORD = 'Aa111111'
      expect(getKeystoreFromPath('keystore path', PASSWORD)).not.toBeUndefined()
    })

    it('should throw an error if keystore not exists', () => {
      jest.spyOn(fsMock, 'readFileSync').mockReturnValue("\"\"")
      expect(() => getKeystoreFromPath('keystore path', 'password')).toThrowError('Keystore is not found')
    })

    it('should throw an error if password is incorrect', () => {
      const INCORRECT_PASSWORD = 'incorrect password'
      expect(() => getKeystoreFromPath('keystore path', INCORRECT_PASSWORD)).toThrow(new IncorrectPasswordException())
    })
  })
})
