"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { ArrowRight, Loader2, Lock, Mail } from "lucide-react";

import { AuthShell } from "@/components/AuthShell";
import { DemoLogins } from "@/components/DemoLogins"; // TEMP: remove before launch

export default function LoginPage() {
  const sp = useSearchParams();
  // Middleware sends users here as ?callbackUrl=…
  const callbackUrl = sp.get("callbackUrl") || sp.get("from") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (!res || res.error) {
        setError("Wrong email or password.");
        return;
      }
      const session = await getSession();
      const role = session?.user?.role;
      const safeCallback = callbackUrl.startsWith("/") ? callbackUrl : "";
      const dest =
        safeCallback ||
        (role === "ADMIN" || role === "MANAGER" || role === "STAFF" ? "/admin" : "/account");
      window.location.href = dest;
    } catch {
      setError("Sign in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell>
      <h1>Sign in</h1>
      <p className="sub">Welcome back sign in to track orders and see your prices.</p>

      <form onSubmit={submit}>
        {error && (
          <div role="alert" className="mb-4 rounded-[10px] border border-danger/30 bg-danger-soft px-3.5 py-2.5 text-[13px] font-medium text-danger">
            {error}
          </div>
        )}

        <div className="h-field">
          <label className="h-field-label" htmlFor="email">Email address</label>
          <div className="h-inp">
            <Mail className="lead" aria-hidden="true" />
            <input
              id="email" name="email" type="email" autoComplete="email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com" required
            />
          </div>
        </div>

        <div className="h-field">
          <div className="h-field-row">
            <label className="h-field-label" htmlFor="password">Password</label>
            <Link href="/forgot-password" className="h-auth-forgot">Forgot password?</Link>
          </div>
          <div className="h-inp">
            <Lock className="lead" aria-hidden="true" />
            <input
              id="password" name="password" type={showPass ? "text" : "password"}
              autoComplete="current-password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password" required
              className="!pr-20"
            />
            <button
              type="button" className="eye" aria-label={showPass ? "Hide password" : "Show password"} aria-pressed={showPass}
              onClick={() => setShowPass((v) => !v)}
            >
              {showPass ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button type="submit" className="h-auth-btn" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {busy ? "Signing in…" : "Sign in"}
          {!busy && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </button>
      </form>

      <div className="h-auth-or">or</div>

      <Link href="/register" className="h-auth-btn-outline">
        Create an account
      </Link>

      <p className="h-auth-alt">
        Garage or trade buyer? <Link href="/trade-account">Apply for a trade account</Link>
      </p>

      {/* TEMP: test accounts — remove before launch */}
      <DemoLogins onPick={(e, p) => { setEmail(e); setPassword(p); setError(null); }} />
    </AuthShell>
  );
}
