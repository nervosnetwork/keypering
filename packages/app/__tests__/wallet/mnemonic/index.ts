import { getMnemonic, getKeystoreFromMnemonic } from '../../../src/wallet/mnemonic'
import { InvalidMnemonicException } from '../../../src/exception'

describe('Test mnemonic module', () => {
  describe('Test getMnemonic', () => {
    it('getMnemonic should return mnemonic with 12 words', () => {
      const mnemonic = getMnemonic()
      expect(mnemonic.split(' ')).toHaveLength(12)
    })
  })

  describe('Test getKeystoreFromMnemonic', () => {
    it('getKeystoreFromMnemonic should return keystore object', () => {
      const mnemonic = getMnemonic()
      const password = '123456'
      const keystore = getKeystoreFromMnemonic({ mnemonic, password })
      expect(keystore).toEqual(expect.objectContaining({
        id: expect.any(String),
        version: '3',
        crypto: {
          ciphertext: expect.any(String),
          cipherparams: {
            iv: expect.any(String)
          },
          cipher: 'aes-128-ctr',
          kdf: 'scrypt',
          kdfparams: {
            dklen: 32,
            salt: expect.any(String),
            n: 2 ** 18,
            r: 8,
            p: 1
          },
          mac: expect.any(String)
        }
      }))
    })

    it('should throw an error if mnemonic is invalid', () => {
      expect(() => getKeystoreFromMnemonic({ mnemonic: '', password: '123' })).toThrow(new InvalidMnemonicException())
    })

  })
})
