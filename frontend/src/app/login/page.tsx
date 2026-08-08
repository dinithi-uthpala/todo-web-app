"use client";

import API_URL from "@/lib/api";
import { saveToken } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (value: string) => {
    const normalized = value.trim();

    if (!normalized) {
      return "Email is required.";
    }

    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!pattern.test(normalized)) {
      return "Enter a valid email address.";
    }

    return "";
  };

  const validatePassword = (value: string) => {
    if (!value.trim()) {
      return "Password is required.";
    }

    return "";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextEmailError = validateEmail(email);
    const nextPasswordError = validatePassword(password);

    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setSubmitError("");

    if (nextEmailError || nextPasswordError) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { message?: string; token?: string; errors?: Record<string, string[]> }
        | null;

      if (!response.ok) {
        const validationErrors = data?.errors ?? {};
        const emailErrors = validationErrors.email ?? [];
        const passwordErrors = validationErrors.password ?? [];

        setEmailError(emailErrors[0] ?? "");
        setPasswordError(passwordErrors[0] ?? "");
        setSubmitError(
          response.status === 401
            ? "Invalid email or password."
            : data?.message ?? "Unable to sign in. Please try again."
        );
        return;
      }

      const token = data?.token;

      if (!token) {
        setSubmitError("Authentication failed. Please try again.");
        return;
      }

      saveToken(token);
      setSubmitError("");
      router.push("/dashboard");
    } catch {
      setSubmitError("Unable to reach the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="auth-side-panel">
          <div className="mb-8 space-y-4">
            <span className="inline-flex items-center justify-center rounded-full bg-cyan-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700 shadow-sm shadow-cyan-100/70">
              Todo App
            </span>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Sign in and get back to your tasks.
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Secure login with the same task management workflow you already rely on.
              </p>
            </div>
          </div>

          <div className="hero-visual">
            <img
              src="/illustration-auth.svg"
              alt="Illustration of secure login and productivity"
              className="mx-auto h-full w-full object-contain"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="auth-panel">
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                Welcome Back
              </h2>
              <p className="mt-3 text-sm text-slate-600">
                Log in to manage your Todos with clarity and ease.
              </p>
            </div>

            <form className="space-y-5" method="post" onSubmit={handleSubmit} noValidate>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (emailError) {
                      setEmailError(validateEmail(event.target.value));
                    }
                  }}
                  className="input-field"
                  placeholder="name@example.com"
                  autoComplete="email"
                  aria-invalid={emailError ? "true" : "false"}
                  aria-describedby={emailError ? "email-error" : undefined}
                />
                {emailError && (
                  <p id="email-error" className="mt-2 text-sm font-medium text-rose-600">
                    {emailError}
                  </p>
                )}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                    Password
                  </label>
                  <a href="#" className="text-xs font-semibold text-slate-600 transition hover:text-slate-900">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      if (passwordError) {
                        setPasswordError(validatePassword(event.target.value));
                      }
                    }}
                    className="input-field pr-24"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    aria-invalid={passwordError ? "true" : "false"}
                    aria-describedby={passwordError ? "password-error" : undefined}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-1 right-2 rounded-xl px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {passwordError && (
                  <p id="password-error" className="mt-2 text-sm font-medium text-rose-600">
                    {passwordError}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Remember me
                </label>
              </div>

              {submitError && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {submitError}
                </div>
              )}

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? "Signing in..." : "Login"}
              </button>
            </form>
          </div>

          <div className="rounded-4xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600 shadow-sm shadow-slate-200/40">
            New here?{' '}
            <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Create an account
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
