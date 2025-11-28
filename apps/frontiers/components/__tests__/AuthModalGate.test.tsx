import { render, screen } from '@/tests/utils/test-utils';
import { AuthModalGate } from '../AuthModalGate';

// Mock the useAuth hook
const mockUseAuth = jest.fn();
jest.mock('@/hooks/useAuth', () => ({
    useAuth: () => mockUseAuth(),
}));

// Mock the auth components
jest.mock('@/components/auth/SignInForm', () => ({
    SignInForm: () => <div data-testid="signin-form">Sign In Form</div>,
}));

jest.mock('@/components/auth/SignUpForm', () => ({
    SignUpForm: () => <div data-testid="signup-form">Sign Up Form</div>,
}));

jest.mock('@/components/auth/ResetPasswordRequestForm', () => ({
    ResetPasswordRequestForm: () => <div data-testid="reset-form">Reset Form</div>,
}));

// Mock next/navigation
const mockPush = jest.fn();
const mockPathname = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
    usePathname: () => mockPathname(),
}));

describe('AuthModalGate', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPathname.mockReturnValue('/');
    });

    test('renders nothing when authenticated', () => {
        mockUseAuth.mockReturnValue({ status: 'authenticated' });
        const { container } = render(<AuthModalGate />);
        // Dialog should not be open
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    test('shows dialog when unauthenticated', () => {
        mockUseAuth.mockReturnValue({ status: 'unauthenticated' });
        render(<AuthModalGate />);
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    test('does not show dialog on auth routes even when unauthenticated', () => {
        mockUseAuth.mockReturnValue({ status: 'unauthenticated' });
        mockPathname.mockReturnValue('/auth/signin');
        const { container } = render(<AuthModalGate />);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    test('defaults to signin mode', () => {
        mockUseAuth.mockReturnValue({ status: 'unauthenticated' });
        render(<AuthModalGate />);
        expect(screen.getByText('Welcome back')).toBeInTheDocument();
    });

    test('shows signup form when clicking sign up button', () => {
        mockUseAuth.mockReturnValue({ status: 'unauthenticated' });
        render(<AuthModalGate />);

        const signUpButton = screen.getByRole('button', { name: /sign up/i });
        signUpButton.click();

        expect(screen.getByText('Create your account')).toBeInTheDocument();
    });

    test('renders loading state appropriately', () => {
        mockUseAuth.mockReturnValue({ status: 'loading' });
        const { container } = render(<AuthModalGate />);
        // Should not show dialog while loading
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
});
