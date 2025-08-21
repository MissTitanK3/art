"use client"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Terminal, Info, DatabaseZap } from "lucide-react"
import { toast } from "sonner"

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-svh px-4 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">🌎 Region Template</h1>
        <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
          This is a demonstration version of the Region Template platform, designed to show layout, navigation, and component integration.
        </p>
      </div>

      {/* DEMO Environment Warning */}
      <Alert variant="destructive" className="max-w-xl mb-6">
        <DatabaseZap className="h-4 w-4" />
        <AlertTitle>Demo Mode Active</AlertTitle>
        <AlertDescription className="text-center w-full">
          <div className="justify-center flex flex-col m-auto">

            <span>
              This instance is running in
            </span>
            <div className="flex w-full justify-evenly">

              <Info />
              <span>
                <strong>demo-only</strong> mode and is

              </span>
              <Info />
            </div>
            <div className="flex w-full justify-evenly">

              <Info />
              <span>

                <strong>not connected to a live database</strong>.
              </span>
              <Info />
            </div>
            <span>

              Any actions, changes, or submissions will not be saved.
            </span>
          </div>
        </AlertDescription>
      </Alert>

      {/* Platform Overview */}
      <Card className="max-w-xl w-full mb-6">
        <CardHeader>
          <CardTitle>🧱 What Is This Platform?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed">
          <p>
            This Region Template is part of a decentralized platform designed to support regional collaboration, rapid deployment, and secure autonomy. It includes:
          </p>
          <ul className="list-disc list-inside pl-2 space-y-1">
            <li><strong>Region-specific routing</strong> and branding via subdomains</li>
            <li><strong>Authentication-aware dashboards</strong> for different roles</li>
            <li><strong>Supabase (or PocketServer)</strong> integration for storage and permissions</li>
          </ul>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card className="max-w-xl w-full">
        <CardHeader>
          <CardTitle>🛠️ Region Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <ul className="list-disc list-inside">
            <li>Create a new directory: <code>region-[your-name]</code></li>
            <li>Update <code>package.json</code> with the new name</li>
            <li>Register your region’s routing path in the global nav</li>
            <li>Confirm DB connection and .env setup before launch</li>
          </ul>

          <Alert variant="default">
            <Terminal />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>
              Region names must be <strong>globally unique</strong>. Make sure you coordinate with other region admins to avoid duplication.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Test Buttons */}
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button
          onClick={() =>
            toast("Test Toast Triggered", {
              description: "This is a demo toast using Sonner.",
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
  )
}
