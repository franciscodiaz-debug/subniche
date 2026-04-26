import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-2xl text-foreground">Check your email!</CardTitle>
            <CardDescription>We sent you a confirmation link</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Click the link in your email to confirm your account and start using MarKat.
            </p>
            <Link href="/auth/login" className="text-primary underline underline-offset-4 text-sm">
              Back to login
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
