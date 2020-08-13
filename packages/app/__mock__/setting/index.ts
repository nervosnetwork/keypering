export const mockSetting = {
  locks: {
    '0x86a1c6987a4acbe1a887cca4c9dd2ac9fcb07405bbeda51b861b18bbf7492c4b:type': {
      name: 'anyone can pay(testnet)',
      enabled: true,
      system: false,
      ins: {
        name: 'anyone can pay(testnet)',
        codeHash: '0x86a1c6987a4acbe1a887cca4c9dd2ac9fcb07405bbeda51b861b18bbf7492c4b',
        hashType: 'type',
        _deps: [
          {
            outPoint: { txHash: '0x4f32b3e39bd1b6350d326fdfafdfe05e5221865c3098ae323096f0bfc69e0a8c', index: '0x0' },
            depType: 'depGroup',
          },
        ],
      },
    },
    '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8:type': {
      name: 'secp256k1(testnet)',
      enabled: true,
      system: false,
      ins: {
        name: 'secp256k1(testnet)',
        codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
        hashType: 'type',
        _deps: [
          {
            outPoint: { txHash: '0xf8de3bb47d055cdf460d93a2a6e1b05f7432f9777c8c474abf4eec1d4aee5d37', index: '0x0' },
            depType: 'depGroup',
          },
        ],
      },
    },
  },
  networks: {
    ckb: { name: 'mainnet', url: 'https://prototype.ckbapp.dev/mainnet/indexer' },
    ckb_test: { name: 'testnet', url: 'https://prototype.ckbapp.dev/testnet/indexer' },
    ckb_dev: { name: 'devnet', url: 'https://prototype.ckbapp.dev/devnet/indexer' },
  },
  networkId: 'ckb_test',
}
