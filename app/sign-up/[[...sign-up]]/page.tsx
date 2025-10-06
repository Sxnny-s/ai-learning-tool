import { SignUp } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="mx-auto max-w-md p-6 space-y-4">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/post-auth"
        appearance={{ elements: { formButtonPrimary: "bg-red-600 hover:bg-red-700" } }}
      />
      <div className="text-sm">
        Already have an account?{" "}
        <a href="/sign-in" className="underline">Sign in</a>
      </div>
    </div>
  );
}
