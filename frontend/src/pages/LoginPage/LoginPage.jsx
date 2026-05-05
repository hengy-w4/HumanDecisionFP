import { useState } from "react";
import { mockProfile } from "../../data/mockProfile.js";
import LoginForm from "./LoginForm.jsx";
import "./loginPage.css";

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState("signin");
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");
  const isSignup = mode === "signup";
  const isReset = mode === "reset";

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setResetEmail("");
    setResetMessage("");
    setResetError("");
  };

  const handleResetSubmit = (event) => {
    event.preventDefault();

    if (!resetEmail.trim()) {
      setResetError("Enter the email connected to your account.");
      setResetMessage("");
      return;
    }

    setResetError("");
    setResetMessage("Password reset instructions sent for this session.");
  };

  return (
    <main className="login-page">
      <div className="login-shell">
        <header className="login-header">
          <p className="eyebrow">PetTriage Portal</p>
          <h1>
            {isReset
              ? "Reset your password"
              : isSignup
                ? "Create your pet care account"
                : "Welcome back"}
          </h1>
          <p>
            {isReset
              ? "Enter your email and we will send password reset instructions."
              : isSignup
              ? `Set up access to save ${mockProfile.petName}'s profile, symptom checks, and care notes.`
              : `Sign in to review your pets' profile, continue symptom checks, and keep triage notes in one place.`}
          </p>
        </header>

        <section className="login-panel" aria-labelledby="login-title">
          <div className="login-panel__heading">
            <p className="eyebrow">Secure Access</p>
            <h2 id="login-title">
              {isReset ? "Password reset" : isSignup ? "Sign up" : "Sign in"}
            </h2>
          </div>
          {isReset ? (
            <form className="login-form" onSubmit={handleResetSubmit}>
              <label>
                Email
                <input
                  autoComplete="email"
                  name="resetEmail"
                  onChange={(event) => {
                    setResetEmail(event.target.value);
                    setResetError("");
                    setResetMessage("");
                  }}
                  placeholder="owner@example.com"
                  type="email"
                  value={resetEmail}
                />
              </label>

              {resetError ? <p className="login-error">{resetError}</p> : null}
              {resetMessage ? (
                <p className="login-success">{resetMessage}</p>
              ) : null}

              <button className="primary-button" type="submit">
                Send Reset Link
              </button>
            </form>
          ) : (
            <LoginForm
              mode={mode}
              onForgotPassword={() => handleModeChange("reset")}
              onLogin={onLogin}
            />
          )}
          <div className="auth-switch">
            {isReset ? (
              <button
                className="text-link-button"
                type="button"
                onClick={() => handleModeChange("signin")}
              >
                Back to sign in
              </button>
            ) : (
              <>
                <span>
                  {isSignup ? "Already have an account?" : "Need an account?"}
                </span>
                <button
                  className="text-link-button"
                  type="button"
                  onClick={() => handleModeChange(isSignup ? "signin" : "signup")}
                >
                  {isSignup ? "Sign in" : "Sign up"}
                </button>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
