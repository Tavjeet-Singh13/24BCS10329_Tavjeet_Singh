
import { useCallback, useEffect, useState } from "react";
import {
  Ticket,
  Plus,
  LogOut,
  Building2,
  Users,
  Activity,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  Lock,
  User,
  RefreshCw,
} from "lucide-react";
import "./OwnerDashboard.css";

const API_URL = `http://${window.location.hostname}:8080/api`;

export default function OwnerDashboard() {
  const [owner, setOwner] = useState(null);
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [queueName, setQueueName] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getCsrfToken = async () => {
    const response = await fetch(`${API_URL}/auth/csrf`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Could not initialize secure connection.");
    }

    const data = await response.json();
    return data.token;
  };

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [userResponse, queueResponse] = await Promise.all([
        fetch(`${API_URL}/auth/me`, { credentials: "include" }),
        fetch(`${API_URL}/queues/mine`, { credentials: "include" }),
      ]);

      if (userResponse.status === 401 || userResponse.status === 403) {
        window.location.replace("/owner");
        return;
      }

      if (!userResponse.ok) {
        throw new Error("Could not verify your account.");
      }

      const userData = await userResponse.json();

      if (userData.role !== "OWNER") {
        window.location.replace("/owner");
        return;
      }

      if (!queueResponse.ok) {
        throw new Error("Could not load your queues.");
      }

      const queueData = await queueResponse.json();

      setOwner(userData);
      setQueues(queueData);
    } catch (err) {
      setError(err.message || "Unable to connect to SmartQueue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleCreateQueue = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!queueName.trim() || !adminUsername.trim() || !adminPassword) {
      setError("Please complete all fields.");
      return;
    }

    setCreating(true);

    try {
      const csrfToken = await getCsrfToken();

      const response = await fetch(`${API_URL}/queues`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify({
          name: queueName.trim(),
          adminUsername: adminUsername.trim(),
          adminPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.message ||
            "Could not create queue. Please try again."
        );
      }

      setQueues((previous) => [...previous, data]);
      setQueueName("");
      setAdminUsername("");
      setAdminPassword("");
      setShowForm(false);
      setSuccess(`"${data.name}" was created successfully.`);
    } catch (err) {
      setError(err.message || "Unable to create queue.");
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = async () => {
    try {
      const csrfToken = await getCsrfToken();

      const response = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "X-XSRF-TOKEN": csrfToken,
        },
      });

      if (!response.ok) {
        throw new Error("Logout failed. Please try again.");
      }

      window.location.replace("/owner");
    } catch (err) {
      setError(err.message || "Could not log out.");
    }
  };

  if (loading) {
    return (
      <main className="owner-dashboard-loading">
        <LoaderCircle className="owner-dashboard-spinner" size={32} />
        <p>Loading your dashboard...</p>
      </main>
    );
  }

  return (
    <main className="owner-dashboard">
      <aside className="owner-sidebar">
        <a href="/owner/dashboard" className="dashboard-brand">
          <span className="dashboard-brand-icon"><Ticket size={22} /></span>
          Smart<span>Queue</span>
        </a>

        <div className="sidebar-section-label">WORKSPACE</div>
        <a href="/owner/dashboard" className="sidebar-link active">
          <Activity size={18} /> Overview
        </a>

        <div className="sidebar-bottom">
          <div className="sidebar-owner">
            <div className="owner-avatar">
              {owner?.username?.charAt(0).toUpperCase() || "O"}
            </div>
            <div>
              <strong>{owner?.username}</strong>
              <span>Organization owner</span>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout}>
            <LogOut size={17} /> Log out
          </button>
        </div>
      </aside>

      <section className="owner-dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <span className="dashboard-breadcrumb">WORKSPACE / OVERVIEW</span>
            <h1>Dashboard</h1>
          </div>
          <div className="dashboard-top-actions">
            <a href="/" className="customer-page-link">Customer page</a>
            <button
              className="dashboard-refresh"
              onClick={loadDashboard}
              title="Refresh dashboard"
            >
              <RefreshCw size={17} />
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="dashboard-welcome">
            <div>
              <h2>Welcome, {owner?.username} 👋</h2>
              <p>Manage your service queues and their administrators.</p>
            </div>
            <button
              className="create-queue-button"
              onClick={() => {
                setShowForm((value) => !value);
                setError("");
                setSuccess("");
              }}
            >
              <Plus size={18} />
              Create new queue
            </button>
          </div>

          {error && (
            <div className="dashboard-alert dashboard-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="dashboard-alert dashboard-success">
              <CheckCircle2 size={18} />
              <span>{success}</span>
            </div>
          )}

          <div className="dashboard-stat-grid">
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-icon purple"><Building2 size={21} /></div>
              <span>Total queues</span>
              <strong>{queues.length}</strong>
              <small>Created by your organization</small>
            </div>

            <div className="dashboard-stat-card">
              <div className="dashboard-stat-icon green"><Activity size={21} /></div>
              <span>Active queues</span>
              <strong>{queues.filter((queue) => queue.active).length}</strong>
              <small>Currently accepting customers</small>
            </div>

            <div className="dashboard-stat-card">
              <div className="dashboard-stat-icon blue"><Users size={21} /></div>
              <span>Queue administrators</span>
              <strong>{queues.length}</strong>
              <small>One administrator per queue</small>
            </div>
          </div>

          {showForm && (
            <section className="create-queue-panel">
              <div className="create-panel-heading">
                <div>
                  <h3>Create a new queue</h3>
                  <p>Set up the queue and its dedicated administrator.</p>
                </div>
                <button
                  type="button"
                  className="close-create-form"
                  onClick={() => setShowForm(false)}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateQueue}>
                <div className="dashboard-form-grid">
                  <div className="dashboard-field">
                    <label htmlFor="queueName">QUEUE NAME</label>
                    <div className="dashboard-input-wrap">
                      <Building2 size={17} />
                      <input
                        id="queueName"
                        value={queueName}
                        onChange={(e) => setQueueName(e.target.value)}
                        placeholder="e.g. General Consultation"
                        maxLength={100}
                        required
                      />
                    </div>
                  </div>

                  <div className="dashboard-field">
                    <label htmlFor="adminUsername">ADMIN USERNAME</label>
                    <div className="dashboard-input-wrap">
                      <User size={17} />
                      <input
                        id="adminUsername"
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        placeholder="Unique admin username"
                        minLength={3}
                        maxLength={50}
                        required
                      />
                    </div>
                  </div>

                  <div className="dashboard-field">
                    <label htmlFor="adminPassword">ADMIN PASSWORD</label>
                    <div className="dashboard-input-wrap">
                      <Lock size={17} />
                      <input
                        id="adminPassword"
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        minLength={8}
                        maxLength={72}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="create-form-footer">
                  <span>Each queue administrator can manage only their assigned queue.</span>
                  <button type="submit" disabled={creating}>
                    {creating ? (
                      <><LoaderCircle className="owner-dashboard-spinner" size={17} /> Creating...</>
                    ) : (
                      <><Plus size={17} /> Create queue</>
                    )}
                  </button>
                </div>
              </form>
            </section>
          )}

          <section className="queues-section">
            <div className="queues-section-heading">
              <div>
                <h3>Your queues</h3>
                <p>All queues created under your organization.</p>
              </div>
              <span className="queue-count">{queues.length} total</span>
            </div>

            {queues.length === 0 ? (
              <div className="empty-queues">
                <div className="empty-queues-icon"><Ticket size={27} /></div>
                <h3>No queues created yet</h3>
                <p>Create your first queue and assign its administrator.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="empty-create-button"
                >
                  <Plus size={17} /> Create your first queue
                </button>
              </div>
            ) : (
              <div className="queue-table-wrap">
                <table className="queue-table">
                  <thead>
                    <tr>
                      <th>QUEUE</th>
                      <th>QUEUE ID</th>
                      <th>NEXT TOKEN</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queues.map((queue) => (
                      <tr key={queue.id}>
                        <td>
                          <div className="queue-name-cell">
                            <span className="queue-row-icon"><Ticket size={18} /></span>
                            <strong>{queue.name}</strong>
                          </div>
                        </td>
                        <td>#{queue.id}</td>
                        <td>#{queue.nextTokenNumber}</td>
                        <td>
                          <span className={`queue-status ${queue.active ? "is-active" : "is-inactive"}`}>
                            <span />
                            {queue.active ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
