
import { useCallback, useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock3,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  RefreshCw,
  SkipForward,
  Ticket,
  Users,
} from "lucide-react";
import "./StaffDashboard.css";

const API_URL = `http://${window.location.hostname}:8080/api`;

function StaffDashboard() {
  const qrRef = useRef(null);

  const [authUser, setAuthUser] = useState(null);
  const [queueId, setQueueId] = useState(null);
  const [queue, setQueue] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const customerURL = queueId
    ? `${window.location.origin}/join/${queueId}`
    : window.location.origin;

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

  // Identify the logged-in queue administrator.
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          credentials: "include",
        });

        if (!response.ok) {
          window.location.replace("/owner");
          return;
        }

        const user = await response.json();

        if (user.role !== "QUEUE_ADMIN" || !user.queueId) {
          window.location.replace("/owner");
          return;
        }

        setAuthUser(user);
        setQueueId(user.queueId);
      } catch (err) {
        setError("Unable to verify your login. Please sign in again.");
        setLoading(false);
      }
    };

    loadCurrentUser();
  }, []);

  const fetchDashboard = useCallback(async () => {
    if (!queueId) return;

    try {
      const [queueResponse, ticketsResponse] = await Promise.all([
      fetch(`${API_URL}/queues/${queueId}/public`, {
        credentials: "include",
      }),
      fetch(`${API_URL}/queues/${queueId}/tickets`, {
        credentials: "include",
      }),
    ]);

      if (queueResponse.status === 401 || ticketsResponse.status === 401) {
        window.location.replace("/owner");
        return;
      }

      if (!queueResponse.ok || !ticketsResponse.ok) {
        throw new Error("Unable to load dashboard information.");
      }

      const assignedQueue = await queueResponse.json();
const ticketData = await ticketsResponse.json();

setQueue(assignedQueue);
      setTickets(ticketData);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  }, [queueId]);

  // Load and refresh the assigned queue.
  useEffect(() => {
    if (!queueId) return;

    fetchDashboard();

    const interval = setInterval(fetchDashboard, 5000);

    return () => clearInterval(interval);
  }, [queueId, fetchDashboard]);

  const downloadQRCode = () => {
    const canvas = qrRef.current?.querySelector("canvas");

    if (!canvas) {
      setError("QR code is not ready yet.");
      return;
    }

    const imageURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");

    link.href = imageURL;
    link.download = `SmartQueue-${queue?.name || "Queue"}-QR.png`;
    link.click();
  };

  const performAction = async (url, method, successMessage) => {
    try {
      setActionLoading(true);
      setError("");
      setNotice("");

      const csrfToken = await getCsrfToken();

      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "X-XSRF-TOKEN": csrfToken,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail || data.message || "Action failed."
        );
      }

      setNotice(successMessage);
      await fetchDashboard();
    } catch (err) {
      setError(err.message || "Action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const callNext = () =>
    performAction(
      `${API_URL}/queues/${queueId}/next`,
      "POST",
      "Next customer called successfully."
    );

  const markServed = (token) =>
    performAction(
      `${API_URL}/queues/${queueId}/tickets/${token}/serve`,
      "PUT",
      `Token #${token} marked as served.`
    );

  const skipCustomer = (token) =>
    performAction(
      `${API_URL}/queues/${queueId}/tickets/${token}/skip`,
      "PUT",
      `Token #${token} skipped.`
    );

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

  const copyCustomerLink = async () => {
    try {
      await navigator.clipboard.writeText(customerURL);
      setNotice("Queue-specific customer link copied.");
      setError("");
    } catch {
      setError("Could not copy the customer link.");
    }
  };

  const waiting = tickets.filter((t) => t.status === "WAITING");
  const serving = tickets.find((t) => t.status === "SERVING");
  const completed = tickets.filter((t) => t.status === "DONE");
  const skipped = tickets.filter((t) => t.status === "SKIPPED");

  if (loading) {
    return (
      <div className="dashboard-loading">
        <LoaderCircle className="spin" size={30} />
        Loading SmartQueue dashboard...
      </div>
    );
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="staff-brand">
          <span className="staff-brand-icon">
            <Ticket size={21} />
          </span>
          Smart<span>Queue</span>
        </div>

        <div className="sidebar-section">WORKSPACE</div>

        <div className="sidebar-link active">
          <LayoutDashboard size={18} />
          Dashboard
        </div>

        <div className="sidebar-section">SYSTEM</div>

        <div className="sidebar-link">
          <Activity size={18} />
          Queue Monitor
        </div>

        <div className="sidebar-footer">
          <div className="staff-avatar">
            {authUser?.username?.charAt(0).toUpperCase() || "S"}
          </div>
          <div>
            <strong>{authUser?.username || "Queue Admin"}</strong>
            <span>{queue?.name || "Queue Administrator"}</span>
          </div>
        </div>

        <button className="sidebar-link" onClick={handleLogout}>
          <LogOut size={18} />
          Log out
        </button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <div className="dashboard-breadcrumb">
              WORKSPACE / DASHBOARD
            </div>
            <h1>Queue Dashboard</h1>
            <p>Monitor and manage your assigned customer queue.</p>
          </div>

          <button
            className="refresh-button"
            onClick={fetchDashboard}
            disabled={actionLoading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </header>

        <section className="qr-panel">
          <div className="qr-info">
            <span className="panel-label">CUSTOMER ACCESS</span>
            <h2>Queue QR Code</h2>
            <p>
              Customers can scan this QR code using their phone camera
              to join your queue. No app installation required.
            </p>

            <div className="qr-url">
              <span>{customerURL}</span>
              <button
                className="qr-download-button"
                onClick={copyCustomerLink}
              >
                Copy Link
              </button>
            </div>

            <button
              className="qr-download-button"
              onClick={downloadQRCode}
            >
              Download QR Code
            </button>
          </div>

          <div className="qr-image-container" ref={qrRef}>
            <QRCodeCanvas
              value={customerURL}
              size={220}
              level="H"
              includeMargin={true}
            />
            <strong>{queue?.name || "SmartQueue"}</strong>
            <span>Scan to join the queue</span>
          </div>
        </section>

        {error && <div className="dashboard-alert error">{error}</div>}
        {notice && <div className="dashboard-alert success">{notice}</div>}

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-icon blue"><Users /></div>
            <span>Total tickets</span>
            <strong>{tickets.length}</strong>
            <small>All registered customers</small>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon orange"><Clock3 /></div>
            <span>Waiting</span>
            <strong>{waiting.length}</strong>
            <small>Customers in line</small>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon green"><CheckCircle2 /></div>
            <span>Completed</span>
            <strong>{completed.length}</strong>
            <small>Successfully served</small>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon purple"><SkipForward /></div>
            <span>Skipped</span>
            <strong>{skipped.length}</strong>
            <small>Skipped tickets</small>
          </div>
        </section>

        <section className="serving-panel">
          <div className="serving-info">
            <span className="panel-label">CURRENTLY SERVING</span>

            {serving ? (
              <>
                <h2>Token #{serving.tokenNumber}</h2>
                <p>{serving.customerName}</p>
                <span className="serving-status">IN SERVICE</span>
              </>
            ) : (
              <>
                <h2>No active customer</h2>
                <p>Call the next waiting customer.</p>
              </>
            )}
          </div>

          <div className="serving-actions">
            {serving ? (
              <>
                <button
                  className="serve-button"
                  disabled={actionLoading}
                  onClick={() => markServed(serving.tokenNumber)}
                >
                  <CheckCircle2 size={17} />
                  Mark Served
                </button>

                <button
                  className="skip-button"
                  disabled={actionLoading}
                  onClick={() => skipCustomer(serving.tokenNumber)}
                >
                  <SkipForward size={17} />
                  Skip
                </button>
              </>
            ) : (
              <button
                className="call-button"
                disabled={actionLoading || waiting.length === 0}
                onClick={callNext}
              >
                {actionLoading ? (
                  <LoaderCircle className="spin" size={18} />
                ) : (
                  <>
                    Call Next Customer <ArrowRight size={18} />
                  </>
                )}
              </button>
            )}
          </div>
        </section>

        <section className="waiting-panel">
          <div className="waiting-heading">
            <div>
              <h2>Customer Queue</h2>
              <p>Manage registered customers and their status.</p>
            </div>

            <span className="waiting-count">
              {waiting.length} Waiting
            </span>
          </div>

          <div className="table-wrapper">
            <table className="staff-table">
              <thead>
                <tr>
                  <th>TOKEN</th>
                  <th>CUSTOMER</th>
                  <th>STATUS</th>
                  <th>POSITION</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-row">
                      No customers registered yet.
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td className="token-cell">
                        #{ticket.tokenNumber}
                      </td>

                      <td>{ticket.customerName}</td>

                      <td>
                        <span className={`status-pill ${ticket.status.toLowerCase()}`}>
                          {ticket.status}
                        </span>
                      </td>

                      <td>
                        {ticket.status === "WAITING"
                          ? ticket.position
                          : "—"}
                      </td>

                      <td>
                        {ticket.status === "WAITING" ? (
                          <button
                            className="row-action"
                            disabled={actionLoading || Boolean(serving)}
                            onClick={() => skipCustomer(ticket.tokenNumber)}
                          >
                            Skip
                          </button>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="dashboard-footer">
          <span>© 2026 SmartQueue Management</span>
          <span>Queue: {queue?.name || "Unavailable"} (#{queueId})</span>
          <span>Auto refresh: 5 seconds</span>
        </footer>
      </main>
    </div>
  );
}

export default StaffDashboard;
