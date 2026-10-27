"use client";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!token || !savedUser) {
      window.location.replace("/");
      return;
    }

    try {
      setUser(JSON.parse(savedUser));
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.replace("/");
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.replace("/");
  }

  if (!user) {
    return <main className="p-8 text-slate-600">Loading dashboard...</main>;
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6 sm:p-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Employee Directory
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Welcome, {user.name}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Sign out
          </button>
        </header>

        <section className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Signed in as</p>
          <p className="mt-1 font-medium text-slate-900">{user.email}</p>
          <p className="mt-3 text-sm text-slate-500">Role</p>
          <p className="mt-1 font-medium capitalize text-slate-900">
            {user.role}
          </p>

        </section>
      </div>
    </main>
  );
}
