"use client";

import API_URL from "@/lib/api";
import Link from "next/link";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateName = (value: string) => {
    if (!value.trim()) {
      return "Name is required.";
    }

    return "";
  };

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

    if (value.trim().length < 8) {
      return "Password must be at least 8 characters.";
    }

    return "";
  };

  const validateConfirmPassword = (value: string) => {
    if (!value.trim()) {
      return "Confirm password is required.";
    }

    if (value !== password) {
      return "Passwords do not match.";
    }

    return "";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextNameError = validateName(name);
    const nextEmailError = validateEmail(email);
    const nextPasswordError = validatePassword(password);
    const nextConfirmPasswordError = validateConfirmPassword(confirmPassword);

    setNameError(nextNameError);
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setConfirmPasswordError(nextConfirmPasswordError);
    setSubmitError("");
    setSuccessMessage("");

    if (nextNameError || nextEmailError || nextPasswordError || nextConfirmPasswordError) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: confirmPassword,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { message?: string; errors?: Record<string, string[]> }
        | null;

      if (!response.ok) {
        const validationErrors = data?.errors ?? {};
        const emailErrors = validationErrors.email ?? [];
        const passwordErrors = validationErrors.password ?? [];
        const nameErrors = validationErrors.name ?? [];

        setNameError(nameErrors[0] ?? "");
        setEmailError(emailErrors[0] ?? "");
        setPasswordError(passwordErrors[0] ?? "");
        setSubmitError(data?.message ?? "Unable to create account. Please try again.");
        return;
      }

      setSuccessMessage("Account created successfully.");
      setSubmitError("");
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
                Build your productivity routine.
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Register to start organizing your Todos with a friendly and modern task planner.
              </p>
            </div>
          </div>

          <div className="hero-visual">
            <img
              src="/illustration-auth.svg"
              alt="Illustration of account setup and productivity"
              className="mx-auto h-full w-full object-contain"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="auth-panel">
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                Create your account
              </h2>
              <p className="mt-3 text-sm text-slate-600">
                Join and keep your Todo workflow organized with a sleek dashboard.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-semibold text-slate-700">
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    if (nameError) {
                      setNameError(validateName(event.target.value));
                    }
                  }}
                  className="input-field"
                  placeholder="Jane Doe"
                  autoComplete="name"
                  aria-invalid={nameError ? "true" : "false"}
                  aria-describedby={nameError ? "name-error" : undefined}
                />
                {nameError && (
                  <p id="name-error" className="mt-2 text-sm font-medium text-rose-600">
                    {nameError}
                  </p>
                )}
              </div>

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
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>
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
                      if (confirmPassword && confirmPasswordError) {
                        setConfirmPasswordError(validateConfirmPassword(confirmPassword));
                      }
                    }}
                    className="input-field pr-24"
                    placeholder="••••••••"
                    autoComplete="new-password"
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

              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-slate-700">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      if (confirmPasswordError) {
                        setConfirmPasswordError(validateConfirmPassword(event.target.value));
                      }
                    }}
                    className="input-field pr-24"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    aria-invalid={confirmPasswordError ? "true" : "false"}
                    aria-describedby={confirmPasswordError ? "confirm-password-error" : undefined}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-1 right-2 rounded-xl px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    onClick={() => setShowConfirmPassword((current) => !current)}
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {confirmPasswordError && (
                  <p id="confirm-password-error" className="mt-2 text-sm font-medium text-rose-600">
                    {confirmPasswordError}
                  </p>
                )}
              </div>

              {submitError && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {submitError}
                </div>
              )}

              {successMessage && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  {successMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full"
              >
                {isSubmitting ? "Creating account..." : "Create Account"}
              </button>
            </form>
          </div>

          <div className="rounded-4xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600 shadow-sm shadow-slate-200/40">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

