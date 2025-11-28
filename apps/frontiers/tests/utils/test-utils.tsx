import { render as rtlRender, RenderOptions, RenderResult } from '@testing-library/react';
import { ReactElement } from 'react';
import { ThemeProvider } from 'next-themes';

/**
 * Custom render function that wraps components with necessary providers
 */
function render(ui: ReactElement, options?: RenderOptions): RenderResult {
    function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                {children}
            </ThemeProvider>
        );
    }

    return rtlRender(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';

// Override the default render with our custom one
export { render };
