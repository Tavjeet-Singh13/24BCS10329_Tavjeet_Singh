
import { useState } from "react";
import {
  Ticket,
  Building2,
  User,
  Lock,
  ArrowRight,
  LoaderCircle,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import "./OwnerAuth.css";

const API_URL = `http://${window.location.hostname}:8080/api`;

export default function OwnerAuth() {
  const [mode, setMode] = useState("login");
  const [organizationName, setOrganizationName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);

  const getCsrfToken = async () => {
    const response = await fetch(`${API_URL}/auth/csrf`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Could not initialize secure connection.");
    }

    const data = await response.json();
    return data.token;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const csrfToken = await getCsrfToken();

      const endpoint =
        mode === "register" ? "/auth/register" : "/auth/login";

      const body =
        mode === "register"
          ? { organizationName, username, password }
          : { username, password };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.message ||
            "Something went wrong. Please try again."
        );
      }

      if (mode === "register") {
        setMessage("Organization registered successfully. Please log in.");
        setMode("login");
        setOrganizationName("");
        setPassword("");
        } else if (data.role === "OWNER") {
        window.location.replace("/owner/dashboard");
        } else if (data.role === "QUEUE_ADMIN") {
        window.location.replace("/staff");
        } else {
        throw new Error("Unknown account type.");
        }
    } catch (err) {
      setError(err.message || "Unable to connect to SmartQueue.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const csrfToken = await getCsrfToken();

      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "X-XSRF-TOKEN": csrfToken,
        },
      });
    } finally {
      setLoggedInUser(null);
      setPassword("");
      setMessage("You have been logged out.");
    }
  };

  if (loggedInUser) {
    return (
      <main className="owner-page">
        <nav className="owner-navbar">
          <a href="/" className="owner-brand">
            <span className="owner-brand-icon"><Ticket size={21} /></span>
            Smart<span>Queue</span>
          </a>
          <a href="/" className="owner-back">Customer page</a>
        </nav>

        <section className="owner-auth-card owner-success-card">
          <div className="owner-success-icon">
            <CheckCircle2 size={34} />
          </div>
          <span className="owner-eyebrow">AUTHENTICATION SUCCESSFUL</span>
          <h1>Welcome back!</h1>
          <p>You are signed in to your SmartQueue owner account.</p>

          <div className="owner-account-details">
            <div>
              <span>Username</span>
              <strong>{loggedInUser.username}</strong>
            </div>
            <div>
              <span>Account type</span>
              <strong>{loggedInUser.role}</strong>
            </div>
            <div>
              <span>Organization ID</span>
              <strong>{loggedInUser.organizationId}</strong>
            </div>
          </div>

          <p className="owner-next-message">
            Your account is ready. We'll connect your queue management
            dashboard in the next step.
          </p>

          <button className="owner-submit-button" onClick={handleLogout}>
            Log out <ArrowRight size={18} />
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="owner-page">
      <nav className="owner-navbar">
        <a href="/" className="owner-brand">
          <span className="owner-brand-icon"><Ticket size={21} /></span>
          Smart<span>Queue</span>
        </a>
        <a href="/" className="owner-back">Customer page</a>
      </nav>

      <section className="owner-layout">
        <div className="owner-intro">
          <span className="owner-eyebrow">
            <span className="owner-live-dot" />
            SMARTQUEUE MANAGEMENT
          </span>
          <h1>
            Manage your queues.
            <br />
            <span>Not the waiting.</span>
          </h1>
          <p>
            Create and manage your organization's queues from one secure
            dashboard. Give each queue its own administrator.
          </p>

          <div className="owner-feature">
            <ShieldCheck size={20} />
            <div>
              <strong>Secure access</strong>
              <span>Protected owner accounts and sessions</span>
            </div>
          </div>
          <div className="owner-feature">
            <Building2 size={20} />
            <div>
              <strong>Multiple queues</strong>
              <span>Manage different service counters</span>
            </div>
          </div>
        </div>

        <section className="owner-auth-card">
          <div className="owner-tabs">
            <button
              type="button"
              className={mode === "login" ? "active" : ""}
              onClick={() => {
                setMode("login");
                setError("");
                setMessage("");
              }}
            >
              Sign in
            </button>
            <button
              type="button"
              className={mode === "register" ? "active" : ""}
              onClick={() => {
                setMode("register");
                setError("");
                setMessage("");
              }}
            >
              Register
            </button>
          </div>

          <div className="owner-form-heading">
            <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
            <p>
              {mode === "login"
                ? "Sign in to manage your organization."
                : "Register your organization to get started."}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === "register" && (
              <div className="owner-field">
                <label htmlFor="organizationName">ORGANIZATION NAME</label>
                <div className="owner-input-wrap">
                  <Building2 size={18} />
                  <input
                    id="organizationName"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="e.g. City Hospital"
                    maxLength={150}
                    required
                  />
                </div>
              </div>
            )}

            <div className="owner-field">
              <label htmlFor="ownerUsername">USERNAME</label>
              <div className="owner-input-wrap">
                <User size={18} />
                <input
                  id="ownerUsername"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  minLength={mode === "register" ? 3 : undefined}
                  maxLength={50}
                  required
                />
              </div>
            </div>

            <div className="owner-field">
              <label htmlFor="ownerPassword">PASSWORD</label>
              <div className="owner-input-wrap">
                <Lock size={18} />
                <input
                  id="ownerPassword"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  minLength={mode === "register" ? 8 : undefined}
                  maxLength={72}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="owner-alert owner-error">
                <AlertCircle size={17} />
                {error}
              </div>
            )}

            {message && (
              <div className="owner-alert owner-message">
                <CheckCircle2 size={17} />
                {message}
              </div>
            )}

            <button
              type="submit"
              className="owner-submit-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoaderCircle className="owner-spinner" size={18} />
                  Please wait...
                </>
              ) : (
                <>
                  {mode === "login" ? "Sign in to account" : "Create account"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="owner-secure-note">
            <ShieldCheck size={15} />
            Your account is protected with secure authentication.
          </p>
        </section>
      </section>

      <footer className="owner-footer">
        © 2026 SmartQueue <span>·</span> Queue smarter. Live better.
      </footer>
    </main>
  );
}
