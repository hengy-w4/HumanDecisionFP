import { useState } from "react";
import { mockProfile } from "../../data/mockProfile.js";
import LoginForm from "./LoginForm.jsx";
import "./loginPage.css";

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState("signin");
  const isSignup = mode === "signup";

  return (
    <main className="login-page">
      <div className="login-shell">
        <header className="login-header">
          <p className="eyebrow">PetTriage Portal</p>
          <h1>{isSignup ? "Create your pet care account" : "Welcome back"}</h1>
          <p>
            {isSignup
              ? `Set up access to save ${mockProfile.petName}'s profile, symptom checks, and care notes.`
              : `Sign in to review ${mockProfile.petName}'s profile, continue symptom checks, and keep triage notes in one place.`}
          </p>
        </header>

        <section className="login-panel" aria-labelledby="login-title">
          <div className="login-panel__heading">
            <p className="eyebrow">Secure Access</p>
            <h2 id="login-title">{isSignup ? "Sign up" : "Sign in"}</h2>
          </div>
          <LoginForm mode={mode} onLogin={onLogin} />
          <div className="auth-switch">
            <span>
              {isSignup ? "Already have an account?" : "Need an account?"}
            </span>
            <button
              className="text-link-button"
              type="button"
              onClick={() => setMode(isSignup ? "signin" : "signup")}
            >
              {isSignup ? "Sign in" : "Sign up"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
