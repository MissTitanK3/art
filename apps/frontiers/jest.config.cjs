/** @type {import('jest').Config} */
const config = {
    displayName: 'frontiers',
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.(t|j)sx?$': ['@swc/jest', {
            jsc: {
                parser: {
                    syntax: 'typescript',
                    tsx: true,
                },
                transform: {
                    react: {
                        runtime: 'automatic',
                    },
                },
            },
        }],
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '^@workspace/ui/(.*)$': '<rootDir>/../../packages/ui/src/$1',
        '^@workspace/store/(.*)$': '<rootDir>/../../packages/store/src/$1',
        '^@workspace/store$': '<rootDir>/../../packages/store/src/index.ts',
        '^@workspace/ui$': '<rootDir>/../../packages/ui/src/index.ts',
        '^@workspace/ui/globals.css$': '<rootDir>/../../packages/ui/src/styles/globals.css',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
    testMatch: [
        '**/__tests__/**/*.(test|spec).[jt]s?(x)',
        '**/?(*.)+(spec|test).[jt]s?(x)',
    ],
    testPathIgnorePatterns: ['/node_modules/', '/.next/', '/e2e/'],
    collectCoverageFrom: [
        'app/**/*.{js,jsx,ts,tsx}',
        'components/**/*.{js,jsx,ts,tsx}',
        'lib/**/*.{js,jsx,ts,tsx}',
        'hooks/**/*.{js,jsx,ts,tsx}',
        '!**/*.d.ts',
        '!**/node_modules/**',
        '!**/.next/**',
    ],
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 50,
            lines: 50,
            statements: 50,
        },
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    transformIgnorePatterns: [
        '/node_modules/(?!(lucide-react|@radix-ui)/)',
    ],
};

module.exports = config;
