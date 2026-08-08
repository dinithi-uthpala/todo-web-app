import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <nav className="site-navbar">
        <div className="site-nav-inner">
          <Link href="/" className="site-brand">
            Todo App
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="site-nav-link">
              Login
            </Link>
            <Link href="/register" className="btn-primary">
              Register
            </Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-100 px-4 py-2 text-sm font-semibold text-cyan-700 shadow-sm shadow-cyan-100/70">
              Modern productivity designed for teams and individuals
            </div>

            <div className="space-y-6">
              <h1 className="section-title">
                Organize tasks, stay focused, and get more done.
              </h1>
              <p className="section-subtitle">
                A clean task management dashboard that keeps your Todo flow clear, collaborative, and productive.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link href="/register" className="btn-primary w-full text-center sm:w-auto">
                Get Started
              </Link>
              <Link href="/login" className="btn-secondary w-full text-center sm:w-auto">
                Login
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <div className="feature-card">
                <div className="mb-4 text-3xl">📝</div>
                <h3 className="text-lg font-semibold text-slate-950">Create tasks</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Capture your work with fast task creation and clear structure.
                </p>
              </div>
              <div className="feature-card">
                <div className="mb-4 text-3xl">📊</div>
                <h3 className="text-lg font-semibold text-slate-950">Track progress</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Monitor completed work and keep priorities visible at a glance.
                </p>
              </div>
              <div className="feature-card">
                <div className="mb-4 text-3xl">✨</div>
                <h3 className="text-lg font-semibold text-slate-950">Stay organized</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Use status filters and search to keep your list tidy and efficient.
                </p>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <img
              src="/illustration-hero.svg"
              alt="Illustration of a productivity dashboard and task checklist"
              className="mx-auto h-full w-full object-contain"
            />
          </div>
        </div>
      </section>
    </main>
  );
}