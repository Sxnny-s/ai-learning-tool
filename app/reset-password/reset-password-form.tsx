'use client';

import React, { useEffect, useState } from 'react';
import { useAuth, useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function getClerkErrorMessage(err: unknown): string {
  // Clerk errors often look like: { errors: [{ longMessage?: string, message?: string }] }
  if (typeof err === 'object' && err !== null && 'errors' in err) {
    const e = (err as { errors?: Array<{ longMessage?: string; message?: string }> }).errors;
    const first = Array.isArray(e) ? e[0] : undefined;
    return first?.longMessage ?? first?.message ?? 'Something went wrong';
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
}

export default function ResetPasswordForm() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [code, setCode] = useState('');
  const [stage, setStage] = useState<'request' | 'verify'>('request');
  const [secondFactor, setSecondFactor] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { isLoaded, signIn, setActive } = useSignIn();

  useEffect(() => {
    if (isSignedIn) router.push('/');
  }, [isSignedIn, router]);

  if (!isLoaded) return null;

  async function onRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Backend rate limit gate
    const rlRes = await fetch('/api/auth/request-password-reset', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!rlRes.ok) {
      const data = (await rlRes.json().catch(() => ({}))) as { error?: string };
      setError(data?.error ?? 'Please try again later.');
      return;
    }

    try {
      await signIn?.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      setStage('verify');
    } catch (err: unknown) {
      setError(getClerkErrorMessage(err));
    }
  }

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Backend rate limit gate
    const rlRes = await fetch('/api/auth/reset-password/verify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword }),
    });

    if (!rlRes.ok) {
      const data = (await rlRes.json().catch(() => ({}))) as { error?: string };
      setError(data?.error ?? 'Please try again later.');
      return;
    }

    try {
      const result = await signIn?.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password: newPassword,
      });

      if (!result) return;

      if (result.status === 'needs_second_factor') {
        setSecondFactor(true);
        return;
      }

      if (result.status === 'complete') {
        await setActive?.({
          session: result.createdSessionId,
          navigate: async () => router.push('/'),
        });
        return;
      }

      setError('Unexpected status. Please try again.');
    } catch (err: unknown) {
      setError(getClerkErrorMessage(err));
    }
  }

  return (
    <div className="mx-auto max-w-md p-6 space-y-4">
      <h1 className="text-xl font-semibold">Forgot your password?</h1>

      {stage === 'request' && (
        <form className="space-y-3" onSubmit={onRequestCode}>
          <label className="block text-sm">Email address</label>
          <input
            className="w-full rounded border p-2"
            type="email"
            placeholder="e.g. john@doe.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className="w-full rounded bg-black p-2 text-white">
            Send password reset code
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      )}

      {stage === 'verify' && (
        <form className="space-y-3" onSubmit={onVerify}>
          <label className="block text-sm">New password</label>
          <input
            className="w-full rounded border p-2"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <label className="block text-sm">Reset code (sent to your email)</label>
          <input
            className="w-full rounded border p-2"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />

          <button className="w-full rounded bg-black p-2 text-white">Reset password</button>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {secondFactor && (
            <p className="text-sm">
              Two-factor is required for this account (this demo UI doesn&apos;t handle 2FA).
            </p>
          )}
        </form>
      )}

      <p className="text-sm">
        Remembered it?{' '}
        <Link href="/sign-in" className="underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
