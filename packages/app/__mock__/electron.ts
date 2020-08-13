import path from 'path'

import os from 'os'
export const app = {
  getPath: jest.fn().mockReturnValue(path.resolve(os.tmpdir(), 'electron', 'userData', 'keypering'))
}
export const dialog = jest.fn()

export const BrowserWindow = jest.fn()