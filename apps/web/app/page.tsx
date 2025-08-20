import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import { TestSonner } from "@workspace/ui/components/client/buttons/TestSonner"
import { Terminal } from "lucide-react"
import { toast } from "sonner"

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hello World</h1>
        {/* <Button size="sm" onClick={() => toast('hi')}>Button</Button> */}
        <TestSonner />
        <Alert variant="default">
          <Terminal />
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            You can add components and dependencies to your app using the cli.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
