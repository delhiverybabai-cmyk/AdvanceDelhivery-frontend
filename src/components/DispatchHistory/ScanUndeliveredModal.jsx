import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const BASE = process.env.REACT_APP_BASE_URL;

export default function ScanUndeliveredModal({ isOpen, onClose, dispatch }) {
  // dispatch = single row object from DispatchHistory (has _id, dispatchId, feName, status, etc.)

  const [session, setSession] = useState(null);   // { undelivered, pickupNotCompleted, undeliveredScanned, status, isAllParcelReceived }
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [scanInput, setScanInput] = useState("");
  const [scanning, setScanning] = useState(false); // per-scan call in progress
  const [submitResult, setSubmitResult] = useState(null); // result after submit
  const inputRef = useRef(null);

  // ── Open / reset ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !dispatch?._id) return;
    setSubmitResult(null);
    setScanInput("");
    startSession();
  }, [isOpen, dispatch?._id]); // eslint-disable-line

  // Auto-focus scan input when session loaded
  useEffect(() => {
    if (session && !submitResult) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [session, submitResult]);

  // ── API calls ────────────────────────────────────────────────────────────────
  const startSession = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${BASE}/api/rider-history/scan-session/start/${dispatch._id}`);
      if (res.data.success) {
        setSession({
          undelivered: res.data.undelivered,
          pickupNotCompleted: res.data.pickupNotCompleted,
          undeliveredScanned: res.data.undeliveredScanned,
          status: res.data.status,
          isAllParcelReceived: res.data.isAllParcelReceived,
        });
      } else {
        toast.error("Failed to start scan session");
        onClose();
      }
    } catch (e) {
      toast.error("Server error starting session");
      console.error(e);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    const id = scanInput.trim();
    if (!id || scanning) return;

    const allExpected = [...(session.undelivered || []), ...(session.pickupNotCompleted || [])];

    // Client-side validation first
    if (!allExpected.includes(id)) {
      toast.error("Not a part of this dispatch!", { autoClose: 2000 });
      setScanInput("");
      inputRef.current?.focus();
      return;
    }
    if ((session.undeliveredScanned || []).includes(id)) {
      toast.warning("Already scanned!", { autoClose: 1500 });
      setScanInput("");
      inputRef.current?.focus();
      return;
    }

    setScanning(true);
    try {
      const res = await axios.put(
        `${BASE}/api/rider-history/scan-session/scan/${dispatch._id}`,
        { waybillId: id }
      );
      if (res.data.success) {
        if (res.data.alreadyScanned) {
          toast.warning("Already scanned!", { autoClose: 1500 });
        } else {
          toast.success("✅ Scanned!", { autoClose: 1000 });
          setSession(prev => ({
            ...prev,
            undeliveredScanned: res.data.undeliveredScanned,
            status: 1,
          }));
        }
      }
    } catch (e) {
      const msg = e.response?.data?.error || "Scan failed";
      toast.error(msg, { autoClose: 2000 });
    } finally {
      setScanning(false);
      setScanInput("");
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleScan();
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await axios.post(`${BASE}/api/rider-history/scan-session/submit/${dispatch._id}`);
      if (res.data.success) {
        setSubmitResult(res.data);
        // Update local session status from server response (3 = all received, 1 = missing parcels)
        setSession(prev => ({ ...prev, status: res.data.status, isAllParcelReceived: res.data.isAllParcelReceived }));
        if (res.data.isAllParcelReceived === 1) {
          toast.success("✅ All parcels received! Session submitted.", { autoClose: 3000 });
        } else {
          toast.warning(`⚠️ ${res.data.missingCount} parcel(s) missing — dispatch kept in scanning status.`, { autoClose: 4000 });
        }
      } else {
        toast.error("Submit failed. Try again.");
      }
    } catch (e) {
      toast.error("Server error on submit");
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSession(null);
    setSubmitResult(null);
    setScanInput("");
    onClose();
  };

  if (!isOpen) return null;

  // ── Derived values ──────────────────────────────────────────────────────────
  const allExpected = session ? [...(session.undelivered || []), ...(session.pickupNotCompleted || [])] : [];
  const scannedSet = new Set(session?.undeliveredScanned || []);
  const receivedCount = scannedSet.size;
  const notReceivedCount = allExpected.length - receivedCount;
  const allDone = notReceivedCount === 0 && allExpected.length > 0;

  const sessionAlreadySubmitted = session?.status === 3;

  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && handleClose()}>
      <div style={S.modal}>

        {/* ── Header ── */}
        <div style={S.header}>
          <div>
            <h2 style={S.title}>📦 Scan Undelivered Parcels</h2>
            <p style={S.sub}>
              {dispatch?.feName} — Dispatch #{dispatch?.dispatchId}
              {session && (
                <span style={{
                  marginLeft: 10, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                  background: sessionAlreadySubmitted ? "rgba(16,185,129,0.15)" : "rgba(59,130,246,0.15)",
                  color: sessionAlreadySubmitted ? "#34d399" : "#60a5fa",
                  border: `1px solid ${sessionAlreadySubmitted ? "rgba(16,185,129,0.3)" : "rgba(59,130,246,0.3)"}`,
                }}>
                  {sessionAlreadySubmitted ? "✅ Submitted" : session.status === 1 ? "🔄 Scanning" : "📋 Ready"}
                </span>
              )}
            </p>
          </div>
          <button style={S.closeBtn} onClick={handleClose}>✕</button>
        </div>

        {loading ? (
          <div style={S.centerMsg}>Loading parcel list…</div>
        ) : !session ? null : (
          <>
            {/* ── Summary badges ── */}
            <div style={S.summaryRow}>
              <div style={{ ...S.badge, ...S.badgeGreen }}>
                <span>✔️</span>
                <span style={S.badgeNum}>{receivedCount}</span>
                <span style={S.badgeLbl}>Received</span>
              </div>
              <div style={{ ...S.badge, ...S.badgeRed }}>
                <span>❌</span>
                <span style={S.badgeNum}>{notReceivedCount}</span>
                <span style={S.badgeLbl}>Not Received</span>
              </div>
              <div style={{ ...S.badge, ...S.badgeGray }}>
                <span>📦</span>
                <span style={S.badgeNum}>{allExpected.length}</span>
                <span style={S.badgeLbl}>Total</span>
              </div>
            </div>

            {/* ── Scan input (hidden after submit unless re-opening) ── */}
            {!sessionAlreadySubmitted && (
              <div style={S.scanRow}>
                <input
                  ref={inputRef}
                  style={S.scanInput}
                  type="text"
                  placeholder="Scan or type Parcel ID…"
                  value={scanInput}
                  onChange={e => setScanInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={scanning || allExpected.length === 0}
                />
                <button
                  style={{ ...S.scanBtn, ...(scanning ? { opacity: 0.7 } : {}) }}
                  onClick={handleScan}
                  disabled={scanning || !scanInput.trim()}
                >
                  {scanning ? "…" : "Mark Received"}
                </button>
              </div>
            )}

            {/* ── Submit result: Missing parcels section ── */}
            {submitResult && submitResult.isAllParcelReceived === 0 && (
              <div style={S.missingBox}>
                <div style={S.missingTitle}>
                  ⚠️ {submitResult.missingCount} Missing Parcel{submitResult.missingCount !== 1 ? "s" : ""} — To Collect
                </div>
                <div style={S.missingGrid}>
                  {submitResult.missing.map(id => (
                    <div key={id} style={S.missingCard}>
                      <a href={`https://hq.delhivery.com/p/pntrzz/${id}`} target="_blank" rel="noopener noreferrer" style={S.missingLink}>
                        {id}
                      </a>
                      <span style={{ color: "#f87171", fontSize: 16 }}>❌</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Parcel grid ── */}
            {allExpected.length === 0 ? (
              <div style={S.centerMsg}>No undelivered / pickup-not-completed parcels on record.</div>
            ) : (
              <div style={S.listWrapper}>
                {/* Section headers */}
                {session.undelivered.length > 0 && (
                  <div style={S.sectionLabel}>🚫 Undelivered ({session.undelivered.length})</div>
                )}
                <div style={S.grid}>
                  {session.undelivered.map(id => (
                    <ParcelCard key={id} id={id} received={scannedSet.has(id)} />
                  ))}
                </div>
                {session.pickupNotCompleted.length > 0 && (
                  <div style={{ ...S.sectionLabel, marginTop: 12 }}>📬 Pickup Not Completed ({session.pickupNotCompleted.length})</div>
                )}
                <div style={S.grid}>
                  {session.pickupNotCompleted.map(id => (
                    <ParcelCard key={id} id={id} received={scannedSet.has(id)} />
                  ))}
                </div>
              </div>
            )}

            {/* ── Footer ── */}
            <div style={S.footer}>
              <button style={S.cancelBtn} onClick={handleClose}>
                {sessionAlreadySubmitted ? "Close" : "Cancel"}
              </button>
              {!sessionAlreadySubmitted && (
                <button
                  style={{
                    ...S.submitBtn,
                    background: allDone
                      ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                      : "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
                    boxShadow: allDone ? "0 4px 14px rgba(16,185,129,0.3)" : "0 4px 14px rgba(239,68,68,0.3)",
                    ...(submitting ? { opacity: 0.7, cursor: "not-allowed" } : {}),
                  }}
                  onClick={handleSubmit}
                  disabled={submitting || allExpected.length === 0}
                >
                  {submitting
                    ? "Submitting…"
                    : allDone
                      ? "✅ Submit — All Received"
                      : `Submit (${notReceivedCount} unscanned)`}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Small card component ─────────────────────────────────────────────────────
function ParcelCard({ id, received }) {
  return (
    <div style={{
      ...SC.card,
      ...(received ? SC.cardReceived : SC.cardPending),
    }}>
      <a
        href={`https://hq.delhivery.com/p/pntrzz/${id}`}
        target="_blank"
        rel="noopener noreferrer"
        style={SC.link}
      >
        {id}
      </a>
      <span style={{ fontSize: 15, flexShrink: 0 }}>{received ? "✔️" : "❌"}</span>
    </div>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const S = {
  overlay: {
    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
    background: "rgba(15,23,42,0.88)", backdropFilter: "blur(6px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 9999,
  },
  modal: {
    background: "linear-gradient(145deg, rgba(22,32,52,0.99) 0%, rgba(15,23,42,0.99) 100%)",
    border: "1.5px solid rgba(148,163,184,0.16)",
    borderRadius: "22px",
    padding: "28px 28px 22px",
    width: "820px",
    maxWidth: "97vw",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    boxShadow: "0 28px 70px rgba(0,0,0,0.55)",
    fontFamily: "'Inter','Segoe UI',sans-serif",
    overflowY: "auto",
  },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  title:  { margin: 0, fontSize: "21px", fontWeight: 800, color: "#fff" },
  sub:    { margin: "5px 0 0", fontSize: "13px", color: "#64748b", display: "flex", alignItems: "center" },
  closeBtn: {
    background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
    color: "#fca5a5", borderRadius: "8px", padding: "6px 13px",
    fontSize: "15px", cursor: "pointer", fontWeight: 700, flexShrink: 0,
  },
  centerMsg: { textAlign: "center", padding: "32px", color: "#475569", fontSize: "14px" },

  summaryRow: { display: "flex", gap: "12px", flexWrap: "wrap" },
  badge:      { display: "flex", alignItems: "center", gap: "8px", padding: "8px 18px", borderRadius: "12px", fontWeight: 600 },
  badgeGreen: { background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.25)", color: "#34d399" },
  badgeRed:   { background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" },
  badgeGray:  { background: "rgba(100,116,139,0.12)", border: "1px solid rgba(100,116,139,0.25)", color: "#94a3b8" },
  badgeNum:   { fontSize: "22px", fontWeight: 800 },
  badgeLbl:   { fontSize: "12px", color: "#94a3b8" },

  scanRow: { display: "flex", gap: "10px" },
  scanInput: {
    flex: 1, padding: "11px 16px", fontSize: "15px", fontWeight: 500,
    color: "#fff", background: "rgba(15,23,42,0.7)",
    border: "1px solid rgba(148,163,184,0.24)", borderRadius: "12px",
    outline: "none", boxSizing: "border-box",
  },
  scanBtn: {
    padding: "11px 22px", fontSize: "14px", fontWeight: 700, color: "#fff",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    border: "none", borderRadius: "12px", cursor: "pointer",
    boxShadow: "0 4px 14px rgba(16,185,129,0.25)", whiteSpace: "nowrap",
  },

  missingBox: {
    background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.25)",
    borderRadius: "14px", padding: "16px 18px",
  },
  missingTitle: {
    color: "#f87171", fontWeight: 700, fontSize: "14px", marginBottom: "12px",
  },
  missingGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: "8px",
    maxHeight: "160px", overflowY: "auto",
  },
  missingCard: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "8px 12px", borderRadius: "10px",
    background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
  },
  missingLink: {
    textDecoration: "none", color: "#fca5a5", fontWeight: 700,
    fontSize: "12px", fontFamily: "monospace", wordBreak: "break-all",
  },

  sectionLabel: { color: "#94a3b8", fontSize: "12px", fontWeight: 700, letterSpacing: "0.5px", marginBottom: "8px", textTransform: "uppercase" },
  listWrapper: {
    border: "1px solid rgba(148,163,184,0.1)", borderRadius: "14px",
    padding: "14px 14px 10px", background: "rgba(15,23,42,0.35)",
    overflowY: "auto", maxHeight: "320px",
  },
  grid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "8px", marginBottom: "4px",
  },

  footer: { display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "4px" },
  cancelBtn: {
    padding: "11px 24px", background: "rgba(100,116,139,0.15)",
    border: "1px solid rgba(100,116,139,0.3)", color: "#94a3b8",
    borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: "pointer",
  },
  submitBtn: {
    padding: "11px 28px", border: "none", borderRadius: "10px",
    color: "#fff", fontSize: "14px", fontWeight: 700, cursor: "pointer",
    transition: "transform 0.15s, box-shadow 0.15s",
  },
};

const SC = {
  card: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "9px 12px", borderRadius: "10px", fontSize: "12px", fontFamily: "monospace",
    transition: "background 0.15s",
  },
  cardPending: {
    background: "linear-gradient(135deg, rgba(31,41,55,0.8) 0%, rgba(15,23,42,0.95) 100%)",
    border: "1px solid rgba(59,130,246,0.15)",
  },
  cardReceived: {
    background: "rgba(16,185,129,0.07)",
    border: "1px solid rgba(16,185,129,0.3)",
  },
  link: {
    textDecoration: "none", color: "#60a5fa", fontWeight: 700,
    fontSize: "12px", wordBreak: "break-all",
  },
};
