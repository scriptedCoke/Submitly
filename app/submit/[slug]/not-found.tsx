import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="border-border/50 max-w-md">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Inbox not found</CardTitle>
            <CardDescription>This submission form doesn&apos;t exist or has been deactivated.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/">Go to homepage</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
