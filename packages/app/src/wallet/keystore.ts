import fs from 'fs'
import crypto from 'crypto'
import { Keccak } from 'sha3'
import { v4 as uuid } from 'uuid'
import { privateToPublic } from './Keychain'

import { UnsupportedCipherException, IncorrectPasswordException } from '../exception'

export interface KdfParams {
  dklen: number
  n: number
  r: number
  p: number
  salt: string
}

interface Crypto {
  cipher: string
  cipherparams: { iv: string }
  ciphertext: string
  kdf: string
  kdfparams: KdfParams
  mac: string
}

export interface Keystore {
  id: string
  version: string
  crypto: Crypto
}

const getMac = (derivedKey: Buffer, ciphertext: Buffer) =>
  new Keccak(256).update(Buffer.concat([derivedKey.slice(16, 32), ciphertext])).digest('hex')

const getScryptOptions = (kdfparams: KdfParams) => ({
  N: kdfparams.n,
  r: kdfparams.r,
  p: kdfparams.p,
  maxmem: 128 * (kdfparams.n + kdfparams.p + 2) * kdfparams.r,
})

export const getKeystoreFromXPrv = (xPrv: Buffer, password: string) => {
  const salt = crypto.randomBytes(32)
  const iv = crypto.randomBytes(16)
  const kdfparams: KdfParams = { dklen: 32, salt: salt.toString('hex'), n: 2 ** 18, r: 8, p: 1 }
  const derivedKey = crypto.scryptSync(password, salt, kdfparams.dklen, getScryptOptions(kdfparams))

  const CIPHER = 'aes-128-ctr'
  const cipher = crypto.createCipheriv(CIPHER, derivedKey.slice(0, 16), iv)
  if (!cipher) {
    throw new UnsupportedCipherException()
  }
  const ciphertext = Buffer.concat([cipher.update(xPrv), cipher.final()])
  return {
    id: uuid(),
    version: '3',
    crypto: {
      ciphertext: ciphertext.toString('hex'),
      cipherparams: { iv: iv.toString('hex') },
      cipher: CIPHER,
      kdf: 'scrypt',
      kdfparams,
      mac: getMac(derivedKey, ciphertext),
    },
  }
}

export const getDerivedKey = (keystore: Keystore, password: string) => {
  const { kdfparams } = keystore.crypto
  return crypto.scryptSync(password, Buffer.from(kdfparams.salt, 'hex'), kdfparams.dklen, getScryptOptions(kdfparams))
}
export const decryptKeystore = (keystore: Keystore, password: string): string => {
  const derivedKey = getDerivedKey(keystore, password)
  const ciphertext = Buffer.from(keystore.crypto.ciphertext, 'hex')
  if (getMac(derivedKey, ciphertext) !== keystore.crypto.mac) {
    throw new IncorrectPasswordException()
  }
  const decipher = crypto.createDecipheriv(
    keystore.crypto.cipher,
    derivedKey.slice(0, 16),
    Buffer.from(keystore.crypto.cipherparams.iv, 'hex')
  )
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('hex')
}

export const getXpub = (keystore: Keystore, password: string) => {
  const xprv = decryptKeystore(keystore, password)
  const sk = xprv.slice(0, 64)
  const chainCode = xprv.slice(64)
  const pk = privateToPublic(Buffer.from(sk, 'hex'))
  return pk.toString('hex') + chainCode
}

export const checkPassword = (keystore: Keystore, password: string) => {
  const derivedKey = getDerivedKey(keystore, password)
  const ciphertext = Buffer.from(keystore.crypto.ciphertext, 'hex')
  return getMac(derivedKey, ciphertext) === keystore.crypto.mac
}

export const getKeystoreFromPath = (keystorePath: string, password: string) => {
  const keystore = JSON.parse(fs.readFileSync(keystorePath).toString('utf8')) as Keystore
  if (!keystore) {
    throw new Error('Keystore is not found')
  }
  const result = checkPassword(keystore, password)
  if (!result) {
    throw new IncorrectPasswordException()
  }
  return keystore
}
