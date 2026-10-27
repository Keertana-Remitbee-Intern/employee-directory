"use client";
import { useState } from "react";
import "./page.css";

export default function Home() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleLogin(event) {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:3000/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Login failed.");
            }
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            window.location.href = "/dashboard";
        } catch (err) {
            setError(
                err.message === "Failed to fetch"
                    ? "Cannot connect to the server. Please try again."
                    : err.message
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="login-page">
            <section className="login-container">
                <div className="login-brand">
                    <div className="brand-header">
                        <div className="brand-icon">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="25"
                                height="25"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="10" cy="7" r="4" />
                                <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>

                        <div>
                            <h1 className="brand-title">
                                Employee Directory
                            </h1>
                            <p className="brand-subtitle">
                                Mini HR Management System
                            </p>
                        </div>
                    </div>

                    <div className="brand-message">
                        <h2>
                            Simplifying HR
                            <span>management.</span>
                        </h2>
                        <p>
                            A simpler way to manage employees, departments,
                            and leave requests.
                        </p>
                    </div>
                </div>

                <div className="login-form-section">
                    <div className="login-form-container">
                        <div className="form-heading">
                            <h2>Sign In</h2>
                            <p>Sign in to access your workspace.</p>
                        </div>

                        <form onSubmit={handleLogin} className="login-form">
                            <div className="form-group">
                                <label htmlFor="email">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@gmail.com"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">
                                    Password
                                </label>

                                <div className="password-wrapper">
                                    <input
                                        id="password"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(event.target.value)
                                        }
                                        required
                                    />

                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <p className="login-error" role="alert">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                className="login-button"
                                disabled={loading}
                            >
                                {loading ? "Signing in..." : "Sign in"}
                            </button>
                        </form>

                        <p className="signup-prompt">
                            Don't have an account?{" "}
                            <a href="/signup">Sign up</a>
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}