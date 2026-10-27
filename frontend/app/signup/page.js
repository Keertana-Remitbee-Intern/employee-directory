"use client";
import { useState } from "react";
import "../page.css";

export default function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function handleSignup(event) {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setLoading(true);

        try {
            const response = await fetch("http://localhost:3000/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Signup failed.");
            }
            setSuccess("Account created successfully! You can now sign in.");
            setName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
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
                            <h2>Create an account</h2>
                            <p>Join your employee workspace.</p>
                        </div>

                        <form onSubmit={handleSignup} className="login-form">
                            <div className="form-group">
                                <label htmlFor="name">Full name</label>
                                <input
                                    id="name"
                                    type="text"
                                    autoComplete="name"
                                    placeholder="Enter your full name"
                                    value={name}
                                    onChange={(event) =>
                                        setName(event.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email address</label>
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
                                <label htmlFor="password">Password</label>
                                <div className="password-wrapper">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        placeholder="Create a password"
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
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">
                                    Confirm password
                                </label>
                                <input
                                    id="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    placeholder="Re-enter your password"
                                    value={confirmPassword}
                                    onChange={(event) =>
                                        setConfirmPassword(event.target.value)
                                    }
                                    required
                                />
                            </div>

                            {error && (
                                <p className="login-error" role="alert">
                                    {error}
                                </p>
                            )}
                            {success && (
                                <p className="signup-success" role="status">
                                    {success}
                                </p>
                            )}

                            <button
                                type="submit"
                                className="login-button"
                                disabled={loading}
                            >
                                {loading ? "Creating account..." : "Sign up"}
                            </button>
                        </form>

                        <p className="signup-prompt">
                            Already have an account?{" "}
                            <a href="/">Sign in</a>
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}
