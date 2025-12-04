import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/primitives/alert";
import { Button } from "@workspace/ui/primitives/button";
import { LogIn } from "lucide-react";

type RegionDashboardGateProps = {
  isAuthenticated: boolean;
  signInHref?: string;
  children: React.ReactNode;
};

export function RegionDashboardGate({
  isAuthenticated,
  signInHref = "/sign-in",
  children,
}: RegionDashboardGateProps) {
  if (!isAuthenticated) {
    return (
      <div className="mx-auto mt-8 max-w-md">
        <Alert variant="default">
          <LogIn className="h-5 w-5" />
          <AlertTitle>Sign-in required</AlertTitle>
          <AlertDescription>
            You need to sign in to access your region dashboard.
          </AlertDescription>
          <div className="mt-4">
            <Button asChild>
              <a href={signInHref}>Go to Sign-In</a>
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
