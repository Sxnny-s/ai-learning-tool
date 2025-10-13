import Link from "next/link";
import Image from "next/image";
import { SignInButton } from "@clerk/nextjs";
import {
  IconBolt,
  IconCards,
  IconChartBar,
  IconChecklist,
  IconShieldCheck,
} from "@tabler/icons-react";

/**
 * Public homepage at "/"
 * - Clear headline + short value prop
 * - Primary action: Sign in (modal via Clerk) + a plain link fallback
 * - No sign-up exposed (admin handles invites)
 */

export const metadata = {
  title: "Resilient Coders | Home",
  description: "AI Learning Platform",
};

export default function HomePage() {
  return (
    <main className="bg-white">
      {/* HERO */}
      <section className="mx-auto max-w-7xl px-6 pt-14 pb-10 md:pt-20 md:pb-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          {/* Left: copy + actions */}
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
              Learn faster with your AI study partner
            </h1>
            <p className="mt-5 max-w-xl text-neutral-600">
              Create flashcards from any text, practice with auto-generated quizzes,
              and track progress — all in one place.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {/* Clerk modal sign-in */}
              <SignInButton mode="modal">
                <button className="rounded-full bg-black px-5 py-3 text-white hover:bg-neutral-900">
                  Sign in
                </button>
              </SignInButton>

              {/* Fallback to hosted sign-in page */}
              <Link
                href="/sign-in"
                className="rounded-full border border-neutral-300 bg-white px-5 py-3 text-neutral-800 hover:bg-neutral-50"
              >
                Use sign-in page
              </Link>
            </div>

            <p className="mt-3 text-xs text-neutral-500">
              Sign-up is invite-only and handled by an admin link.
            </p>

            {/* small confidence row */}
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-700">
              <li className="flex items-center gap-2">
                <IconShieldCheck className="h-5 w-5" /> SSO via Clerk
              </li>
              <li className="flex items-center gap-2">
                <IconChartBar className="h-5 w-5" /> Progress tracking
              </li>
              <li className="flex items-center gap-2">
                <IconBolt className="h-5 w-5" /> Fast & reliable
              </li>
            </ul>
          </div>

          {/* Right: logo card */}
          <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5 shadow-sm">
            <div className="relative h-[260px] w-full overflow-hidden rounded-2xl bg-white shadow-inner">
              <Image
                src="/brand/resilient-coders.svg"
                alt="Resilient Coders"
                fill
                priority
                className="object-contain p-2"  // reduce/remove padding if you want even tighter fit
                sizes="(min-width: 768px) 520px, 100vw"
              />
            </div>

            {/* bullets under the card */}
            <ul className="mt-6 grid gap-2 text-sm text-neutral-700">
              <li className="flex items-center gap-2">
                <IconBolt className="h-5 w-5" /> AI-generated quizzes
              </li>
              <li className="flex items-center gap-2">
                <IconCards className="h-5 w-5" /> One-click flashcards
              </li>
              <li className="flex items-center gap-2">
                <IconChartBar className="h-5 w-5" /> Progress & streaks
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* FEATURES (3 concise cards) */}
      <section className="mx-auto max-w-7xl px-6 pb-10">
        <div className="grid gap-6 md:grid-cols-3">
          <Feature
            icon={<IconCards className="h-6 w-6" />}
            title="Turn notes → study sets"
            desc="Paste any text to instantly generate flashcards with smart grouping."
          />
          <Feature
            icon={<IconChecklist className="h-6 w-6" />}
            title="Practice that adapts"
            desc="Spaced repetition and quick quizzes that surface what you need next."
          />
          <Feature
            icon={<IconShieldCheck className="h-6 w-6" />}
            title="Secure by default"
            desc="SSO, protected admin area, and no public sign-ups — invite only."
          />
        </div>
      </section>

      <footer className="mx-auto max-w-7xl px-6 pb-10 text-sm text-neutral-500">
        © {new Date().getFullYear()} Resilient Coders
      </footer>
    </main>
  );
}

/* ——— presentational helpers ——— */

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
      <p className="mt-2 text-sm text-neutral-600">{desc}</p>
    </div>
  );
}

