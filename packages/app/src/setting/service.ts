import path from 'path'
import fs from 'fs'
import { dialog } from 'electron'
import { Channel } from '@keypering/specs'
import { LockScript } from '@nervosnetwork/keyper-specs'
import systemScripts from './scripts'
import systemNetworks from './networks'
import DevnetWindow from './DevnetWindow'
import { getDataPath, MAINNET_ID, TESTNET_ID, DEVNET_ID } from '../utils'
import { broadcastSetting as broadcast } from '../broadcast'
import { NetworkNotFoundException, InvalidDirectoryException } from '../exception'

const dataPath = getDataPath('setting')
const filePath = path.resolve(dataPath, 'index.json')
const metaInfoPath = path.resolve(dataPath, 'meta.json')

if (!fs.existsSync(metaInfoPath)) {
  fs.writeFileSync(metaInfoPath, JSON.stringify({ scriptsDir: '' }))
}

export const getCustomScripts = () => {
  let scriptsDir = ''
  try {
    const metaInfo = JSON.parse(fs.readFileSync(metaInfoPath, 'utf8'))
    if (metaInfo?.scriptsDir) {
      scriptsDir = metaInfo.scriptsDir
    }
  } catch (err) {
    console.error(err)
  }
  const scripts: LockScript[] = []
  if (!scriptsDir || !fs.existsSync(scriptsDir) || !fs.statSync(scriptsDir).isDirectory()) {
    return scripts
  }

  const files = fs.readdirSync(scriptsDir).filter(filename => filename.endsWith('.js'))
  files.forEach(filename => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const script: LockScript = require(path.resolve(scriptsDir, filename))
      if (script.name && script.codeHash && script.hashType && script.sign) {
        scripts.push(script)
      }
    } catch (err) {
      console.error(err)
    }
  })

  return scripts
}

const getScriptId = (script: LockScript) => `${script.codeHash}:${script.hashType}`

export const getSetting = () => {
  let setting: {
    locks: Record<string, { name: string, enabled: boolean, system: boolean, ins: LockScript }>
    networks: Channel.Setting['networks']
    networkId: Channel.NetworkId
  } = { locks: {}, networks: {} as Channel.Setting['networks'], networkId: MAINNET_ID }
  if (fs.existsSync(filePath)) {
    setting = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  }
  setting.networkId = setting.networkId || MAINNET_ID

  systemNetworks.forEach((network, id) => {
    if (id === DEVNET_ID) {
      setting.networks[id] = setting.networks[id] ?? network
    } else {
      setting.networks[id] = network
    }
  })

  const customScripts = getCustomScripts()
  const locks: Record<string, { name: string, enabled: boolean, system: boolean, ins: LockScript }> = {}

  customScripts.forEach(script => {
    locks[getScriptId(script)] = {
      name: script.name,
      enabled: setting.locks[getScriptId(script)]?.enabled,
      system: false,
      ins: script,
    }
  })

  const scriptsToShow = setting.networkId === MAINNET_ID
    ? systemScripts.mainnetScripts
    : setting.networkId === TESTNET_ID
      ? systemScripts.testnetScripts
      : []

  scriptsToShow.forEach(script => {
    locks[getScriptId(script)] = {
      name: script.name,
      enabled: setting.locks[getScriptId(script)]?.enabled ?? true,
      system: true,
      ins: script,
    }
  })
  return { ...setting, locks }
}

export const updateSetting = (params: Channel.UpdateSetting.Params) => {
  const setting = getSetting()
  if ('lockIds' in params) {
    Object.keys(setting.locks).forEach(id => {
      setting.locks[id].enabled = params.lockIds.includes(id)
    })
  } else if ('networkId' in params) {
    if (!Object.keys(setting.networks).includes(params.networkId)) {
      throw new NetworkNotFoundException()
    }
    setting.networkId = params.networkId as Channel.NetworkId
  } else {
    return false
  }
  fs.writeFileSync(filePath, JSON.stringify(setting))
  broadcast(getSetting())
  return true
}

export const updateDevnetUrl = async () => {
  const setting = getSetting()
  const currentUrl = setting.networks[DEVNET_ID].url ?? ''
  const devnetWindow = new DevnetWindow(currentUrl)
  const newUrl = await devnetWindow.response()
  devnetWindow.close()
  if (typeof newUrl === 'boolean') {
    return false
  }
  setting.networks[DEVNET_ID].url = newUrl
  fs.writeFileSync(filePath, JSON.stringify(setting))
  broadcast(getSetting())
  return true
}

export const setScriptsPath = async () => {
  const { filePaths, canceled } = await dialog.showOpenDialog({
    title: 'Scripts Directory',
    properties: ['openDirectory'],
    message: 'Select the directory to load scripts',
  })

  const scriptsFilePath = filePaths[0]
  if (canceled || !scriptsFilePath) {
    return false
  }
  const stat = fs.statSync(scriptsFilePath)
  if (!stat.isDirectory()) {
    throw new InvalidDirectoryException(scriptsFilePath)
  }
  let metaInfo = { scriptsDir: '' }
  try {
    metaInfo = JSON.parse(fs.readFileSync(metaInfoPath, 'utf8'))
  } catch (err) {
    console.error(err)
  }
  metaInfo.scriptsDir = scriptsFilePath
  fs.writeFileSync(metaInfoPath, JSON.stringify(metaInfo))
  dialog.showMessageBox({
    title: 'Info',
    message: `Scripts Directory is set to ${scriptsFilePath}`,
  })
  broadcast(getSetting())
  return true
}
