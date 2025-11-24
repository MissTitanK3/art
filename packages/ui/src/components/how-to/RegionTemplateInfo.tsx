"use client";

import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@workspace/ui/components/card";
import {
    Terminal,
    Info,
    DatabaseZap,
} from "lucide-react";
import { toast } from "sonner";

export function RegionTemplateInfo() {
    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6">
            <Alert variant="destructive" className="w-full">
                <DatabaseZap className="h-4 w-4" />
                <AlertTitle>Demo Mode Active</AlertTitle>
                <AlertDescription className="w-full text-center">
                    <div className="m-auto flex flex-col items-center gap-2">
                        <span>This instance is running in</span>
                        <div className="flex w-full items-center justify-evenly text-sm">
                            <Info className="h-4 w-4" />
                            <span>
                                <strong>demo-only</strong> mode and is
                            </span>
                            <Info className="h-4 w-4" />
                        </div>
                        <div className="flex w-full items-center justify-evenly text-sm">
                            <Info className="h-4 w-4" />
                            <span>
                                <strong>not connected to a live database</strong>.
                            </span>
                            <Info className="h-4 w-4" />
                        </div>
                        <span>Any actions, changes, or submissions will not be saved.</span>
                    </div>
                </AlertDescription>
            </Alert>

            <Card className="w-full">
                <CardHeader>
                    <CardTitle>🧱 What Is This Platform?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed">
                    <p>
                        This Region Template is part of a decentralized platform designed to
                        support regional collaboration, rapid deployment, and secure
                        autonomy. It includes:
                    </p>
                    <ul className="list-inside list-disc space-y-1 pl-2">
                        <li>
                            <strong>Region-specific routing</strong> and branding via
                            subdomains
                        </li>
                        <li>
                            <strong>Authentication-aware dashboards</strong> for different
                            roles
                        </li>
                        <li>
                            <strong>Supabase (or PocketServer)</strong> integration for
                            storage and permissions
                        </li>
                    </ul>
                </CardContent>
            </Card>

            <Card className="w-full">
                <CardHeader>
                    <CardTitle>🛠️ Region Setup Instructions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <ul className="list-inside list-disc space-y-1">
                        <li>
                            Create a new directory: <code>region-[your-name]</code>
                        </li>
                        <li>
                            Update <code>package.json</code> with the new name
                        </li>
                        <li>Register your region’s routing path in the global nav</li>
                        <li>Confirm DB connection and .env setup before launch</li>
                    </ul>

                    <Alert variant="default">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Heads up!</AlertTitle>
                        <AlertDescription>
                            Region names must be <strong>globally unique</strong>. Make sure
                            you coordinate with other region admins to avoid duplication.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>

            <div className="mt-2 flex flex-wrap justify-center gap-4">
                <Button
                    type="button"
                    onClick={() =>
                        toast("You pressed the button!", {
                            description: "Welcome to the tools.",
                            action: {
                                label: "Dismiss",
                                onClick: () => { },
                            },
                        })
                    }
                >
                    Trigger Toast
                </Button>
            </div>
        </div>
    );
}
