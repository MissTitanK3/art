import { computeCrewFit, AutoStrategy } from '../crewScore';
import type { CrewCatalog } from '@/schemas/crew';

describe('computeCrewFit', () => {
    const baseCrew: CrewCatalog = {
        id: 'test-1',
        name: 'Test Crew',
        tier: 1,
        bonuses: {},
        allowed_positions: [],
    };

    describe('balanced strategy', () => {
        test('calculates basic score from bonuses', () => {
            const crew: CrewCatalog = {
                ...baseCrew,
                bonuses: {
                    repair_speed: 0.2,
                    signal_strength: 0.15,
                },
            };
            const result = computeCrewFit(crew, 'balanced');
            expect(result.score).toBeCloseTo(0.35);
            expect(result.lines).toHaveLength(2);
        });

        test('ignores non-numeric bonuses', () => {
            const crew: CrewCatalog = {
                ...baseCrew,
                bonuses: {
                    repair_speed: 0.2,
                    invalid: 'not a number' as any,
                },
            };
            const result = computeCrewFit(crew, 'balanced');
            expect(result.score).toBeCloseTo(0.2);
        });
    });

    describe('max-repair strategy', () => {
        test('applies 1.5x weight to repair bonuses', () => {
            const crew: CrewCatalog = {
                ...baseCrew,
                bonuses: {
                    repair_speed: 0.2,
                    signal_strength: 0.1,
                },
            };
            const result = computeCrewFit(crew, 'max-repair');
            // repair_speed: 0.2 * 1.5 = 0.3, signal_strength: 0.1
            expect(result.score).toBeCloseTo(0.4);
            expect(result.lines.some(l => l.includes('×1.5'))).toBe(true);
        });

        test('applies weight to integrity bonuses', () => {
            const crew: CrewCatalog = {
                ...baseCrew,
                bonuses: {
                    hull_integrity: 0.15,
                },
            };
            const result = computeCrewFit(crew, 'max-repair');
            expect(result.score).toBeCloseTo(0.225); // 0.15 * 1.5
        });
    });

    describe('max-signal strategy', () => {
        test('applies 1.5x weight to signal bonuses', () => {
            const crew: CrewCatalog = {
                ...baseCrew,
                bonuses: {
                    signal_strength: 0.3,
                    repair_speed: 0.1,
                },
            };
            const result = computeCrewFit(crew, 'max-signal');
            expect(result.score).toBeCloseTo(0.55); // 0.3 * 1.5 + 0.1
        });
    });

    describe('max-morale strategy', () => {
        test('applies 1.5x weight to morale bonuses', () => {
            const crew: CrewCatalog = {
                ...baseCrew,
                bonuses: {
                    morale_boost: 0.2,
                    repair_speed: 0.1,
                },
            };
            const result = computeCrewFit(crew, 'max-morale');
            expect(result.score).toBeCloseTo(0.4); // 0.2 * 1.5 + 0.1
        });

        test('applies weight to fatigue bonuses', () => {
            const crew: CrewCatalog = {
                ...baseCrew,
                bonuses: {
                    fatigue_resistance: 0.25,
                },
            };
            const result = computeCrewFit(crew, 'max-morale');
            expect(result.score).toBeCloseTo(0.375); // 0.25 * 1.5
        });
    });

    describe('uncovered needs bonus', () => {
        test('adds bonus when crew covers uncovered position', () => {
            const crew: CrewCatalog = {
                ...baseCrew,
                bonuses: { repair_speed: 0.1 },
                allowed_positions: ['engineer', 'pilot'],
            };
            const uncovered = new Set(['engineer']);
            const result = computeCrewFit(crew, 'balanced', uncovered);
            expect(result.score).toBeCloseTo(0.15); // 0.1 + 0.05
            expect(result.lines.some(l => l.includes('Covers need'))).toBe(true);
        });

        test('does not add bonus when crew does not cover uncovered position', () => {
            const crew: CrewCatalog = {
                ...baseCrew,
                bonuses: { repair_speed: 0.1 },
                allowed_positions: ['medic'],
            };
            const uncovered = new Set(['engineer']);
            const result = computeCrewFit(crew, 'balanced', uncovered);
            expect(result.score).toBeCloseTo(0.1);
        });
    });

    describe('upkeep penalty', () => {
        test('applies penalty for upkeep cost', () => {
            const crew: CrewCatalog = {
                ...baseCrew,
                bonuses: { repair_speed: 0.2 },
                upkeep: 5,
            } as any;
            const result = computeCrewFit(crew, 'balanced');
            // penalty: min(0.05, 5 * 0.005) = 0.025
            expect(result.score).toBeCloseTo(0.175); // 0.2 - 0.025
            expect(result.lines.some(l => l.includes('Upkeep penalty'))).toBe(true);
        });

        test('caps upkeep penalty at 0.05', () => {
            const crew: CrewCatalog = {
                ...baseCrew,
                bonuses: { repair_speed: 0.2 },
                upkeep: 20,
            } as any;
            const result = computeCrewFit(crew, 'balanced');
            expect(result.score).toBeCloseTo(0.15); // 0.2 - 0.05
        });
    });

    describe('disadvantages penalty', () => {
        test('applies penalty when crew has disadvantages', () => {
            const crew: CrewCatalog = {
                ...baseCrew,
                bonuses: { repair_speed: 0.2 },
                disadvantages: { slow_learner: true },
            } as any;
            const result = computeCrewFit(crew, 'balanced');
            expect(result.score).toBeCloseTo(0.18); // 0.2 - 0.02
            expect(result.lines.some(l => l.includes('Disadvantages penalty'))).toBe(true);
        });

        test('does not apply penalty when disadvantages are empty', () => {
            const crew: CrewCatalog = {
                ...baseCrew,
                bonuses: { repair_speed: 0.2 },
                disadvantages: {},
            } as any;
            const result = computeCrewFit(crew, 'balanced');
            expect(result.score).toBeCloseTo(0.2);
        });
    });

    test('ensures score never goes below zero', () => {
        const crew: CrewCatalog = {
            ...baseCrew,
            bonuses: {},
            upkeep: 20,
            disadvantages: { multiple: true },
        } as any;
        const result = computeCrewFit(crew, 'balanced');
        expect(result.score).toBe(0);
    });
});
