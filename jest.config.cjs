module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  testPathIgnorePatterns: ['<rootDir>/tests/jdfit/route.test.ts', '<rootDir>/tests/jdfit/consent.test.ts', '<rootDir>/tests/jdfit/analytics_legacy.test.ts'],
};
