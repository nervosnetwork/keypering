module.exports = {
  displayName: 'Unit Tests',
  preset: 'ts-jest',
  globals: {
    "ts-jest": {
      tsConfig: "tsconfig.test.json"
    }
  },
  setupFiles: ['<rootDir>/__mock__/setup.ts'],
  moduleNameMapper: {
    electron: '<rootDir>/__mock__/electron.ts',
    axios: '<rootDir>/__mock__/axios.ts',
    'node-fetch': '<rootDir>/__mock__/node-fetch.ts'
  },
}
