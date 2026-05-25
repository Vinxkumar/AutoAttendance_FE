import { useState, useEffect, useRef } from "react";
import { Analytics } from "@vercel/analytics/next"
const API = "https://autoattendance-be.onrender.com/api";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');`;

function cls(...args) { return args.filter(Boolean).join(" "); }

const styles = `
  ${FONTS}
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --ink: #0d0d0d; --ink2: #3d3d3d; --ink3: #888;
    --paper: #f7f5f0; --white: #ffffff;
    --accent: #2a5cff; --accent-light: #e8edff;
    --danger: #e8392a; --danger-light: #ffeeed;
    --success: #14a05c; --success-light: #e6f9f0;
    --warn: #c97a00; --warn-light: #fff8e6;
    --border: rgba(0,0,0,0.1);
    --radius: 14px; --shadow: 0 2px 24px rgba(0,0,0,0.08);
  }
  body { font-family: 'DM Sans', sans-serif; background: var(--paper); color: var(--ink); min-height: 100vh; }
  h1,h2,h3,h4 { font-family: 'Syne', sans-serif; }
  .app { min-height: 100vh; display: flex; flex-direction: column; }
  .nav {
    background: var(--white); border-bottom: 1px solid var(--border);
    padding: 0 2rem; height: 60px; display: flex; align-items: center;
    justify-content: space-between; position: sticky; top: 0; z-index: 100;
  }
  .nav-logo {
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.1rem;
    letter-spacing: -0.5px; display: flex; align-items: center; gap: 8px; cursor: pointer;
  }
  .nav-logo-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); display: inline-block; }
  .page { flex: 1; }
  .home {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    min-height: calc(100vh - 60px); padding: 3rem 1.5rem;
  }
  .home-eyebrow { font-size: 0.75rem; letter-spacing: 2px; text-transform: uppercase; color: var(--accent); font-weight: 600; margin-bottom: 1rem; }
  .home-title { font-size: clamp(2.2rem, 6vw, 4rem); font-weight: 800; line-height: 1.1; text-align: center; letter-spacing: -1px; margin-bottom: 1rem; }
  .home-sub { font-size: 1.05rem; color: var(--ink2); text-align: center; max-width: 420px; margin-bottom: 2.5rem; line-height: 1.6; }
  .btn {
    font-family: 'Syne', sans-serif; font-weight: 700; border: none; cursor: pointer;
    border-radius: 10px; transition: all 0.15s ease; display: inline-flex; align-items: center; gap: 8px; text-decoration: none;
  }
  .btn:active { transform: scale(0.97); }
  .btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .btn-primary { background: var(--accent); color: white; padding: 0.85rem 2rem; font-size: 0.95rem; box-shadow: 0 4px 20px rgba(42,92,255,0.3); }
  .btn-primary:hover:not(:disabled) { background: #1a4ce6; }
  .btn-danger { background: var(--danger); color: white; padding: 0.75rem 1.5rem; font-size: 0.9rem; }
  .btn-danger:hover:not(:disabled) { background: #c8301f; }
  .btn-outline { background: var(--white); color: var(--ink); border: 1.5px solid var(--border); padding: 0.75rem 1.5rem; font-size: 0.9rem; }
  .btn-outline:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
  .btn-success { background: var(--success); color: white; padding: 0.75rem 1.5rem; font-size: 0.9rem; }
  .btn-success:hover:not(:disabled) { background: #0f8a4e; }
  .btn-sm { padding: 0.5rem 1rem; font-size: 0.82rem; }
  .btn-lg { padding: 1rem 2.5rem; font-size: 1rem; }
  .overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.45);
    display: flex; align-items: center; justify-content: center;
    z-index: 200; padding: 1.5rem; animation: fadeIn 0.15s ease;
    overflow-y: auto;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .modal { background: var(--white); border-radius: var(--radius); padding: 2rem; width: 100%; max-width: 480px; box-shadow: var(--shadow); animation: slideUp 0.2s ease; }
  .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
  .modal-title { font-size: 1.25rem; font-weight: 700; }
  .close-btn { width: 32px; height: 32px; border-radius: 8px; border: none; background: var(--paper); cursor: pointer; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; }
  .close-btn:hover { background: var(--border); }
  .form-group { margin-bottom: 1rem; }
  .form-label { display: block; font-size: 0.8rem; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; color: var(--ink2); margin-bottom: 5px; }
  .form-input { width: 100%; padding: 0.7rem 0.9rem; border: 1.5px solid var(--border); border-radius: 8px; font-size: 0.95rem; font-family: inherit; background: var(--paper); transition: border-color 0.15s, box-shadow 0.15s; outline: none; color: var(--ink); }
  .form-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-light); background: var(--white); }
  .form-input::placeholder { color: var(--ink3); }
  textarea.form-input { resize: vertical; min-height: 80px; }
  .form-error { font-size: 0.8rem; color: var(--danger); margin-top: 4px; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  .section-divider { font-size: 0.72rem; letter-spacing: 1.5px; text-transform: uppercase; color: var(--ink3); font-weight: 600; margin: 1.25rem 0 0.75rem; display: flex; align-items: center; gap: 8px; }
  .section-divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
  .loc-banner { border-radius: 10px; padding: 0.75rem 1rem; font-size: 0.84rem; display: flex; align-items: flex-start; gap: 8px; margin-bottom: 1rem; }
  .loc-ok  { background: var(--success-light); color: var(--success); }
  .loc-pending { background: var(--accent-light); color: var(--accent); }
  .loc-fail { background: var(--danger-light); color: var(--danger); }
  .loc-warn { background: var(--warn-light); color: var(--warn); }
  .radius-row { display: flex; align-items: center; gap: 10px; }
  .radius-row input[type=range] { flex: 1; }
  .radius-val { font-weight: 700; min-width: 52px; font-size: 0.95rem; }
  .event-page { max-width: 680px; margin: 0 auto; padding: 3rem 1.5rem; }
  .event-header { margin-bottom: 2.5rem; }
  .event-badge { display: inline-flex; align-items: center; gap: 6px; background: var(--success-light); color: var(--success); padding: 4px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 600; margin-bottom: 1rem; }
  .event-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--success); animation: pulse 1.5s infinite; }
  @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(1.4); } }
  .event-badge.stopped { background: var(--danger-light); color: var(--danger); }
  .event-badge.stopped .event-badge-dot { background: var(--danger); animation: none; }
  .event-name { font-size: 2rem; font-weight: 800; letter-spacing: -0.5px; }
  .event-meta { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 0.75rem; }
  .event-meta-item { display: flex; align-items: center; gap: 5px; font-size: 0.88rem; color: var(--ink2); }
  .code-card { background: var(--ink); border-radius: var(--radius); padding: 2rem; text-align: center; margin-bottom: 2rem; }
  .code-label { font-size: 0.75rem; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.5); margin-bottom: 0.75rem; }
  .code-digits { font-family: 'Syne', sans-serif; font-size: clamp(3rem, 10vw, 5rem); font-weight: 800; letter-spacing: 0.15em; color: white; line-height: 1; margin-bottom: 0.5rem; }
  .code-share { font-size: 0.8rem; color: rgba(255,255,255,0.4); margin-top: 0.5rem; }
  .geofence-badge { display: inline-flex; align-items: center; gap: 5px; background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.7); padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; margin-top: 0.75rem; }
  .stat-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
  .stat-card { background: var(--white); border-radius: var(--radius); border: 1px solid var(--border); padding: 1rem 1.25rem; }
  .stat-label { font-size: 0.75rem; color: var(--ink3); margin-bottom: 4px; }
  .stat-val { font-size: 1.5rem; font-weight: 700; }
  .action-row { display: flex; gap: 0.75rem; flex-wrap: wrap; }
  .link-box { background: var(--white); border: 1px solid var(--border); border-radius: var(--radius); padding: 1rem 1.25rem; margin-bottom: 2rem; display: flex; align-items: center; gap: 0.75rem; }
  .link-box-url { flex: 1; font-size: 0.85rem; color: var(--accent); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .copy-btn { border: 1px solid var(--border); background: var(--paper); padding: 5px 12px; border-radius: 6px; font-size: 0.8rem; cursor: pointer; font-weight: 600; white-space: nowrap; }
  .copy-btn:hover { background: var(--accent-light); color: var(--accent); }
  .table-wrap { background: var(--white); border-radius: var(--radius); border: 1px solid var(--border); overflow: hidden; margin-top: 2rem; }
  .table-head { padding: 1rem 1.25rem; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
  table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
  th { text-align: left; padding: 0.6rem 1rem; font-size: 0.75rem; letter-spacing: 0.5px; text-transform: uppercase; color: var(--ink3); background: var(--paper); border-bottom: 1px solid var(--border); }
  td { padding: 0.7rem 1rem; border-bottom: 1px solid var(--border); color: var(--ink2); }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: var(--paper); }
  .student-page { min-height: calc(100vh - 60px); display: flex; align-items: center; justify-content: center; padding: 2rem 1.5rem; }
  .student-card { background: var(--white); border-radius: var(--radius); padding: 2rem; width: 100%; max-width: 440px; box-shadow: var(--shadow); }
  .student-event-tag { background: var(--accent-light); color: var(--accent); padding: 4px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 600; display: inline-block; margin-bottom: 1rem; }
  .student-title { font-size: 1.4rem; font-weight: 800; margin-bottom: 0.25rem; }
  .student-sub { font-size: 0.88rem; color: var(--ink3); margin-bottom: 1.25rem; }
  .entry-page { min-height: calc(100vh - 60px); display: flex; align-items: center; justify-content: center; padding: 2rem; }
  .entry-card { background: var(--white); border-radius: var(--radius); padding: 2rem; width: 100%; max-width: 400px; box-shadow: var(--shadow); text-align: center; }
  .success-state { text-align: center; padding: 1.5rem 0; }
  .success-icon { width: 60px; height: 60px; background: var(--success-light); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; margin: 0 auto 1rem; }
  .success-title { font-size: 1.4rem; font-weight: 800; margin-bottom: 0.5rem; }
  .success-sub { font-size: 0.9rem; color: var(--ink3); }
  .spinner { width: 20px; height: 20px; border: 2.5px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .toast { position: fixed; bottom: 1.5rem; right: 1.5rem; background: var(--ink); color: white; padding: 0.75rem 1.25rem; border-radius: 10px; font-size: 0.9rem; z-index: 300; animation: slideUp 0.2s ease; max-width: 320px; }
  @media (max-width: 600px) { .stat-row { grid-template-columns: repeat(2, 1fr); } .action-row { flex-direction: column; } .form-row { grid-template-columns: 1fr; } }
`;

function Toast({ msg }) { return msg ? <div className="toast">{msg}</div> : null; }


function CreateEventModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: "", venue: "", gmail: "", organized_by: "" });
  const [locStatus, setLocStatus] = useState("pending"); 
  const [loc, setLoc]   = useState(null);
  const [radius, setRadius] = useState(100);
  const [loading, setLoading] = useState(false);
  const [err, setErr]   = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (!navigator.geolocation) { setLocStatus("fail"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocStatus("ok");
      },
      () => setLocStatus("fail"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  async function handleSubmit() {
    if (!form.name || !form.venue || !form.gmail || !form.organized_by) {
      setErr("All fields are required."); return;
    }
    if (!/\S+@\S+\.\S+/.test(form.gmail)) {
      setErr("Enter a valid Gmail address."); return;
    }
    if (!loc) {
      setErr("Event location is required. Please allow location access and try again."); return;
    }
    setErr(""); setLoading(true);
    try {
      const res = await fetch(`${API}/create-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, lat: loc.lat, lng: loc.lng, radius_m: radius }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      onCreate({ code: data.code, ...data.event });
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Create New Event</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="form-group">
          <label className="form-label">Event Name</label>
          <input className="form-input" placeholder="e.g. Tech Symposium 2025" value={form.name} onChange={set("name")} />
        </div>
        <div className="form-group">
          <label className="form-label">Venue</label>
          <input className="form-input" placeholder="e.g. Seminar Hall A, Block C" value={form.venue} onChange={set("venue")} />
        </div>
        <div className="form-group">
          <label className="form-label">Gmail (for export)</label>
          <input className="form-input" type="email" placeholder="organizer@gmail.com" value={form.gmail} onChange={set("gmail")} />
        </div>
        <div className="form-group">
          <label className="form-label">Organized By</label>
          <input className="form-input" placeholder="Department / Club / Faculty" value={form.organized_by} onChange={set("organized_by")} />
        </div>

        <p className="section-divider">Geofencing</p>

        {/* Location status */}
        <div className={cls("loc-banner", locStatus === "ok" ? "loc-ok" : locStatus === "fail" ? "loc-fail" : "loc-pending")}>
          <span style={{ fontSize: "1rem" }}>
            {locStatus === "ok" ? "✓" : locStatus === "fail" ? "✕" : "⏳"}
          </span>
          <div>
            {locStatus === "ok" && (
              <>
                <strong>Location captured</strong> — this will be the geofence center.<br />
                <span style={{ fontSize: "0.78rem", opacity: 0.8 }}>
                  {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}
                </span>
              </>
            )}
            {locStatus === "fail" && (
              <>
                <strong>Location access denied.</strong> You must enable GPS to set a geofence.
                <br /><span style={{ fontSize: "0.78rem", opacity: 0.8 }}>Students outside the radius will be blocked.</span>
              </>
            )}
            {locStatus === "pending" && "Getting your current location…"}
          </div>
        </div>

        {/* Radius slider */}
        <div className="form-group">
          <label className="form-label">Attendance Radius</label>
          <div className="radius-row">
            <input type="range" min={20} max={500} step={10} value={radius}
              onChange={(e) => setRadius(Number(e.target.value))} />
            <span className="radius-val">{radius} m</span>
          </div>
          <p style={{ fontSize: "0.78rem", color: "var(--ink3)", marginTop: 4 }}>
            Students must be within <strong>{radius} m</strong> of this location to mark attendance.
          </p>
        </div>

        {err && <p className="form-error">⚠ {err}</p>}

        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
          onClick={handleSubmit} disabled={loading || locStatus !== "ok"}>
          {loading ? <span className="spinner" /> : locStatus !== "ok" ? "Waiting for location…" : "Create Event →"}
        </button>
      </div>
    </div>
  );
}


function HomePage({ onNavigate }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="page">
      <Analytics/>
      <div className="home">
        <p className="home-eyebrow">✦ Smart Attendance</p>
        <h1 className="home-title" style={{color: "black"}} >Attendance,<br />done right.</h1>
        <p className="home-sub">
          GPS-verified, proxy-proof attendance. Create an event, share a 6-digit code,
          and only students physically present can register.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
          <button className="btn btn-primary btn-lg" onClick={() => setShowModal(true)}>+ Create Event</button>
          <button className="btn btn-outline btn-lg" onClick={() => onNavigate("join")}>Join as Student</button>
        </div>
      </div>
      {showModal && <CreateEventModal onClose={() => setShowModal(false)} onCreate={(ev) => { setShowModal(false); onNavigate("event", ev); }} />}
    </div>
  );
}


function EventPage({ event, onNavigate }) {
  const [active, setActive]         = useState(event.active !== false);
  const [records, setRecords]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [toast, setToast]           = useState("");
  const [copied, setCopied]         = useState(false);
  const intervalRef                 = useRef(null);

  const attendanceUrl = `${window.location.origin}?attend=${event.code}`;

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 3500); }

  async function fetchAttendance() {
    try {
      const res = await fetch(`${API}/attendance/${event.code}`);
      const data = await res.json();
      if (res.ok) setRecords(data.records || []);
    } catch {}
  }

  useEffect(() => {
    fetchAttendance();
    intervalRef.current = setInterval(fetchAttendance, 5000);
    return () => clearInterval(intervalRef.current);
  }, []);

  async function handleStop() {
    if (!window.confirm("Stop event? Students can no longer mark attendance.")) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/stop-event`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: event.code }) });
      if (res.ok) { setActive(false); clearInterval(intervalRef.current); showToast("Event stopped."); }
    } finally { setLoading(false); }
  }

  async function handleExport() {
    setExportLoading(true);
    try {
      const res = await fetch(`${API}/export/${event.code}`, { method: "POST" });
      const data = await res.json();
      if (data.csv) {
        const blob = new Blob([data.csv], { type: "text/csv" });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.href = url; a.download = `attendance_${event.code}.csv`; a.click();
        showToast("CSV downloaded. Set GMAIL_USER/PASS for email.");
      } else {
        showToast(data.message || "Exported!");
      }
    } catch { showToast("Export failed."); }
    finally { setExportLoading(false); }
  }

  function copyLink() { navigator.clipboard.writeText(attendanceUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }

  return (
    <div className="page">
      <div className="event-page">
        <div className="event-header">
          <div className={cls("event-badge", !active && "stopped")}>
            <span className="event-badge-dot" />
            {active ? "Live" : "Ended"}
          </div>
          <h1 className="event-name">{event.name}</h1>
          <div className="event-meta">
            <span className="event-meta-item">📍 {event.venue}</span>
            <span className="event-meta-item">👤 {event.organized_by}</span>
            <span className="event-meta-item">✉ {event.gmail}</span>
            <span className="event-meta-item">🎯 {event.radius_m ?? 100} m geofence</span>
          </div>
        </div>

        <div className="code-card">
          <p className="code-label">Student Entry Code</p>
          <div className="code-digits">{event.code}</div>
          <p className="code-share">Share this code with students to mark attendance</p>
          <div className="geofence-badge">🎯 Only students within {event.radius_m ?? 100} m can register</div>
        </div>

        <div className="link-box">
          <span className="link-box-url">{attendanceUrl}</span>
          <button className="copy-btn" onClick={copyLink}>{copied ? "✓ Copied" : "Copy link"}</button>
        </div>

        <div className="stat-row">
          <div className="stat-card">
            <p className="stat-label">Verified Attendees</p>
            <p className="stat-val">{records.length}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Geofence</p>
            <p className="stat-val" style={{ fontSize: "1.1rem" }}>{event.radius_m ?? 100} m</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Status</p>
            <p className="stat-val" style={{ fontSize: "1rem", color: active ? "var(--success)" : "var(--danger)" }}>
              {active ? "Live" : "Stopped"}
            </p>
          </div>
        </div>

        <div className="action-row">
          {active && (
            <button className="btn btn-danger" onClick={handleStop} disabled={loading}>
              {loading ? <span className="spinner" /> : "⏹ Stop Event"}
            </button>
          )}
          <button className="btn btn-success" onClick={handleExport} disabled={exportLoading}>
            {exportLoading ? <span className="spinner" /> : "↓ Export & Email"}
          </button>
          <button className="btn btn-outline" onClick={() => onNavigate("home")}>← Home</button>
        </div>

        {records.length > 0 && (
          <div className="table-wrap">
            <div className="table-head">
              <span style={{ fontWeight: 600 }}>Attendance Log</span>
              <span style={{ fontSize: "0.82rem", color: "var(--ink3)" }}>{records.length} verified entries</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>#</th><th>Name</th><th>Dept</th><th>Section</th>
                    <th>Distance</th><th>Review</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td style={{ fontWeight: 500, color: "var(--ink)" }}>{r.name}</td>
                      <td>{r.dept}</td>
                      <td>{r.section}</td>
                      <td>
                        <span style={{
                          background: r.distance_m < 50 ? "var(--success-light)" : "var(--warn-light)",
                          color: r.distance_m < 50 ? "var(--success)" : "var(--warn)",
                          padding: "2px 8px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 600
                        }}>
                          {r.distance_m} m
                        </span>
                      </td>
                      <td style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.review || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <Toast msg={toast} />
    </div>
  );
}


function JoinPage({ prefillCode, onNavigate }) {
  const [code, setCode]   = useState(prefillCode || "");
  const [err, setErr]     = useState("");
  const [loading, setLoading] = useState(false);

  async function handleJoin() {
    const c = code.trim();
    if (c.length !== 6) { setErr("Enter a valid 6-digit code."); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${API}/event/${c}`);
      const data = await res.json();
      if (!res.ok) { setErr(data.error || "Invalid code"); return; }
      if (!data.event.active) { setErr("This event has ended."); return; }
      onNavigate("attend", { code: c, ...data.event });
    } catch { setErr("Could not connect to server."); }
    finally { setLoading(false); }
  }

  return (
    <div className="page">
      <div className="entry-page">
        <div className="entry-card">
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "0.25rem", color: "black" }}>Enter Event Code</h2>
          <p style={{ fontSize: "0.88rem", color: "var(--ink3)", marginBottom: "1.5rem" }}>Ask your organizer for the 6-digit code.</p>
          <input className="form-input" placeholder="000000" value={code} maxLength={6}
            onChange={(e) => setCode(e.target.value.replace(/\D/, ""))}
            style={{ fontSize: "2rem", textAlign: "center", letterSpacing: "0.4em", fontFamily: "sans-serif", fontWeight: 500 }} />
          {err && <p className="form-error" style={{ textAlign: "center", marginTop: 6 }}>⚠ {err}</p>}
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "1rem" }}
            onClick={handleJoin} disabled={loading}>
            {loading ? <span className="spinner" /> : "Continue →"}
          </button>
          <button className="btn btn-outline btn-sm" style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
            onClick={() => onNavigate("home")}>Back</button>
        </div>
      </div>
    </div>
  );
}

function AttendPage({ event, onNavigate }) {
  const [form, setForm]   = useState({ name: "", dept: "", section: "", review: "" });
  const [loc, setLoc]     = useState(null);
  const [locStatus, setLocStatus] = useState("pending");
  const [loading, setLoading]     = useState(false);
  const [err, setErr]             = useState("");
  const [done, setDone]           = useState(false);
  const [successData, setSuccessData] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (!navigator.geolocation) { setLocStatus("fail"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocStatus("ok");
      },
      () => setLocStatus("fail"),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }, []);

  async function handleSubmit() {
    if (!form.name || !form.dept || !form.section) {
      setErr("Name, department, and section are required."); return;
    }
    if (locStatus !== "ok") {
      setErr("Location is required to mark attendance. Please enable GPS and refresh."); return;
    }
    setErr(""); setLoading(true);
    try {
      const res = await fetch(`${API}/attend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: event.code, ...form, lat: loc.lat, lng: loc.lng }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setSuccessData(data);
      setDone(true);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }

  if (done) return (
    <div className="page">
      <div className="student-page">
        <div className="student-card">
          <div className="success-state">
            <div className="success-icon">✓</div>
            <h2 className="success-title">Attendance Marked!</h2>
            <p className="success-sub">You're registered for <strong>{event.name}</strong>.</p>
            {successData?.distance_m !== undefined && (
              <p style={{ fontSize: "0.82rem", color: "var(--success)", marginTop: "0.5rem" }}>
                📍 Verified at {successData.distance_m} m from venue
              </p>
            )}
            <button className="btn btn-outline btn-sm" style={{ marginTop: "1.5rem" }} onClick={() => onNavigate("home")}>Back to Home</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="student-page">
        <div className="student-card">
          <span className="student-event-tag">{event.code}</span>
          <h2 className="student-title" style={{color: "black"}} >{event.name}</h2>
          <p className="student-sub">📍 {event.venue} &nbsp;·&nbsp; 👤 {event.organized_by}</p>

          <div className={cls("loc-banner",
            locStatus === "ok"      ? "loc-ok"      :
            locStatus === "fail"    ? "loc-fail"     : "loc-pending")}>
            <span style={{ fontSize: "1rem" }}>
              {locStatus === "ok" ? "✓" : locStatus === "fail" ? "✕" : "⏳"}
            </span>
            <div>
              {locStatus === "ok" && (
                <>
                  <strong>Location verified</strong><br />
                  <span style={{ fontSize: "0.78rem" }}>{loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}</span>
                </>
              )}
              {locStatus === "fail" && (
                <>
                  <strong>Location access denied.</strong> You cannot mark attendance without GPS.
                  <br /><span style={{ fontSize: "0.78rem" }}>Enable location permissions in your browser and refresh.</span>
                </>
              )}
              {locStatus === "pending" && "Acquiring your GPS location…"}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" placeholder="Your full name" value={form.name} onChange={set("name")} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Department</label>
              <input className="form-input" placeholder="e.g. CSE" value={form.dept} onChange={set("dept")} />
            </div>
            <div className="form-group">
              <label className="form-label">Section</label>
              <input className="form-input" placeholder="e.g. A" value={form.section} onChange={set("section")} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Event Review <span style={{ color: "var(--ink3)", fontWeight: 400, textTransform: "none" }}>(optional)</span></label>
            <textarea className="form-input" placeholder="Share your thoughts…" value={form.review} onChange={set("review")} />
          </div>

          {err && (
            <div className="loc-banner loc-fail" style={{ marginBottom: "0.75rem" }}>
              <span>✕</span>
              <div>{err}</div>
            </div>
          )}

          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}
            onClick={handleSubmit} disabled={loading || locStatus === "fail"}>
            {loading ? <span className="spinner" /> :
             locStatus === "pending" ? "Waiting for GPS…" :
             locStatus === "fail"    ? "Location required" :
             "Mark Attendance →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── App Root ──────────────────────────────────────────────────────────────────
export default function App() {
  const params     = new URLSearchParams(window.location.search);
  const attendCode = params.get("attend");

  const [page, setPage]       = useState(attendCode ? "join" : "home");
  const [pageData, setPageData] = useState(attendCode ? { code: attendCode } : null);

  function navigate(p, data = null) { setPage(p); setPageData(data); }

  return (
    <div className="app">
      <style>{styles}</style>
      <nav className="nav">
        <div className="nav-logo" onClick={() => navigate("home")}>
          <span className="nav-logo-dot" /> AttendanceIQ
        </div>
        {page !== "home" && page !== "join" && page !== "attend" && (
          <button className="btn btn-outline btn-sm" onClick={() => navigate("home")}>Home</button>
        )}
      </nav>
      {page === "home"   && <HomePage onNavigate={navigate} />}
      {page === "event"  && <EventPage event={pageData} onNavigate={navigate} />}
      {page === "join"   && <JoinPage prefillCode={pageData?.code} onNavigate={navigate} />}
      {page === "attend" && <AttendPage event={pageData} onNavigate={navigate} />}
    </div>
  );
}
