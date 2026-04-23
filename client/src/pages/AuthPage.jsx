import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAppContext } from "../hooks/useAppContext";

export function AuthPage() {
  const navigate = useNavigate();
  const { login, register, notify } = useAppContext();
  const [mode, setMode] = useState("signin");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (mode === "signin") {
      await login({ email: form.email, password: form.password });
      notify("Welcome back.");
    } else {
      await register(form);
      notify("Account created.");
    }
    navigate("/account");
  };

  return (
    <section className="page-content auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Authentication</p>
        <h1 className="page-title">{mode === "signin" ? "Sign in" : "Create account"}</h1>
        {mode === "signup" ? (
          <Input label="Full name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
        ) : null}
        <Input label="Email" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required />
        <Input label="Password" type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} required />
        <Button type="submit">{mode === "signin" ? "Sign in" : "Create account"}</Button>
        <button
          type="button"
          className="link-button"
          onClick={() => setMode((current) => (current === "signin" ? "signup" : "signin"))}
        >
          {mode === "signin" ? "Need an account?" : "Already have an account?"}
        </button>
      </form>
    </section>
  );
}
