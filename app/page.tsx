import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Check, Upload, Users, Zap, Shield, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { ThemeSwitcher } from "@/components/theme-switcher"

export default async function LandingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-screen flex-col scroll-smooth">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Upload className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold tracking-tight">Submitly</span>
          </Link>
          <nav className="flex items-center gap-3">
            <ThemeSwitcher />
            {user ? (
              <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/sign-up">Get started</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto flex flex-col items-center gap-8 px-4 py-20 text-center sm:px-6 md:py-28 lg:px-8">
        <div
          className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-4 py-1.5 text-sm opacity-0 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
          </span>
          <span className="text-muted-foreground">Now with Google Sign-In</span>
        </div>

        <div className="flex max-w-4xl flex-col gap-6 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <h1 className="text-balance text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            Collect files,{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              effortlessly
            </span>
          </h1>
          <p className="text-pretty text-lg text-muted-foreground sm:text-xl md:text-2xl">
            Create an Inbox, share the link, and start receiving files. Simple, clean, and powerful file collection for
            everyone.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            {user ? (
              <Button size="lg" asChild className="h-12 px-8 text-base">
                <Link href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button size="lg" asChild className="h-12 px-8 text-base">
                <Link href="/auth/sign-up">
                  Start for free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
            <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base bg-transparent">
              <Link href="#pricing">View pricing</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            No credit card required • Free plan available • 2 minute setup
          </p>
        </div>
      </section>

      {/* Social Proof */}
      <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="mb-8 text-center text-sm font-medium text-muted-foreground">TRUSTED BY TEAMS WORLDWIDE</p>
          <div className="grid grid-cols-2 gap-8 opacity-50 grayscale md:grid-cols-4">
            {/* Placeholder for company logos */}
            <div className="flex items-center justify-center">
              <div className="h-8 w-24 rounded bg-muted"></div>
            </div>
            <div className="flex items-center justify-center">
              <div className="h-8 w-24 rounded bg-muted"></div>
            </div>
            <div className="flex items-center justify-center">
              <div className="h-8 w-24 rounded bg-muted"></div>
            </div>
            <div className="flex items-center justify-center">
              <div className="h-8 w-24 rounded bg-muted"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              Everything you need to collect files
            </h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              Powerful features wrapped in a simple, intuitive interface
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card
              className="border-border/50 transition-all hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 duration-300 opacity-0 animate-fade-in-up"
              style={{ animationDelay: "0.1s" }}
            >
              <CardContent className="flex flex-col gap-4 p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <Zap className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold">Lightning fast setup</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Create an Inbox in seconds. No complex forms or configurations needed. Just name it and share.
                </p>
              </CardContent>
            </Card>

            <Card
              className="border-border/50 transition-all hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 duration-300 opacity-0 animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              <CardContent className="flex flex-col gap-4 p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold">Flexible submissions</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Accept files from anyone. They can sign in with Google or just provide their name. Your choice.
                </p>
              </CardContent>
            </Card>

            <Card
              className="border-border/50 transition-all hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 duration-300 opacity-0 animate-fade-in-up"
              style={{ animationDelay: "0.3s" }}
            >
              <CardContent className="flex flex-col gap-4 p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <Upload className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold">Any file type</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Support for all file types. Images, documents, videos, code, and more. No restrictions.
                </p>
              </CardContent>
            </Card>

            <Card
              className="border-border/50 transition-all hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 duration-300 opacity-0 animate-fade-in-up"
              style={{ animationDelay: "0.4s" }}
            >
              <CardContent className="flex flex-col gap-4 p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <Shield className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold">Secure storage</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Your files are stored securely with enterprise-grade encryption. Privacy and security first.
                </p>
              </CardContent>
            </Card>

            <Card
              className="border-border/50 transition-all hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 duration-300 opacity-0 animate-fade-in-up"
              style={{ animationDelay: "0.5s" }}
            >
              <CardContent className="flex flex-col gap-4 p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <Clock className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold">Pause anytime</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Need a break? Pause submissions on any Inbox with one click. Resume whenever you're ready.
                </p>
              </CardContent>
            </Card>

            <Card
              className="border-border/50 transition-all hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 duration-300 opacity-0 animate-fade-in-up"
              style={{ animationDelay: "0.6s" }}
            >
              <CardContent className="flex flex-col gap-4 p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <Check className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold">Simple dashboard</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Manage all your Inboxes and submissions from one clean dashboard. No clutter, just clarity.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">How it works</h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              Three simple steps to start collecting files
            </p>
          </div>

          <div className="grid gap-12 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                1
              </div>
              <h3 className="mb-3 text-xl font-semibold">Create an Inbox</h3>
              <p className="text-muted-foreground">
                Sign up and create your first Inbox in seconds. Give it a name and you're ready to go.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                2
              </div>
              <h3 className="mb-3 text-xl font-semibold">Share the link</h3>
              <p className="text-muted-foreground">
                Copy your unique Inbox link and share it with anyone who needs to submit files.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                3
              </div>
              <h3 className="mb-3 text-xl font-semibold">Receive files</h3>
              <p className="text-muted-foreground">
                Watch submissions roll in. Download, manage, and organize everything from your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">Simple, transparent pricing</h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              Choose the plan that works for you. No hidden fees.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Basic Plan */}
            <Card className="border-border/50 transition-all hover:shadow-lg hover:scale-105 duration-300">
              <CardContent className="flex flex-col gap-8 p-10">
                <div>
                  <h3 className="text-2xl font-semibold">Basic</h3>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-5xl font-bold">Free</span>
                  </div>
                  <p className="mt-3 text-muted-foreground">Perfect for trying out Submitly</p>
                </div>

                <ul className="flex flex-col gap-4">
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <span>Up to 10 Inboxes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <span>200 MB total storage</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <span>All file types supported</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <span>Basic support</span>
                  </li>
                </ul>

                <Button variant="outline" asChild className="mt-auto bg-transparent">
                  <Link href="/auth/sign-up">Get started</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Unlimited Plan */}
            <Card className="relative border-primary bg-primary/5 transition-all hover:shadow-xl hover:scale-105 duration-300">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="inline-block rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground">
                  Most Popular
                </span>
              </div>
              <CardContent className="flex flex-col gap-8 p-10">
                <div>
                  <h3 className="text-2xl font-semibold">Unlimited</h3>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-5xl font-bold">$2</span>
                    <span className="text-xl text-muted-foreground">/year</span>
                  </div>
                  <p className="mt-3 text-muted-foreground">For serious file collection</p>
                </div>

                <ul className="flex flex-col gap-4">
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <span className="font-medium">Unlimited Inboxes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <span className="font-medium">Unlimited submissions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <span className="font-medium">Unlimited storage</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <span className="font-medium">Pause submissions anytime</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <span className="font-medium">Priority support</span>
                  </li>
                </ul>

                <Button asChild className="mt-auto">
                  <Link href="/auth/sign-up">Upgrade now</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-16 text-center">
            <h2 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">Frequently asked questions</h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">Everything you need to know about Submitly</p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left text-lg font-semibold">What is an Inbox?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                An Inbox is your personal file collection point. Create one, share the link, and anyone can submit files
                to it. Think of it as a digital dropbox for any project or purpose.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left text-lg font-semibold">
                Do people need an account to submit files?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                No! People can submit files by simply providing their name, or they can choose to sign in with their
                Google account for a more personalized experience.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left text-lg font-semibold">
                What file types are supported?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                All file types are supported! Images, documents, videos, audio, code files, archives - you name it.
                There are no restrictions on file types.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left text-lg font-semibold">Can I pause submissions?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes! With the Unlimited plan, you can pause and resume submissions for any Inbox at any time. This is
                perfect when you need to temporarily stop accepting files.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left text-lg font-semibold">
                How does the storage limit work?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                The Basic plan includes 200 MB of total storage across all your Inboxes. The Unlimited plan removes all
                storage restrictions, so you can collect as many files as you need.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger className="text-left text-lg font-semibold">
                Can I upgrade or downgrade my plan?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                You can upgrade to Unlimited at any time from your dashboard. If you need to downgrade, you can manage
                your subscription through the billing portal.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Card className="border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="flex flex-col items-center gap-8 p-12 text-center md:p-16">
              <h2 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
                Ready to simplify file collection?
              </h2>
              <p className="max-w-2xl text-pretty text-lg text-muted-foreground">
                Join teams and individuals who are already collecting files with Submitly. Create your first Inbox in
                under 2 minutes.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                {user ? (
                  <Button size="lg" asChild className="h-12 px-8 text-base">
                    <Link href="/dashboard">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button size="lg" asChild className="h-12 px-8 text-base">
                      <Link href="/auth/sign-up">
                        Start for free
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base bg-transparent">
                      <Link href="/auth/login">Sign in</Link>
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Upload className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold">Submitly</span>
            </div>

            <p className="text-sm text-muted-foreground">© 2025 Submitly. All rights reserved.</p>

            <div className="flex gap-6">
              <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Privacy
              </Link>
              <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Terms
              </Link>
              <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
