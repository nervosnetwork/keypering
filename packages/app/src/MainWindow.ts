import path from 'path'
import { BrowserWindow, ipcMain, dialog, shell } from 'electron'
import { Channel } from '@keypering/specs'
import CKB from '@nervosnetwork/ckb-sdk-core'
import * as walletManager from './wallet'
import * as settingManager from './setting'
import * as authManager from './auth'
import * as txManager from './tx'
import { getAddrList } from './address'
import { getWalletIndex } from './wallet'
import { SECP256K1_BLAKE160_CODE_HASH } from './utils'
import { CurrentWalletNotSetException, LockNotFoundException } from './exception'

export default class MainWindow {
  static id: number | undefined
  #win = new BrowserWindow({
    width: 440,
    height: 690,
    minWidth: 440,
    minHeight: 690,
    resizable: true,
    maximizable: false,
    fullscreenable: false,
    autoHideMenuBar: true,
    title: 'Keypering',
    show: false,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  get win() {
    return this.#win
  }

  #firstRouter = () => {
    try {
      const { current } = getWalletIndex()
      return current
        ? 'main'
        : 'welcome'
    } catch (error) {
      console.error(error)
    }
    return 'welcome'
  }

  #filePath =
    process.env.NODE_ENV === 'development'
      ? `http://localhost:3000/#${this.#firstRouter()}`
      : path.join('file://', __dirname, '..', 'public', 'ui', `index.html#${this.#firstRouter()}`)

  public static broadcast = <P = any>(channel: Channel.ChannelName, params: P) => {
    if (MainWindow.id === undefined) {
      return
    }

    BrowserWindow.fromId(MainWindow.id).webContents.send(channel, params)
  }

  constructor() {
    this.#registerChannels()
    MainWindow.id = this.win.id

    this.#win.on('ready-to-show', () => {
      this.#win.show()
    })
    this.#win.on('closed', () => {
      MainWindow.id = undefined
    })
  }

  public load = () => {
    this.#win.loadURL(this.#filePath)
  }

  #registerChannels = () => {
    ipcMain.handle(Channel.ChannelName.GetWalletIndex, () => {
      try {
        const result = walletManager.getWalletIndex()
        return { code: Channel.Code.Success, result }
      } catch (err) {
        dialog.showErrorBox('Error: WalletIndex', err.message)
        return { code: Channel.Code.Error, message: err.message }
      }
    })

    ipcMain.handle(Channel.ChannelName.CreateWallet, (_e, params: Channel.CreateWallet.Params) => {
      try {
        const keystore = walletManager.getKeystoreFromMnemonic(params)
        walletManager.addKeystore({ ...params, keystore })
        return { code: Channel.Code.Success, result: true }
      } catch (err) {
        dialog.showErrorBox('Error: Create Wallet', err.message)
        return { code: Channel.Code.Error, message: err.message }
      }
    })

    ipcMain.handle(Channel.ChannelName.SelectWallet, (_e, params: Channel.SelectWallet.Params) => {
      try {
        const res = walletManager.selectWallet(params.id)
        return { code: Channel.Code.Success, result: res }
      } catch (err) {
        dialog.showErrorBox('Error: Select Wallet', err.message)
        return { code: Channel.Code.Error, message: err.message }
      }
    })

    ipcMain.handle(Channel.ChannelName.DeleteWallet, _e => {
      try {
        const result = walletManager.deleteWallet()
        return { code: Channel.Code.Success, result }
      } catch (err) {
        dialog.showErrorBox('Error: Delete Wallet', err.message)
        return { code: Channel.Code.Error, message: err.message }
      }
    })

    ipcMain.handle(Channel.ChannelName.UpdateWallet, (_e, params: Channel.UpdateWallet.Params) => {
      try {
        const result = walletManager.updateWallet(params)
        return { code: Channel.Code.Success, result }
      } catch (err) {
        dialog.showErrorBox('Error: Update Wallet', err.message)
        return { code: Channel.Code.Error, message: err.message }
      }
    })

    ipcMain.handle(Channel.ChannelName.BackupWallet, async _e => {
      try {
        const result = await walletManager.exportKeystore()
        return { code: Channel.Code.Success, result }
      } catch (err) {
        dialog.showErrorBox('Error: Backup Wallet', err.message)
        return { code: Channel.Code.Error, message: err.message }
      }
    })


    ipcMain.handle(Channel.ChannelName.CheckCurrentPassword, (_e, params: Channel.CheckCurrentPassword.Params) => {
      try {
        const result = walletManager.checkCurrentPassword(params.password)
        return { code: Channel.Code.Success, result }
      } catch (err) {
        dialog.showErrorBox('Error: Check Password', err.message)
        return { code: Channel.Code.Error, message: err.message }
      }
    })

    ipcMain.handle(Channel.ChannelName.GetMnemonic, () => {
      try {
        const result = walletManager.getMnemonic()
        return { code: Channel.Code.Success, result }
      } catch (err) {
        dialog.showErrorBox('Error: Get Mnemonic', err.message)
        return { code: Channel.Code.Error, message: err.message }
      }
    })

    ipcMain.handle(Channel.ChannelName.ImportKeystore, (_e, params: Channel.ImportKeystore.Params) => {
      const { keystorePath, password } = params
      try {
        const keystore = walletManager.getKeystoreFromPath(keystorePath, password)
        walletManager.addKeystore({ ...params, keystore })
        return { code: Channel.Code.Success, result: true }
      } catch (err) {
        dialog.showErrorBox('Error: Import Keystore', err.message)
        return { code: Channel.Code.Error, message: err.message }
      }
    })

    ipcMain.handle(Channel.ChannelName.GetSetting, (): Channel.GetSetting.Response => {
      try {
        const { locks, ...rest } = settingManager.getSetting()
        const filteredLocks: Channel.Setting['locks'] = {}
        Object.keys(locks).forEach(lockId => {
          filteredLocks[lockId] = {
            name: locks[lockId].name,
            enabled: locks[lockId].enabled,
            system: locks[lockId].system,
          }
        })
        return { code: Channel.Code.Success, result: { ...rest, locks: filteredLocks } }
      } catch (err) {
        dialog.showErrorBox('Error: Get Setting', err.message)
        return { code: Channel.Code.Error, message: err.message }
      }
    })

    ipcMain.handle(
      Channel.ChannelName.UpdateSetting,
      (_e, params: Channel.UpdateSetting.Params): Channel.UpdateSetting.Response => {
        try {
          const result = settingManager.updateSetting(params)
          return { code: Channel.Code.Success, result }
        } catch (err) {
          dialog.showErrorBox('Error: Update Setting', err.message)
          return { code: Channel.Code.Error, message: err.message }
        }
      }
    )

    ipcMain.handle(Channel.ChannelName.UpdateScriptsDir, async () => {
      try {
        const result = await settingManager.setScriptsPath()
        return { code: Channel.Code.Success, result }
      } catch (err) {
        dialog.showErrorBox('Error: Update Script Directory', err.message)
        return { code: Channel.Code.Error, message: err.message }
      }
    })

    ipcMain.handle(Channel.ChannelName.GetTxList, (): Channel.GetTxList.Response => {
      try {
        const { current } = walletManager.getWalletIndex()
        const { networkId } = settingManager.getSetting()
        const result = txManager.getTxList(current, networkId)
        return { code: Channel.Code.Success, result }
      } catch (err) {
        dialog.showErrorBox('Error: Get Transaction List', err.message)
        return { code: Channel.Code.Error, message: err.message }
      }
    })

    ipcMain.handle(Channel.ChannelName.RequestSign, async (_e, params: Channel.RequestSign.Params) => {
      try {
        const { current, wallets } = getWalletIndex()
        const wallet = wallets.find(w => w.id === current)
        if (!wallet) {
          throw new CurrentWalletNotSetException()
        }
        const ckb = new CKB()
        const lockHash = ckb.utils.scriptToHash({
          codeHash: SECP256K1_BLAKE160_CODE_HASH,
          hashType: 'type',
          args: `0x${ckb.utils.blake160(`0x${wallet.childXpub.slice(0, 66)}`, 'hex')}`
        })
        const tx = await txManager.requestSignTx({ ...params, lockHash, referer: 'Keypering', description: '' })
        return { code: Channel.Code.Success, result: { tx } }
      } catch (err) {
        if (err instanceof LockNotFoundException) {
          dialog.showErrorBox('Error: Request Sign Transaction', err.message)
        }
        console.error(err)
        return { code: err.code || Channel.Code.Error, message: err.message }
      }
    })

    ipcMain.handle(Channel.ChannelName.GetAddrList, async (_e, params: Channel.GetAddrList.Params) => {
      const { id, networkId } = params
      try {
        const list = await getAddrList(id, networkId)
        return {
          code: Channel.Code.Success,
          result: list,
        }
      } catch (err) {
        dialog.showErrorBox('Error: Get Address List', err.message)
        return { code: Channel.Code.Error, message: err.message }
      }
    })

    ipcMain.handle(Channel.ChannelName.GetAuthList, () => {
      try {
        const { current } = walletManager.getWalletIndex()
        const list = authManager.getAuthList(current)
        return {
          code: Channel.Code.Success,
          result: list.map(auth => ({ url: auth.url, time: auth.time })),
        }
      } catch (err) {
        dialog.showErrorBox('Error: Get Authorization List', err.message)
        return { code: Channel.Code.Error, message: err.message }
      }
    })

    ipcMain.handle(
      Channel.ChannelName.DeleteAuth,
      async (_e, params: Channel.DeleteAuth.Params): Promise<Channel.DeleteAuth.Response> => {
        try {
          const { current } = walletManager.getWalletIndex()
          const result = await authManager.deleteAuth(current, params.url)
          return { code: Channel.Code.Success, result }
        } catch (err) {
          dialog.showErrorBox('Error: Delete Authorization', err.message)
          return { code: Channel.Code.Error, message: err.message }
        }
      }
    )

    ipcMain.handle(Channel.ChannelName.SubmitPassword, (_e, params: Channel.SubmitPassword.Params) => {
      const { currentPassword, newPassword } = params
      try {
        const result = walletManager.updateCurrentPassword(currentPassword, newPassword)
        return { code: Channel.Code.Success, result }
      } catch (err) {
        dialog.showErrorBox('Error: Submit Password', err.message)
        return { code: Channel.Code.Error, message: err.message }
      }
    })

    ipcMain.handle(Channel.ChannelName.OpenInBrowser, (_e, params: Channel.OpenInBrowser.Params) => {
      if (params.url) {
        shell.openExternal(params.url)
        return { code: Channel.Code.Success, result: true }
      }
      return { code: Channel.Code.Error, message: 'Url is required' }
    })

    ipcMain.handle(Channel.ChannelName.OpenDevnetSetting, async () => {
      try {
        const result = await settingManager.updateDevnetUrl()
        return { code: Channel.Code.Success, result }
      } catch (err) {
        dialog.showErrorBox('Error: Open Devnet Setting', err.message)
        return { code: Channel.Code.Error, message: err.message }
      }
    })

    ipcMain.handle(Channel.ChannelName.ShowAlert, (_e, params: Channel.ShowAlert.Params) => {
      if (params.message) {
        dialog.showErrorBox('Alert', params.message)
      }
      return { code: Channel.Code.Success, result: true }
    })
  }
}
