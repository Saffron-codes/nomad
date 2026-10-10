import { ArrowLeft, Globe } from "lucide-react";
import { LinkButton } from "../components/ui";

export function StoryPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center px-6 py-10">
      <section className="w-full rounded-2xl border border-white/10 bg-nomad-surface/80 p-8 shadow-2xl backdrop-blur-sm">
        <div className="mb-8">
          <LinkButton to="/" variant="secondary" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Back
          </LinkButton>
          <h1 className="mb-2 text-3xl font-bold text-nomad-text">About Nomad</h1>
          <p className="text-nomad-text-muted">A note from the person who made it</p>
        </div>

        <div className="mb-8 space-y-4 text-nomad-text leading-relaxed">
          <p>
            Hi, I'm Saffron Dionysius, the one behind Nomad. I built it because my own
            days at the computer kept blurring together. I'd sit down to work, look up
            hours later, and realise I hadn't moved, eaten, or taken a single real break.
          </p>
          <p>
            I tried a few timer apps, but most of them wanted an account, a subscription,
            or a whole system to learn. I just wanted something that would quietly keep
            time, tell me when to step away, and tell me when to come back. So I made it
            myself.
          </p>
          <p>
            Nomad is that tool. Set how long you want to work and how long to rest, press
            Start, and get on with your day. It stays out of your way and only speaks up
            when it's time to switch. Whether you're writing, studying, designing, running
            a business, or clearing your inbox, I hope it helps you finish your day with
            some energy left over.
          </p>
          <p>
            If you have an idea, a problem, or just want to say hello, I'd genuinely love
            to hear from you.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="https://sddev.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-nomad-surface-muted px-4 py-2 text-sm font-medium text-nomad-text transition hover:border-nomad-brand hover:bg-nomad-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomad-brand"
          >
            <Globe className="h-4 w-4" aria-hidden="true" />
            <span>Get in touch</span>
          </a>
        </div>
      </section>
    </main>
  );
}
