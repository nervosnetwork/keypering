export const mockWallet = {
  walletIndex: {
    current: 'b55ed83d-b0d5-45bd-b1cb-fb4975cfb714',
    wallets: [
      {
        name: 'Wallet from mnemonic',
        xpub:
          '0313187b87d8243587e3c6779cecf9bc694a85a7e4ce31be1d26c653e7a66c4f87e5eb7df717b13eb315140d44a170912a9f1c26572124acd83dd5c6443855e23e',
        id: '7dea774e-d829-4256-9a3f-2c6c0a62968a',
      },
      {
        name: 'Wallet from keystore',
        xpub:
          '03aa27ba46497f6015a38ca01fbbced9dc471bd0e759430862d99894634606556e9eae0f6517674208ddaf9a9e1591187c6a79323c507eb198233d7deebc669289',
        id: 'b55ed83d-b0d5-45bd-b1cb-fb4975cfb714',
      },
    ],
  },
  keystores: [
    {
      id: '7dea774e-d829-4256-9a3f-2c6c0a62968a',
      version: '3',
      crypto: {
        ciphertext:
          '51550837505b7b19544e88ae83e11cddf7427d42215fbd5458de0fb8c3719ffd5dc3337cd0d44cd202b468df12ddc22d7088d219b5f59a3a6f5c4cc2f860c1fa',
        cipherparams: { iv: '44197ed4e7d158834c1bbcbe27a18e60' },
        cipher: 'aes-128-ctr',
        kdf: 'scrypt',
        kdfparams: {
          dklen: 32,
          salt: '0bb7bbfee9ff8dcf9283ac51d4f615c6393513a7d965857ef1b8c7469e51a132',
          n: 262144,
          r: 8,
          p: 1,
        },
        mac: '0e985e242153a0e12b7465adf587054d66902bca561e83221c92de10e7094bac',
      },
    },
    {
      version: '3',
      crypto: {
        cipher: 'aes-128-ctr',
        cipherparams: { iv: 'd18787c19b1be9680aa317e879c1f04f' },
        ciphertext:
          '5b1f5c4a1ed9a37c9d0eddd2a60f9dcc78135697e7c4b3eab30fe36d3f3e2ec382136cddfa052d0ddc06454e9fb2b884a293ec3a02872963cd42922699ba70ce',
        kdf: 'scrypt',
        kdfparams: {
          dklen: 32,
          n: 262144,
          p: 1,
          r: 8,
          salt: '6b48c13a1107edcfd7b1dada0a0d10657ad43baca7d4ad0d162ee700af3fcab1',
        },
        mac: '56f173eb0e58a79f687f9c8b18de96c3b8707c7fe60be8afbcd455537f03cbfd',
      },
      id: 'b55ed83d-b0d5-45bd-b1cb-fb4975cfb714',
    },
  ],
}
