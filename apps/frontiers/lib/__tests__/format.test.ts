import { humanizeKey, pct } from '../format';

describe('humanizeKey', () => {
    test('converts snake_case to Title Case', () => {
        expect(humanizeKey('hello_world')).toBe('Hello World');
    });

    test('converts kebab-case to Title Case', () => {
        expect(humanizeKey('hello-world')).toBe('Hello World');
    });

    test('converts camelCase to Title Case', () => {
        expect(humanizeKey('helloWorld')).toBe('Hello World');
    });

    test('handles mixed formats', () => {
        expect(humanizeKey('hello_World-test')).toBe('Hello World Test');
    });

    test('returns empty string for empty input', () => {
        expect(humanizeKey('')).toBe('');
    });

    test('handles single word', () => {
        expect(humanizeKey('hello')).toBe('Hello');
    });

    test('handles multiple underscores', () => {
        expect(humanizeKey('hello__world')).toBe('Hello World');
    });
});

describe('pct', () => {
    test('formats positive percentage with plus sign', () => {
        expect(pct(0.5)).toBe('+50%');
    });

    test('formats negative percentage without plus sign', () => {
        expect(pct(-0.25)).toBe('-25%');
    });

    test('formats zero percentage', () => {
        // Zero is treated as a small value (< 10%), so gets one decimal
        expect(pct(0)).toBe('0.0%');
    });

    test('shows one decimal for small values', () => {
        expect(pct(0.05)).toBe('+5.0%');
        expect(pct(0.09)).toBe('+9.0%');
    });

    test('shows no decimals for values >= 10%', () => {
        expect(pct(0.10)).toBe('+10%');
        expect(pct(0.99)).toBe('+99%');
    });

    test('shows one decimal for small negative values', () => {
        expect(pct(-0.05)).toBe('-5.0%');
    });

    test('handles NaN gracefully', () => {
        expect(pct(NaN)).toBe('');
    });

    test('handles null gracefully', () => {
        expect(pct(null as any)).toBe('');
    });

    test('handles undefined gracefully', () => {
        expect(pct(undefined as any)).toBe('');
    });

    test('formats 1 (100%) correctly', () => {
        expect(pct(1)).toBe('+100%');
    });

    test('formats values over 100%', () => {
        expect(pct(1.5)).toBe('+150%');
    });
});
