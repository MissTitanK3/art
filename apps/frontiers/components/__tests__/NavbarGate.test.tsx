import { render, screen } from '@/tests/utils/test-utils';
import { NavbarGate } from '../NavbarGate';

// Mock usePathname to control the route
const mockUsePathname = jest.fn();
jest.mock('next/navigation', () => ({
    usePathname: () => mockUsePathname(),
}));

// Mock the Navbar component
jest.mock('@/components/navbar', () => ({
    Navbar: () => <div data-testid="navbar">Navbar</div>,
}));

describe('NavbarGate', () => {
    test('renders navbar on non-home routes', () => {
        mockUsePathname.mockReturnValue('/fleet');
        render(<NavbarGate />);
        expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });

    test('hides navbar on home route', () => {
        mockUsePathname.mockReturnValue('/');
        render(<NavbarGate />);
        // Should not render the Navbar component (ThemeProvider may add script tags)
        expect(screen.queryByTestId('navbar')).not.toBeInTheDocument();
    });

    test('renders navbar on /profile route', () => {
        mockUsePathname.mockReturnValue('/profile');
        render(<NavbarGate />);
        expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });

    test('renders navbar on /seasons route', () => {
        mockUsePathname.mockReturnValue('/seasons');
        render(<NavbarGate />);
        expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });
});
