import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

export default function Page() {
  return (
    <div className="mx-auto max-w-md p-6 space-y-4">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/post-auth"
        appearance={{ elements: { formButtonPrimary: "bg-red-600 hover:bg-red-700" } }}
      />
      <div className="text-sm">
        <Link href="/reset-password" className="underline">
          Forgot your password? Use the reset page
        </Link>
      </div>
    </div>
  );
}
