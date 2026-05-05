import { useState } from "react";

export default function LoginForm({ mode, onLogin }) {
  const isSignup = mode === "signup";
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    rememberSession: true,
  });
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { checked, name, type, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (isSignup && !formData.name.trim()) {
      setError("Enter your name to create an account.");
      return;
    }

    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Enter your email and password to continue.");
      return;
    }

    onLogin();
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      {isSignup ? (
        <label>
          Name
          <input
            autoComplete="name"
            name="name"
            onChange={handleChange}
            placeholder="Pet owner name"
            type="text"
            value={formData.name}
          />
        </label>
      ) : null}

      <label>
        Email
        <input
          autoComplete="email"
          name="email"
          onChange={handleChange}
          placeholder="owner@example.com"
          type="email"
          value={formData.email}
        />
      </label>

      <label>
        Password
        <input
          autoComplete="current-password"
          name="password"
          onChange={handleChange}
          placeholder="Enter your password"
          type="password"
          value={formData.password}
        />
      </label>

      <div className="login-form__options">
        <label className="remember-option">
          <input
            checked={formData.rememberSession}
            name="rememberSession"
            onChange={handleChange}
            type="checkbox"
          />
          Keep me signed in
        </label>
        {!isSignup ? (
          <button className="text-link-button" type="button">
          Forgot password?
          </button>
        ) : null}
      </div>

      {error ? <p className="login-error">{error}</p> : null}

      <button className="primary-button" type="submit">
        {isSignup ? "Create Account" : "Sign In"}
      </button>
    </form>
  );
}
