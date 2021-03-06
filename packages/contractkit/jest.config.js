module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/?(*.)+(spec|test).ts?(x)'],
  setupFilesAfterEnv: ['<rootDir>/src/test-utils/matchers.ts'],
  globalSetup: '<rootDir>/src/test-utils/ganache.setup.ts',
  globalTeardown: '<rootDir>/src/test-utils/ganache.teardown.ts',
}
