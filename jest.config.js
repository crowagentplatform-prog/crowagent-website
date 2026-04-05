module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  collectCoverage: true,
  collectCoverageFrom: ['scripts.js'],
  coverageThreshold: {
    global: { lines: 50 }
  },
  coverageReporters: ['text', 'lcov'],
};
