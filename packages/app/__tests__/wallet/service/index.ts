jest.mock('fs')
import fsMock from 'fs'
import { getMnemonic, getKeystoreFromMnemonic } from '../../../src/wallet/mnemonic'
import {
  getWalletIndex,
  addKeystore,
  selectWallet,
  updateWallet,
  getKeystoreByWalletId,
  checkCurrentPassword
} from '../../../src/wallet/service'
import { WalletNotFoundException, CurrentWalletNotSetException } from '../../../src/exception'
import { mockWallet } from '../../../__mock__'

describe('Test wallet service', () => {
  beforeEach(() => {
    jest.spyOn(fsMock, 'existsSync').mockReturnValue(true)
    jest.spyOn(fsMock, 'readdirSync').mockReturnValue([])
    jest.spyOn(fsMock, 'statSync').mockImplementation((): any => ({
      isDirectory: () => true
    }))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  describe('getWalletIndex', () => {
    describe('data exists', () => {
      it('shoule return data', () => {
        const expected = mockWallet.walletIndex
        expect(getWalletIndex()).toEqual(expected)
      })
    })

    describe('data not exists', () => {
      beforeEach(() => {
        jest.spyOn(fsMock, 'existsSync').mockReturnValue(false)
      })
      it('should return empty', () => {
        const expected = { current: '', wallets: [] }
        expect(getWalletIndex()).toEqual(expected)
      })
    })
  })

  describe('addKeystore', () => {

    it('should create keystore file and update index', () => {
      const fixture = {
        name: 'new wallet name',
        password: 'new password',
      }
      const newKeystore = getKeystoreFromMnemonic({ mnemonic: getMnemonic(), password: fixture.password })
      const expected = expect.objectContaining({ id: newKeystore.id, name: fixture.name })
      const writeFileSyncMock = jest.spyOn(fsMock, 'writeFileSync')
      const newProfile = addKeystore({ ...fixture, keystore: newKeystore })
      expect(newProfile).toEqual(expected)
      expect(writeFileSyncMock.mock.calls[0][1]).toBe(JSON.stringify(newKeystore))
    })
    it('should throw an error if wallet name is used', () => {
      const PARAMS = { name: mockWallet.walletIndex.wallets[0].name, password: '123', keystore: mockWallet.keystores[0] }
      expect(() => addKeystore(PARAMS)).toThrowError(`Wallet name is used`)
    })

    it('should throw an error if wallet id exists', () => {

      const PARAMS = { name: 'unused name', password: '123', keystore: mockWallet.keystores[0] }
      expect(() => addKeystore(PARAMS)).toThrowError(`Wallet exists`)
    })

    it('should throw an error if wallet xpub exists', () => {
      const EXIST_WALLET_ID = mockWallet.walletIndex.current
      const EXIST_KEYSTORE = mockWallet.keystores.find(k => k.id === EXIST_WALLET_ID)
      const PARAMS = {
        name: 'unused name',
        password: 'Aa111111',
        keystore: {
          ...EXIST_KEYSTORE!,
          id: 'new-id'
        }
      }
      expect(() => addKeystore(PARAMS)).toThrowError(`Wallet has been created as ${mockWallet.walletIndex.wallets.find(w => w.id === EXIST_WALLET_ID)?.name}`)

    })
  })

  describe('selectWallet', () => {
    it('should update wallet index if selected wallet exists', () => {
      const SELECTED_ID = mockWallet.walletIndex.wallets[1].id
      const expected = JSON.stringify({ current: SELECTED_ID, wallets: mockWallet.walletIndex.wallets })
      const writeFileSyncMock = jest.spyOn(fsMock, 'writeFileSync')
      selectWallet(SELECTED_ID)
      expect(writeFileSyncMock.mock.calls[0][1]).toBe(expected)
    })
    it('should throw an error if selected wallet not exists', () => {
      const SELECTED_ID = 'selected id'
      expect(() => selectWallet(SELECTED_ID)).toThrow(new WalletNotFoundException())
    })
  })

  describe('updateWallet', () => {
    it('should update wallet index', () => {
      const WALLET_ID = mockWallet.walletIndex.wallets[1].id
      const NAME = 'new name'
      const expected = JSON.stringify({
        current: mockWallet.walletIndex.current,
        wallets: [mockWallet.walletIndex.wallets[0], { ...mockWallet.walletIndex.wallets[1], name: NAME }]
      })
      const writeFileSyncMock = jest.spyOn(fsMock, 'writeFileSync')
      updateWallet({ id: WALLET_ID, name: NAME })
      expect(writeFileSyncMock.mock.calls[0][1]).toBe(expected)
    })

    it('should throw an error if wallet name is used', () => {
      const NAME = mockWallet.walletIndex.wallets[1].name
      const WALLET_ID = mockWallet.walletIndex.wallets[0].id
      expect(() => updateWallet({ id: WALLET_ID, name: NAME })).toThrowError(`Wallet name is used`)
    })

    it('should throw an error if wallet is not found', () => {
      const WALLET_ID = 'wallet id'
      const NAME = 'new name'
      expect(() => updateWallet({ id: WALLET_ID, name: NAME })).toThrow(new WalletNotFoundException())
    })
  })

  describe.skip('deleteWallet', () => {
    // TODO: need mock PasswordWindow
    it.skip('should remove a wallet and update current if current wallet is deleted', () => { })

    it.skip('should remove auth list and transaction list', () => { })

    it.skip('should throw an error if current wallet is not set', () => { })
    it.skip('should throw an error if rejected', () => { })
  })

  describe('getKeystoreByWalletId', () => {
    it('should return keystore', () => {
      const expected = expect.objectContaining({
        id: expect.any(String),
        version: '3',
        crypto: {
          cipher: 'aes-128-ctr',
          cipherparams: {
            iv: expect.any(String),
          },
          ciphertext: expect.any(String),
          kdf: 'scrypt',
          kdfparams: {
            dklen: 32,
            n: 2 ** 18,
            p: 1,
            r: 8,
            salt: expect.any(String)
          },
          mac: expect.any(String)

        }
      })
      expect(getKeystoreByWalletId(mockWallet.walletIndex.current)).toEqual(expected)
    })
  })

  describe.skip('exportKeystore', () => {
    // TODO: mock Password Window
  })

  describe('checkCurrentPassword', () => {
    it('should return true if password is correct', () => {
      const PASSWORD = 'Aa111111'
      expect(checkCurrentPassword(PASSWORD)).toBeTruthy()
    })

    it('should return false if password is incorrect', () => {
      const PASSWORD = '123'
      expect(checkCurrentPassword(PASSWORD)).toBeFalsy()
    })

    it('should throw an error if current wallet is not set', () => {
      jest.spyOn(fsMock, 'readFileSync').mockReturnValue(JSON.stringify({ ...mockWallet.walletIndex, current: '' }))
      expect(() => checkCurrentPassword('123')).toThrow(new CurrentWalletNotSetException())
    })
  })

  describe.skip('updateCurrentPassword', () => { })

  describe.skip('signTransaction', () => { })
})
