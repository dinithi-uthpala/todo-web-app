"use client";

import API_URL from "@/lib/api";
import { getToken, removeToken } from "@/lib/auth";
import { TodoApiResponse, Todo } from "@/types/todo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

type TodoStatus = "all" | "completed" | "pending";

type TodoItem = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [filter, setFilter] = useState<TodoStatus>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [titleError, setTitleError] = useState("");
  const [modalError, setModalError] = useState("");
  const [isLoadingTodos, setIsLoadingTodos] = useState(false);
  const [isCreatingTodo, setIsCreatingTodo] = useState(false);
  const [isUpdatingTodo, setIsUpdatingTodo] = useState(false);
  const [deletingTodoId, setDeletingTodoId] = useState<number | null>(null);
  const [statusUpdatingTodoId, setStatusUpdatingTodoId] = useState<number | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    const controller = new AbortController();

    const requestCurrentUser = async () => {
      try {
        const response = await fetch(`${API_URL}/api/user`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          if (response.status === 401) {
            removeToken();
            router.replace("/login");
            return;
          }

          setUserName("User");
          return;
        }

        const payload = (await response.json().catch(() => null)) as
          | { user?: { name?: string; email?: string } }
          | null;

        const nextUserName = payload?.user?.name?.trim();
        setUserName(nextUserName || "User");
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setUserName("User");
      }
    };

    const requestTodos = async () => {
      setIsLoadingTodos(true);
      setLoadError("");

      try {
        const response = await fetch(`${API_URL}/api/todos`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          if (response.status === 401) {
            removeToken();
            router.replace("/login");
            return;
          }

          setLoadError("Unable to load your tasks. Please try again.");
          return;
        }

        const payload = (await response.json().catch(() => null)) as TodoApiResponse | null;
        const apiTodos = payload?.data ?? [];

        const mappedTodos: TodoItem[] = apiTodos.map((todo: Todo) => ({
          id: todo.id,
          title: todo.title,
          description: todo.description ?? "",
          completed: Boolean(todo.completed),
          createdAt: todo.created_at,
          updatedAt: todo.updated_at,
        }));

        setTodos(mappedTodos);
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setLoadError("Unable to reach the server. Please try again.");
      } finally {
        setIsLoadingTodos(false);
      }
    };

    requestCurrentUser();
    requestTodos();

    return () => {
      controller.abort();
    };
  }, [router]);

  const completedCount = todos.filter((todo) => todo.completed).length;
  const pendingCount = todos.length - completedCount;

  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      const matchesStatus =
        filter === "all" ||
        (filter === "completed" && todo.completed) ||
        (filter === "pending" && !todo.completed);

      const search = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !search ||
        todo.title.toLowerCase().includes(search) ||
        todo.description.toLowerCase().includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [filter, searchTerm, todos]);

  const openCreateModal = () => {
    setEditingTodoId(null);
    setTitle("");
    setDescription("");
    setTitleError("");
    setModalError("");
    setModalOpen(true);
  };

  const openEditModal = (todo: TodoItem) => {
    setEditingTodoId(todo.id);
    setTitle(todo.title);
    setDescription(todo.description);
    setTitleError("");
    setModalError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingTodoId(null);
    setTitle("");
    setDescription("");
    setTitleError("");
    setModalError("");
  };

  const submitTodo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedTitle = title.trim();

    if (!normalizedTitle) {
      setTitleError("Todo title is required.");
      return;
    }

    const now = new Date().toISOString();

    if (editingTodoId !== null) {
      const token = getToken();

      if (!token) {
        removeToken();
        router.replace("/login");
        return;
      }

      setModalError("");
      setIsUpdatingTodo(true);

      try {
        const response = await fetch(`${API_URL}/api/todos/${editingTodoId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: normalizedTitle,
            description,
          }),
        });

        const payload = (await response.json().catch(() => null)) as
          | { message?: string; data?: Todo; errors?: Record<string, string[]> }
          | null;

        if (!response.ok) {
          if (response.status === 401) {
            removeToken();
            router.replace("/login");
            return;
          }

          const validationErrors = payload?.errors ?? {};
          const titleErrors = validationErrors.title ?? [];

          setTitleError(titleErrors[0] ?? "");
          setModalError(payload?.message ?? "Unable to update todo. Please try again.");
          return;
        }

        const updatedTodo = payload?.data;

        if (!updatedTodo) {
          setModalError("Unable to update todo. Please try again.");
          return;
        }

        const nextTodo: TodoItem = {
          id: updatedTodo.id,
          title: updatedTodo.title,
          description: updatedTodo.description ?? "",
          completed: Boolean(updatedTodo.completed),
          createdAt: updatedTodo.created_at,
          updatedAt: updatedTodo.updated_at,
        };

        setTodos((currentTodos) =>
          currentTodos.map((todo) => (todo.id === nextTodo.id ? nextTodo : todo)),
        );

        closeModal();
      } catch {
        setModalError("Unable to reach the server. Please try again.");
      } finally {
        setIsUpdatingTodo(false);
      }

      return;
    }

    const token = getToken();

    if (!token) {
      removeToken();
      router.replace("/login");
      return;
    }

    setModalError("");
    setIsCreatingTodo(true);

    try {
      const response = await fetch(`${API_URL}/api/todos`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: normalizedTitle,
          description,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string; data?: Todo; errors?: Record<string, string[]> }
        | null;

      if (!response.ok) {
        if (response.status === 401) {
          removeToken();
          router.replace("/login");
          return;
        }

        const validationErrors = payload?.errors ?? {};
        const titleErrors = validationErrors.title ?? [];

        setTitleError(titleErrors[0] ?? "");
        setModalError(payload?.message ?? "Unable to create todo. Please try again.");
        return;
      }

      const createdTodo = payload?.data;

      if (!createdTodo) {
        setModalError("Unable to create todo. Please try again.");
        return;
      }

      const nextTodo: TodoItem = {
        id: createdTodo.id,
        title: createdTodo.title,
        description: createdTodo.description ?? "",
        completed: Boolean(createdTodo.completed),
        createdAt: createdTodo.created_at,
        updatedAt: createdTodo.updated_at,
      };

      setTodos((currentTodos) => [nextTodo, ...currentTodos]);
      closeModal();
    } catch {
      setModalError("Unable to reach the server. Please try again.");
    } finally {
      setIsCreatingTodo(false);
    }
  };

  const toggleTodoStatus = async (todo: TodoItem) => {
    const token = getToken();

    if (!token) {
      removeToken();
      router.replace("/login");
      return;
    }

    const endpoint = todo.completed
      ? `${API_URL}/api/todos/${todo.id}/pending`
      : `${API_URL}/api/todos/${todo.id}/complete`;

    setStatusUpdatingTodoId(todo.id);
    setLoadError("");

    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string; data?: Todo; errors?: Record<string, string[]> }
        | null;

      if (!response.ok) {
        if (response.status === 401) {
          removeToken();
          router.replace("/login");
          return;
        }

        setLoadError(payload?.message ?? "Unable to update task status. Please try again.");
        return;
      }

      const updatedTodo = payload?.data;

      if (!updatedTodo) {
        setLoadError("Unable to update task status. Please try again.");
        return;
      }

      const nextTodo: TodoItem = {
        id: updatedTodo.id,
        title: updatedTodo.title,
        description: updatedTodo.description ?? "",
        completed: Boolean(updatedTodo.completed),
        createdAt: updatedTodo.created_at,
        updatedAt: updatedTodo.updated_at,
      };

      setTodos((currentTodos) =>
        currentTodos.map((currentTodo) => (currentTodo.id === nextTodo.id ? nextTodo : currentTodo)),
      );
    } catch {
      setLoadError("Unable to reach the server. Please try again.");
    } finally {
      setStatusUpdatingTodoId(null);
    }
  };

  const deleteTodo = async (todoId: number) => {
    const token = getToken();

    if (!token) {
      removeToken();
      router.replace("/login");
      return;
    }

    if (!window.confirm("Delete this todo?")) {
      return;
    }

    setDeletingTodoId(todoId);
    setLoadError("");

    try {
      const response = await fetch(`${API_URL}/api/todos/${todoId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          removeToken();
          router.replace("/login");
          return;
        }

        const payload = (await response.json().catch(() => null)) as
          | { message?: string; data?: Todo; errors?: Record<string, string[]> }
          | null;

        setLoadError(payload?.message ?? "Unable to delete task. Please try again.");
        return;
      }

      setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== todoId));
    } catch {
      setLoadError("Unable to reach the server. Please try again.");
    } finally {
      setDeletingTodoId(null);
    }
  };

  const handleLogout = async () => {
    const token = getToken();

    if (!token) {
      removeToken();
      router.replace("/login");
      return;
    }

    setIsLoggingOut(true);

    try {
      const response = await fetch(`${API_URL}/api/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok && response.status !== 401) {
        removeToken();
        router.replace("/login");
        return;
      }

      if (response.status === 401) {
        removeToken();
        router.replace("/login");
        return;
      }

      removeToken();
      router.replace("/login");
    } catch {
      removeToken();
      router.replace("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="site-navbar">
        <div className="site-nav-inner">
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/dashboard" className="site-brand">
              Todo App
            </Link>
            <Link href="/" className="btn-accent whitespace-nowrap">
              Home
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-4 py-2 sm:flex">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-500"></span>
              <span className="text-sm font-semibold text-slate-700">
                {userName || "User"}
              </span>
            </div>
            <button
              type="button"
              disabled={isLoggingOut}
              onClick={handleLogout}
              className="btn-secondary"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="panel mb-8 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-100 px-4 py-2 text-sm font-semibold text-cyan-700">
              Productive task management with a polished interface
            </div>
            <h1 className="section-title">
              My Tasks
            </h1>
            <p className="section-subtitle">
              Manage your tasks, stay organized, and keep track of your progress.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-4">
            <button
              type="button"
              onClick={openCreateModal}
              className="btn-primary inline-flex items-center gap-3 px-6 py-3"
            >
              <span className="text-lg">+</span>
              Add Todo
            </button>
          </div>
        </section>

        <section className="stats-grid mb-7">
          <article className="stats-card">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Total Tasks
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
                All
              </span>
            </div>
            <div className="mt-6 flex items-end justify-between gap-4">
              <span className="text-5xl font-bold tracking-tight text-slate-950">
                {todos.length}
              </span>
              <span className="text-3xl text-slate-400">◌</span>
            </div>
          </article>

          <article className="stats-card border-emerald-200 bg-emerald-50/70">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
                  Completed
                </p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Done
              </span>
            </div>
            <div className="mt-6 flex items-end justify-between gap-4">
              <span className="text-5xl font-bold tracking-tight text-emerald-700">
                {completedCount}
              </span>
              <span className="text-3xl text-emerald-600">✓</span>
            </div>
          </article>

          <article className="stats-card border-amber-200 bg-amber-50/70">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700">
                  Pending
                </p>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                Active
              </span>
            </div>
            <div className="mt-6 flex items-end justify-between gap-4">
              <span className="text-5xl font-bold tracking-tight text-amber-700">
                {pendingCount}
              </span>
              <span className="text-3xl text-amber-600">○</span>
            </div>
          </article>
        </section>

        <section className="panel">
          <div className="mb-5 flex flex-col gap-4 rounded-3xl border border-slate-100 bg-slate-50 p-4 md:flex-row md:items-end md:justify-between">
            <div className="w-full md:max-w-md">
              <label htmlFor="search" className="mb-2 block text-sm font-semibold text-slate-700">
                Search tasks
              </label>
              <input
                id="search"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by title or description"
                className="input-field"
              />
            </div>

            <div className="w-full md:max-w-xs">
              <label htmlFor="status" className="mb-2 block text-sm font-semibold text-slate-700">
                Filter status
              </label>
              <select
                id="status"
                value={filter}
                onChange={(event) => setFilter(event.target.value as TodoStatus)}
                className="input-field"
              >
                <option value="all">All tasks</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {isLoadingTodos && (
            <div className="mb-4 rounded-3xl border border-sky-200 bg-sky-50 p-6">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-sky-600 border-t-transparent"></span>
                <span className="text-sm font-black text-sky-700">Loading your tasks...</span>
              </div>
              <div className="mt-4 grid gap-3">
                <div className="h-20 animate-pulse rounded-2xl bg-slate-100"></div>
                <div className="h-20 animate-pulse rounded-2xl bg-slate-100"></div>
              </div>
            </div>
          )}

          {!isLoadingTodos && loadError && (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm font-black text-rose-700">
              {loadError}
            </div>
          )}

          {filteredTodos.length === 0 ? (
            <div className="empty-state-card">
              <span className="icon-shell">☐</span>
              <h3 className="mt-5 text-xl font-black text-slate-900">
                No matching tasks
              </h3>
              <p className="mt-2 max-w-md text-sm font-medium text-slate-500">
                There are no tasks that match your current search or filter.
              </p>
              <button
                type="button"
                onClick={openCreateModal}
                className="btn-primary mt-5"
              >
                Add Todo
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredTodos.map((todo) => (
                <article
                  key={todo.id}
                  className={`rounded-[1.8rem] border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                    todo.completed
                      ? "border-emerald-200 bg-emerald-50/50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => toggleTodoStatus(todo)}
                        disabled={statusUpdatingTodoId === todo.id}
                        title={todo.completed ? "Mark as pending" : "Mark as completed"}
                        aria-label={todo.completed ? "Mark as pending" : "Mark as completed"}
                        className={`mt-1 inline-flex items-center gap-3 rounded-full border px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                          todo.completed
                            ? "border-emerald-600 bg-white text-emerald-700 shadow-sm hover:bg-emerald-50"
                            : "border-slate-300 bg-white text-slate-900 hover:border-slate-900 hover:bg-slate-100"
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        <span className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                          todo.completed
                            ? "border-emerald-700 bg-emerald-700 text-white"
                            : "border-slate-300 bg-white text-slate-900"
                        }`}
                        >
                          {statusUpdatingTodoId === todo.id ? "..." : todo.completed ? "✓" : ""}
                        </span>
                        <span className="whitespace-nowrap">
                          {todo.completed ? "Completed" : "Mark complete"}
                        </span>
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className={`text-lg font-black ${todo.completed ? "text-slate-500 line-through" : "text-slate-950"}`}>{todo.title}</h2>
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-black ${
                              todo.completed
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {todo.completed ? "Completed" : "Pending"}
                          </span>
                        </div>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {todo.description || "No description provided."}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] font-black uppercase tracking-[0.15em] text-slate-500">
                          <span>Created {new Date(todo.createdAt).toLocaleDateString()}</span>
                          <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                          <span>Updated {new Date(todo.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(todo)}
                        disabled={isCreatingTodo || isUpdatingTodo}
                        className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteTodo(todo.id)}
                        disabled={deletingTodoId === todo.id || statusUpdatingTodoId === todo.id}
                        className="rounded-xl border border-rose-200 px-4 py-2 text-xs font-black text-rose-700 transition hover:bg-rose-700 hover:text-white hover:border-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingTodoId === todo.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center overflow-y-auto bg-slate-950/55 px-4 py-6">
          <div className="relative w-full max-w-xl rounded-4xl border border-white/50 bg-white p-6 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-slate-900"></span>
                  <span className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">
                    {editingTodoId !== null ? "Edit task" : "Create task"}
                  </span>
                </div>
                <h2 className="text-2xl font-black tracking-tight text-slate-950">
                  {editingTodoId !== null ? "Edit Todo" : "Add Todo"}
                </h2>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  {editingTodoId !== null ? "Update your task details" : "Create a new task"}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-slate-300 px-3 py-1 text-lg font-black text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <form onSubmit={submitTodo} className="space-y-5">
              <div>
                <label htmlFor="todo-title" className="mb-2 block text-sm font-black text-slate-700">
                  Todo title
                </label>
                <input
                  id="todo-title"
                  type="text"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    if (titleError) {
                      setTitleError("");
                    }
                  }}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-200"
                  placeholder="e.g. Prepare weekly report"
                />
                {titleError && (
                  <p className="mt-2 text-sm font-black text-red-600">{titleError}</p>
                )}
              </div>

              <div>
                <label htmlFor="todo-description" className="mb-2 block text-sm font-black text-slate-700">
                  Description
                </label>
                <textarea
                  id="todo-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={5}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-200"
                  placeholder="Add helpful details..."
                />
              </div>

              {modalError && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-black text-rose-700">
                  {modalError}
                </div>
              )}

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingTodo || isUpdatingTodo}
                  className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300 disabled:cursor-not-allowed disabled:bg-slate-500"
                >
                  {isCreatingTodo
                    ? "Adding..."
                    : isUpdatingTodo
                      ? "Updating..."
                      : editingTodoId !== null
                        ? "Save Changes"
                        : "Add Todo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
