
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Clock3,
  MapPin,
  ShieldCheck,
  Ticket,
  Users,
  CheckCircle2,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";
import "./App.css";
import StaffDashboard from "./StaffDashboard";
import OwnerAuth from "./OwnerAuth";
import OwnerDashboard from "./OwnerDashboard";

const API_URL = `http://${window.location.hostname}:8080/api`;

function App() {
  const match = window.location.pathname.match(/^\/join\/(\d+)$/);
  const requestedQueueId = match ? Number(match[1]) : null;
  if (window.location.pathname === "/owner/dashboard") {
    return <OwnerDashboard />;
  }
  if (window.location.pathname === "/owner") {
    return <OwnerAuth />;
  }
  if (window.location.pathname === "/staff") {
    return <StaffDashboard />;
  }
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState("");
  const [ticket, setTicket] = useState(null);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  // Load real queues from Spring Boot.
  useEffect(() => {
  const fetchQueues = async () => {
    if (!requestedQueueId) {
      setQueues([]);
      setLoading(false);
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/queues/${requestedQueueId}/public`
      );

      if (!response.ok) {
        throw new Error("Could not load this queue.");
      }

      const data = await response.json();

      setQueues(data.active ? [data] : []);
    } catch (err) {
      setError("Unable to load this queue. Please scan a valid QR code.");
    } finally {
      setLoading(false);
    }
  };

  fetchQueues();
}, [requestedQueueId]);



  // Restore the customer's previous ticket after page refresh.
  useEffect(() => {
    if (!requestedQueueId) return;

    const storageKey = `smartqueue-ticket-${requestedQueueId}`;
    const savedTicket = localStorage.getItem(storageKey);

    if (!savedTicket) return;

    let cancelled = false;

    const restoreTicket = async () => {
      try {
        const saved = JSON.parse(savedTicket);

        if (!saved.tokenNumber) {
          localStorage.removeItem(storageKey);
          return;
        }

        const response = await fetch(
          `${API_URL}/queues/${requestedQueueId}/tickets/${saved.tokenNumber}`
        );

        if (response.status === 404) {
          localStorage.removeItem(storageKey);
          return;
        }

        if (!response.ok) return;

        const data = await response.json();

        if (!cancelled) {
          setTicket(data);
          setCustomerName(data.customerName || "");
        }
      } catch (err) {
        console.error("Ticket restoration failed:", err);
      }
    };

    restoreTicket();

    return () => {
      cancelled = true;
    };
  }, [requestedQueueId]);

  
  // Automatically refresh the customer's ticket every 3 seconds
  useEffect(() => {
    if (!ticket) return;

    const refreshTicket = async () => {
      try {
        const response = await fetch(
          `${API_URL}/queues/${ticket.queueId}/tickets/${ticket.tokenNumber}`
        );

        if (!response.ok) return;

        const updatedTicket = await response.json();
        setTicket(updatedTicket);
      } catch (err) {
        console.error("Ticket refresh failed:", err);
      }
    };

    const interval = setInterval(refreshTicket, 3000);

    return () => clearInterval(interval);
  }, [ticket?.queueId, ticket?.tokenNumber]);


  // Join the selected queue using the real backend API.
  
const handleJoinQueue = async (e) => {
  e.preventDefault();

  if (!customerName.trim() || !queue) return;

  try {
    setJoining(true);
    setError("");

    // First, obtain a CSRF token and its cookie.
    const csrfResponse = await fetch(`${API_URL}/auth/csrf`, {
      method: "GET",
      credentials: "include",
    });

    if (!csrfResponse.ok) {
      throw new Error("Could not initialize secure connection.");
    }

    const csrfData = await csrfResponse.json();

    // Send the CSRF token with the customer join request.
    const response = await fetch(
      `${API_URL}/queues/${queue.id}/tickets`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": csrfData.token,
        },
        body: JSON.stringify({
          customerName: customerName.trim(),
        }),
      }
    );

    const responseText = await response.text();
    const data = responseText ? JSON.parse(responseText) : {};

    if (!response.ok) {
      throw new Error(
        data.message || `Could not join queue. Status: ${response.status}`
      );
    }

    localStorage.setItem(
  `smartqueue-ticket-${queue.id}`,
  JSON.stringify({
    tokenNumber: data.tokenNumber,
  })
);

setTicket(data);
  } catch (err) {
    setError(err.message || "Something went wrong. Please try again.");
  } finally {
    setJoining(false);
  }
};


  const queue = requestedQueueId
  ? queues.find((item) => item.id === requestedQueueId) || null
  : queues[0] || null;

  return (
    <main className="page">
      <nav className="navbar">
        <a className="brand" href="/">
          <span className="brand-icon">
            <Ticket size={21} />
          </span>
          <span>
            Smart<span className="brand-accent">Queue</span>
          </span>
        </a>

        <span className="secure-label">
          <ShieldCheck size={15} />
          Easy & secure
        </span>
      </nav>

      <section className="main-content">
        <div className="intro">
          <span className="eyebrow">
            <span className="live-dot" />
            SMART QUEUE MANAGEMENT
          </span>

          <h1>
            Your time matters.
            <br />
            <span>Skip the waiting.</span>
          </h1>

          <p className="intro-text">
            Join the queue digitally and relax while we save your place.
            No app. No registration. Just a few seconds.
          </p>
        </div>

        <section className="queue-card">
          {loading ? (
            <div className="status-message">
              <LoaderCircle className="spinner" size={25} />
              <p>Loading available queues...</p>
            </div>
          ) : !queue ? (
            <div className="status-message">
              <AlertCircle size={28} />
              <h2>No active queues available</h2>
              <p>Please contact the reception for assistance.</p>
            </div>
          ) : (
            <>
              <div className="card-top">
                <div>
                  <span className="section-label">YOU ARE JOINING</span>
                  <h2>{queue.name}</h2>
                  <div className="location">
                    <MapPin size={15} />
                    Main Reception
                  </div>
                </div>

                <div className="queue-icon">
                  <Users size={25} />
                </div>
              </div>

              <div className="queue-stats">
                <div className="stat">
                  <span className="stat-label">Next token number</span>
                  <strong>#{queue.nextTokenNumber}</strong>
                </div>

                <div className="stat-divider" />

                <div className="stat">
                  <span className="stat-label">Queue status</span>
                  <strong className="wait-time">Active</strong>
                </div>
              </div>

              {!ticket ? (
                <form onSubmit={handleJoinQueue}>
                  <label htmlFor="customerName">YOUR NAME</label>

                  <input
                    id="customerName"
                    type="text"
                    placeholder="Enter your name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    maxLength={100}
                    required
                  />

                  <button
                    type="submit"
                    className="join-button"
                    disabled={joining}
                  >
                    {joining ? (
                      <>
                        <LoaderCircle className="spinner" size={18} />
                        Joining queue...
                      </>
                    ) : (
                      <>
                        Get My Token <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="ticket-result">
                  <div className="success-icon">
                    <CheckCircle2 size={28} />
                  </div>

                  <span className="section-label">YOUR CONFIRMED TICKET</span>

                  <h3>You're in the queue, {ticket.customerName}!</h3>

                  <span className="token-label">YOUR TOKEN NUMBER</span>

                  <div className="token-number">
                    #{ticket.tokenNumber}
                  </div>

                  
                    <div className="ticket-details">
                      <div>
                        <span>Status</span>
                        <strong>{ticket.status}</strong>
                      </div>

                      <div>
                        <span>Your position</span>
                        <strong>{ticket.position ?? "—"}</strong>
                      </div>

                      <div>
                        <span>Currently serving</span>
                        <strong>
                          {ticket.currentlyServingToken
                            ? `#${ticket.currentlyServingToken}`
                            : "None"}
                        </strong>
                      </div>

                      <div>
                        <span>Estimated wait</span>
                        <strong>
                          {ticket.estimatedWaitMinutes == null
                            ? "—"
                            : `${ticket.estimatedWaitMinutes} min`}
                        </strong>
                      </div>
                    </div>

                    {ticket.status === "SERVING" && (
                      <p className="live-notification">
                        <CheckCircle2 size={18} />
                        It's your turn! Please proceed to the counter.
                      </p>
                    )}

                    {ticket.status === "DONE" && (
                      <p className="live-notification">
                        <CheckCircle2 size={18} />
                        Your service is complete. Thank you!
                      </p>
                    )}

                    {ticket.status === "SKIPPED" && (
                      <p className="live-notification">
                        Your ticket has been skipped. Please contact the reception.
                      </p>
                    )}


                  <p className="ticket-note">
                    Your ticket has been saved. Keep this page open to
                    refer to your token number.
                  </p>
                </div>
              )}
            </>
          )}
          
          {error && (
            <div className="error-message">
              <AlertCircle size={17} />
              <span>{error}</span>
            </div>
          )}
        </section>

        <div className="benefits">
          <div>
            <Clock3 size={17} />
            <span>Save your time</span>
          </div>
          <div>
            <ShieldCheck size={17} />
            <span>No account needed</span>
          </div>
          <div>
            <Ticket size={17} />
            <span>Digital token</span>
          </div>
        </div>
      </section>

      <footer>
        <span>© 2026 SmartQueue</span>
        <span>Queue smarter. Live better.</span>
      </footer>
    </main>
  );
}

export default App;
