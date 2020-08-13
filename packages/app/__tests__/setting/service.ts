jest.mock('fs')
import fsMock from 'fs'
import { getCustomScripts, updateSetting } from '../../src/setting'
import { mockSetting } from '../../__mock__'
import { NetworkNotFoundException } from '../../src/exception'

describe('Test setting module', () => {
  beforeEach(() => {
    jest.spyOn(fsMock, 'existsSync').mockReturnValue(true)
    jest.spyOn(fsMock, 'statSync').mockImplementation((): any => ({
      isDirectory: () => true
    }))
    jest.spyOn(fsMock, 'readdirSync').mockReturnValue([])
  })
  afterEach(() => {
    jest.clearAllMocks()
  })


  describe.skip('Test getSetting', () => {
    // TODO:
  })

  describe('Test updateSetting', () => {
    const writeFileSyncMock = jest.spyOn(fsMock, 'writeFileSync')

    afterEach(() => {
      writeFileSyncMock.mockClear()
    })

    describe('update locks', () => {
      it('should update locks if locksId in params', () => {
        const PARAMS = { lockIds: Object.keys(mockSetting.locks).slice(1) }
        expect(updateSetting(PARAMS)).toBeTruthy()
        const expectedLocks = JSON.parse(writeFileSyncMock.mock.calls[1][1] as any).locks
        expect(Object.values(expectedLocks).map((lock: any) => lock.enabled)).toEqual([true, false])
      })
    })

    describe('Update current network', () => {
      it('should update setting if network id exists', () => {
        const NETWORK_ID = 'ckb_dev'
        const PARAMS = { networkId: NETWORK_ID }
        expect(updateSetting(PARAMS)).toBeTruthy()
        const expectedSetting = JSON.parse(writeFileSyncMock.mock.calls[0][1] as any)
        expect(expectedSetting.networkId).toBe(NETWORK_ID)
      })
      it('should throw an error if network id not exists', () => {
        expect(() => updateSetting({ networkId: 'id not exists' })).toThrow(new NetworkNotFoundException())
        // TODO:
      })

    })

    it.skip('should return false if params is invalid', () => {
      // TODO:

    })

  })

  describe.skip('Test updateDevnetUrl', () => {
    // TODO:
  })

  describe.skip('Test setScriptsPath', () => {
    // TODO:
  })

  describe('Test getCustomScripts', () => {
    it('should return scripts', () => {
      expect(getCustomScripts()).toEqual([])
    })

    it('should not throw errors if meta info is malformed', () => {
      jest.spyOn(fsMock, 'readFileSync').mockReturnValue("")
      expect(() => getCustomScripts()).not.toThrow()
    })

    it('should return empty if script dir is empty', () => {
      jest.spyOn(fsMock, 'readFileSync').mockReturnValue(JSON.stringify({ scriptsDir: '' }))
      expect(getCustomScripts()).toEqual([])
    })
    it('should return empty if script dir not exists', () => {

      jest.spyOn(fsMock, 'readFileSync').mockReturnValue(JSON.stringify({ scriptsDir: 'incorrect script dir' }))
      jest.spyOn(fsMock, 'existsSync').mockReturnValue(false)
      expect(getCustomScripts()).toEqual([])
    })

    it('should return empty if script dir is not a directory', () => {

      jest.spyOn(fsMock, 'readFileSync').mockReturnValue(JSON.stringify({ scriptsDir: 'incorrect script dir' }))
      expect(getCustomScripts()).toEqual([])
    })

    it.skip('should not throw errors if script is malformed', () => {
      // TODO:
    })

  })
})
