import { Channel, API } from '@keypering/specs'
import CKB from '@nervosnetwork/ckb-sdk-core'
import { getWalletPublicKey, getRemoteAddressCapacity, getLocalAddressCapacity } from './utils'
import { getSetting } from '../setting'

let interval: NodeJS.Timeout | undefined

export const getAddrList = (id: string, network: Channel.NetworkId): Channel.Address[] => {
  clearInterval(interval as any)
  getRemoteAddressCapacity(id, network)
    .then(success => {
      if (!success) {
        clearInterval(interval as any)
      }
    })
  interval = setInterval(() => {
    getRemoteAddressCapacity(id, network)
      .then(success => {
        if (!success) {
          clearInterval(interval as any)
        }
      })
  }, 1000)
  return getLocalAddressCapacity(id, network)
}

export const getAddresses = async (id: string, network: Channel.NetworkId): Promise<API.AddressInfo[]> => {
  const { locks } = getSetting()
  const ckb = new CKB()
  const { AddressPrefix, pubkeyToAddress, scriptToHash } = ckb.utils
  const prefix = network === 'ckb'
    ? AddressPrefix.Mainnet
    : AddressPrefix.Testnet
  const publicKey = getWalletPublicKey(id)

  const addresses = Object.keys(locks).map(key => {
    const lock = locks[key].ins
    const args = lock.script(publicKey).args
    const lockScript = {
      codeHash: lock.codeHash,
      args, hashType: lock.hashType
    }
    return {
      address: pubkeyToAddress(publicKey, { prefix } as any),
      lockScript,
      lockHash: scriptToHash(lockScript),
      publicKey,
      lockScriptMeta: {
        name: lock.name,
        cellDeps: lock.deps(),
        headerDeps: lock.headers
          ? lock.headers()
          : [],
      },
    }
  })
  return addresses
}

export default { getAddrList, getAddresses }
