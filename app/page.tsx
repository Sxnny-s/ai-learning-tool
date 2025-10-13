import Link from "next/link";
import { SignInButton } from "@clerk/nextjs";

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
    <main className="min-h-[calc(100vh-64px)] bg-white">
      {/* If your global <Header/> renders above, this section starts below it */}
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Learn faster with your AI study partner
          </h1>

          <p className="mt-4 text-gray-600">
            Create flashcards from any text, practice with auto-generated quizzes, and
            track progress — all in one place.
          </p>

          <div className="mt-8 flex items-center gap-3">
            {/* Primary CTA: opens Clerk sign-in modal */}
            <SignInButton mode="modal">
              <button className="rounded-xl bg-black px-5 py-3 text-white">
                Sign in
              </button>
            </SignInButton>

            {/* Accessibility / No-JS fallback: direct route to the sign-in page */}
            <Link
              href="/sign-in"
              className="rounded-xl px-5 py-3 text-sm ring-1 ring-gray-300 hover:bg-gray-50"
            >
              Use sign-in page
            </Link>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            Sign-up is invite-only and handled by an admin link.
          </p>
        </div>

        {/* Visual placeholder — replace with product screenshot/illustration later */}
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <div className="aspect-video w-full rounded-xl bg-white shadow-sm" />
          <ul className="mt-6 grid gap-2 text-sm text-gray-700">
            <li>• AI-generated quizzes</li>
            <li>• One-click flashcards</li>
            <li>• Progress & streaks</li>
          </ul>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 pb-10 text-sm text-gray-500">
        © {new Date().getFullYear()} Resilient Coders
      </footer>
    </main>
  );
}
