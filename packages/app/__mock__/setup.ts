import { sep } from 'path'
jest.mock('fs')
import fsMock from 'fs'
import { mockWallet, mockSetting, mockSettingMeta, mockAuth, mockTxList } from '.'

jest.spyOn(fsMock, 'readFileSync').mockImplementation((filePath: any) => {
  const walletIndexReg = new RegExp(`${sep}test${sep}wallet${sep}index.json`)
  if (walletIndexReg.test(filePath)) {
    return JSON.stringify(mockWallet.walletIndex)
  }
  const keystorePathReg = new RegExp(`${sep}test${sep}wallet`)
  if (keystorePathReg.test(filePath)) {
    return JSON.stringify(mockWallet.keystores[0])
  }
  const settingIndexPathReg = new RegExp(`${sep}test${sep}setting${sep}index.json`)
  if (settingIndexPathReg.test(filePath)) {
    return JSON.stringify(mockSetting)
  }
  const settingMetaReg = new RegExp(`${sep}test${sep}setting${sep}meta.json`)
  if (settingMetaReg.test(filePath)) {
    return JSON.stringify(mockSettingMeta)
  }
  const authPathReg = new RegExp(`${sep}test${sep}auth`)
  if (authPathReg.test(filePath)) {
    return JSON.stringify(mockAuth)
  }
  const txPathReg = new RegExp(`${sep}test${sep}tx${sep}`)
  if (txPathReg.test(filePath)) {
    return JSON.stringify(mockTxList)
  }
  throw new Error(`Read file ${filePath} failed`)
})
