import { useCallback, useEffect, useState } from 'react';

export type IntakeTabMode = 'existing' | 'new';

export function useIntakeTabState(inventoryCount: number) {
    const [intakeTab, setIntakeTab] = useState<IntakeTabMode>('new');
    const [manuallySet, setManuallySet] = useState(false);

    useEffect(() => {
        if (!manuallySet) {
            const desired = inventoryCount > 0 ? 'existing' : 'new';
            if (desired !== intakeTab) {
                setIntakeTab(desired);
            }
            return;
        }
    }, [inventoryCount, manuallySet, intakeTab]);

    const handleIntakeTabChange = useCallback((next: IntakeTabMode) => {
        setManuallySet(true);
        setIntakeTab(next);
    }, []);

    const resetIntakeTabAutomation = useCallback(() => {
        setManuallySet(false);
    }, []);

    return {
        intakeTab,
        handleIntakeTabChange,
        manuallySet,
        resetIntakeTabAutomation,
    } as const;
}
