import { sep } from 'path'
jest.mock('fs')
import fsMock from 'fs'
import { mockWallet, mockSetting, mockSettingMeta, mockAuth, mockTxList } from '.'

jest.spyOn(fsMock, 'readFileSync').mockImplementation((filePath: any) => {
  if (filePath.endsWith('wallet/index.json')) {
    return JSON.stringify(mockWallet.walletIndex)
  }
  const keystorePathReg = new RegExp(`${sep}test${sep}wallet`)
  if (keystorePathReg.test(filePath)) {
    return JSON.stringify(mockWallet.keystores[0])
  }
  if (filePath.endsWith('setting/index.json')) {
    return JSON.stringify(mockSetting)
  }
  const authPathReg = new RegExp(`${sep}test${sep}auth`)
  if (authPathReg.test(filePath)) {
    return JSON.stringify(mockAuth)
  }
  if (filePath.endsWith('setting/meta.json')) {
    return JSON.stringify(mockSettingMeta)
  }
  const txPathReg = new RegExp(`${sep}test${sep}tx${sep}`)
  if (txPathReg.test(filePath)) {
    return JSON.stringify(mockTxList)
  }
  throw new Error(`Read file ${filePath} failed`)
})
