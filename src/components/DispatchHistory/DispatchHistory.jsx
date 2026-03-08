import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ScanUndeliveredModal from "./ScanUndeliveredModal";
import CashManagementModal from "./CashManagementModal";
import CompleteCashModal from "./CompleteCashModal";

// Status → tab mapping
const TAB_STATUSES = {
  parcels:   [0, 1, 2],          // Fetched / Seat Begin / Seat InProgress
  cash:      [3, 4, 5],          // Seat Closed / Cash Begin / Cash Receiving
  completed: [6, 7, 8],          // Completed / Parcels Missing / Sort Cash
};

const STATUS_LABEL = {
  0: "Fetched", 1: "Scanning", 2: "Seat InProgress",
  3: "Submitted", 4: "Cash Begin", 5: "Cash Receiving",
  6: "Completed", 7: "Parcels Missing", 8: "Sort Cash",
};

const STATUS_COLOR = {
  0: "#64748b", 1: "#f59e0b", 2: "#3b82f6",
  3: "#8b5cf6", 4: "#f59e0b", 5: "#a855f7",
  6: "#10b981", 7: "#f87171", 8: "#94a3b8",
};

const TABS = [
  { key: "parcels",   label: "📦 Parcels Management" },
  { key: "cash",      label: "💰 Cash Management"    },
  { key: "completed", label: "✅ Completed"           },
];

const copy = (text, label) =>
  navigator.clipboard.writeText(text)
    .then(() => toast.success(`✅ ${label} copied!`, { autoClose: 1800 }))
    .catch(() => toast.error("Copy failed"));

// ─────────────────────────────────────────────────────────────────────────────
export default function DispatchHistory() {
  const [allDispatches, setAllDispatches] = useState([]);
  const [summary,       setSummary]       = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [syncing,       setSyncing]       = useState(false);
  const [activeTab,     setActiveTab]     = useState("parcels");
  const [expandedId,    setExpandedId]    = useState(null);
  const [page,          setPage]          = useState(1);
  const [totalPages,    setTotalPages]    = useState(1);
  const [filterDate,    setFilterDate]    = useState(
    new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [isCompleteCashOpen, setIsCompleteCashOpen] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState(null);
  const limit = 50;

  const fetchHistory = useCallback(async (date, pg) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/rider-history/register-dispatch-history`,
        { params: { date, page: pg, limit } }
      );
      if (res.data.success) {
        setAllDispatches(res.data.dispatches || []);
        setSummary(res.data.summary);
        setTotalPages(res.data.summary?.totalPages || 1);
      } else {
        toast.error(res.data.message || "Failed to fetch"); setAllDispatches([]);
      }
    } catch { toast.error("Server error"); setAllDispatches([]); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { fetchHistory(filterDate, page); }, [filterDate, page, fetchHistory]);

  const handleSync = async () => {
    setSyncing(true);
    const tid = toast.loading("Syncing from Delhivery…");
    try {
      const res = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/api/rider-history/register-dispatch-history`,
        { date: filterDate, page: 1, page_size: 50 }
      );
      toast.update(tid, {
        render: res.data.success
          ? `✅ Done! Inserted: ${res.data.summary?.database?.inserted ?? 0}`
          : res.data.message || "Sync failed",
        type: res.data.success ? "success" : "error",
        isLoading: false, autoClose: 3000,
      });
      if (res.data.success) fetchHistory(filterDate, page);
    } catch { toast.update(tid, { render: "Server error", type: "error", isLoading: false, autoClose: 3000 }); }
    finally  { setSyncing(false); }
  };

  // Tab-filtered list
  const tabStatuses = TAB_STATUSES[activeTab];
  const tabRows = allDispatches.filter(d => tabStatuses.includes(d.status));

  // Tab badge counts
  const tabCounts = Object.fromEntries(
    TABS.map(t => [t.key, allDispatches.filter(d => TAB_STATUSES[t.key].includes(d.status)).length])
  );

  const completeZeroItems = async (dispatchId) => {
    try {
      const BASE = process.env.REACT_APP_BASE_URL;
      const res = await axios.post(`${BASE}/api/rider-history/scan-session/submit/${dispatchId}`);
      if (res.data.success) {
        toast.success("✅ Marked as Complete (No Parcels to Scan)", { autoClose: 2000 });
        fetchHistory(filterDate, page);
      } else {
        toast.error("Failed to complete dispatch");
      }
    } catch (e) {
      toast.error("Server error submitting dispatch");
      console.error(e);
    }
  };

  return (
    <div style={S.page}>
      <ToastContainer position="top-right" theme="dark" />
      <style>{`@keyframes fd{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Dispatch History</h1>
          <p style={S.sub}>🕒 {filterDate}</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <input type="date" style={S.dateInput} value={filterDate}
            onChange={e => { setFilterDate(e.target.value); setPage(1); setExpandedId(null); }} />
          <button style={S.syncBtn} onClick={handleSync} disabled={syncing}>
            {syncing ? "🔄 Syncing…" : "☁️ Sync"}
          </button>
          {/* Bulk Pickup Copy — copies all pickupCompleted waybills from loaded dispatches */}
          <button
            style={S.scanUndeliveredBtn}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(239,68,68,0.45)";
              e.currentTarget.style.background = "linear-gradient(135deg, #f87171 0%, #ef4444 100%)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(239,68,68,0.35)";
              e.currentTarget.style.background = "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)";
            }}
            onMouseDown={e => { e.currentTarget.style.transform = "translateY(0)"; }}
            onClick={() => {
              const all = allDispatches.flatMap(d => d.pickupCompleted || []);
              if (all.length === 0) { toast.info("No pickup completed waybills found."); return; }
              copy(all.join(", "), `${all.length} Pickup Completed waybills`);
            }}
          >
            <span style={{ fontSize: "16px" }}>📋</span>
            Bulk Pickup Copy
          </button>
        </div>
      </div>

      {/* Stat row */}
      {summary && (
        <div style={S.statRow}>
          {[
            { label: "Dispatches", val: summary.totalDispatches, col: "#60a5fa" },
            { label: "Packages",   val: summary.totalPackages,   col: "#a78bfa" },
            { label: "Delivered",  val: summary.totalDelivered,  col: "#34d399" },
            { label: "Undelivered",val: summary.totalUndelivered,col: "#f87171" },
          ].map(c => (
            <div key={c.label} style={S.stat}>
              <span style={{ fontSize: 26, fontWeight: 800, color: c.col }}>{c.val ?? 0}</span>
              <span style={S.statLbl}>{c.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={S.tabBar}>
        {TABS.map(t => (
          <button
            key={t.key}
            style={{ ...S.tab, ...(activeTab === t.key ? S.tabActive : {}) }}
            onClick={() => { setActiveTab(t.key); setExpandedId(null); }}
          >
            {t.label}
            <span style={{
              ...S.tabBadge,
              background: activeTab === t.key ? "rgba(255,255,255,0.25)" : "rgba(148,163,184,0.15)",
            }}>
              {tabCounts[t.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={S.tableWrap}>
        {loading ? (
          <div style={S.empty}>Loading…</div>
        ) : tabRows.length === 0 ? (
          <div style={S.empty}>No records in this section for {filterDate}.</div>
        ) : (
          <table style={S.table}>
            <thead>
              <tr>
                {activeTab === "cash" ? (
                  ["Dispatch ID", "Name", "Pkgs", "Delivered", "RVP", "Expected COD", "Received Cash", "Online", "Sort COD", "Action"].map(h => <th key={h} style={S.th}>{h}</th>)
                ) : activeTab === "completed" ? (
                  ["Dispatch ID", "Name", "Pkgs", "Delivered", "RVP", "Expected COD", "Received Cash", "Online", "Sort COD", "Status"].map(h => <th key={h} style={S.th}>{h}</th>)
                ) : (
                  ["Dispatch ID", "Name", "Pkgs", "Delivered", "RVP", "Undelivered", "RVP Pending", "COD", "Action"].map(h => <th key={h} style={S.th}>{h}</th>)
                )}
              </tr>
            </thead>
            <tbody>
              {tabRows.map((d, i) => (
                <React.Fragment key={d._id || i}>
                  <tr
                    style={{
                      ...S.tr,
                      borderLeft: `4px solid ${STATUS_COLOR[d.status] ?? "#475569"}`,
                      background: expandedId === d._id
                        ? "rgba(59,130,246,0.09)" : i % 2 === 0
                        ? "rgba(15,23,42,0.5)" : "rgba(20,30,50,0.4)",
                    }}
                    onClick={() => setExpandedId(expandedId === d._id ? null : d._id)}
                  >
                    {/* Dispatch ID */}
                    <td style={{ ...S.td, fontFamily: "monospace", color: "#93c5fd" }}>{d.dispatchId}</td>
                    {/* Name */}
                    <td style={S.td}>{d.feName}</td>
                    {/* Pkgs */}
                    <td style={{ ...S.td, fontWeight: 700 }}>{d.totalPackages}</td>
                    {/* Delivered */}
                    <td style={S.td}><Num n={d.deliveredCount} good /></td>
                    {/* RVP = pickupCompleted */}
                    <td style={S.td}><Num n={d.pickupCompletedCount} warn /></td>

                    {activeTab === "parcels" && (
                      <>
                        {/* Undelivered */}
                        <td style={S.td}><Num n={d.undeliveredCount} bad /></td>
                        {/* RVP Pending = pickupNotCompleted */}
                        <td style={S.td}><Num n={d.pickupNotCompletedCount} bad /></td>
                        {/* COD */}
                        <td style={{ ...S.td, color: "#fbbf24", fontWeight: 700 }}>
                          {d.expected_cod_amount > 0 ? `₹${d.expected_cod_amount}` : <span style={{ color: "#64748b" }}>0</span>}
                        </td>
                        {/* Action — Scan Undelivered */}
                        <td style={{ ...S.td, whiteSpace: "nowrap" }} onClick={e => e.stopPropagation()}>
                          <ScanRowButton
                            status={d.status}
                            hasItems={(d.undelivered?.length || 0) + (d.pickupNotCompleted?.length || 0) > 0}
                            onClick={() => { setSelectedDispatch(d); setIsScanModalOpen(true); }}
                            onComplete={() => completeZeroItems(d._id)}
                          />
                        </td>
                      </>
                    )}

                    {activeTab === "cash" && (
                      <>
                        <td style={{ ...S.td, color: "#fbbf24", fontWeight: 700 }}>
                          {d.expected_cod_amount > 0 ? `₹${d.expected_cod_amount}` : <span style={{ color: "#64748b" }}>0</span>}
                        </td>
                        <td style={S.td}><Num n={d.receivedCash} good /></td>
                        <td style={S.td}><Num n={d.receivedOnline} good /></td>
                        <td style={S.td}>{d.sortCOD > 0 ? `₹${d.sortCOD}` : "—"}</td>
                        <td style={{ ...S.td, whiteSpace: "nowrap" }} onClick={e => e.stopPropagation()}>
                           <div style={{ display: "flex", gap: "8px" }}>
                             <button onClick={() => { setSelectedDispatch(d); setIsCashModalOpen(true); }} style={{...S.manageBtn, background: d.status === 5 ? "rgba(100,116,139,0.2)" : S.manageBtn.background, color: d.status === 5 ? "#94a3b8" : "#fff", boxShadow: d.status === 5 ? "none" : S.manageBtn.boxShadow }}>
                               Manage
                             </button>
                             {d.status === 5 && (
                               <button onClick={() => { setSelectedDispatch(d); setIsCompleteCashOpen(true); }} style={S.completeBtn}>
                                 Complete
                               </button>
                             )}
                           </div>
                        </td>
                      </>
                    )}

                    {activeTab === "completed" && (
                      <>
                        <td style={{ ...S.td, color: "#fbbf24", fontWeight: 700 }}>
                          {d.expected_cod_amount > 0 ? `₹${d.expected_cod_amount}` : <span style={{ color: "#64748b" }}>0</span>}
                        </td>
                        <td style={S.td}><Num n={d.receivedCash} good /></td>
                        <td style={S.td}><Num n={d.receivedOnline} good /></td>
                        <td style={S.td}>{d.sortCOD > 0 ? `₹${d.sortCOD}` : "—"}</td>
                        <td style={S.td}>
                          <span style={{ padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${STATUS_COLOR[d.status]}22`, color: STATUS_COLOR[d.status] ?? "#94a3b8", border: `1px solid ${STATUS_COLOR[d.status]}55` }}>
                            {STATUS_LABEL[d.status] || `State ${d.status}`}
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
            <span style={{ color: "#64748b", fontSize: 13 }}>Page {page} / {totalPages}</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={S.pgBtn} disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <button style={S.pgBtn} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes fd{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Scan Undelivered Modal — single dispatch */}
      <ScanUndeliveredModal
        isOpen={isScanModalOpen}
        onClose={() => {
          setIsScanModalOpen(false);
          setSelectedDispatch(null);
          fetchHistory(filterDate, page);
        }}
        dispatch={selectedDispatch}
      />

      {/* Cash Management Modal (Step 1) */}
      {isCashModalOpen && (
        <CashManagementModal
          isOpen={isCashModalOpen}
          onClose={() => {
            setIsCashModalOpen(false);
            setSelectedDispatch(null);
            fetchHistory(filterDate, page);
          }}
          dispatch={selectedDispatch}
        />
      )}

      {/* Complete Cash Modal (Step 2) */}
      {isCompleteCashOpen && (
        <CompleteCashModal
          isOpen={isCompleteCashOpen}
          onClose={() => {
            setIsCompleteCashOpen(false);
            setSelectedDispatch(null);
            fetchHistory(filterDate, page);
          }}
          dispatch={selectedDispatch}
        />
      )}
    </div>
  );
}


function WBBox({ title, accent, items = [], copyLabel }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: "rgba(15,23,42,0.5)", border: `1px solid rgba(148,163,184,0.08)`, borderTop: `2px solid ${accent}`, borderRadius: 9, padding: "10px 12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: accent }}>{title} <span style={{ color: "#e2e8f0" }}>({items.length})</span></span>
        {items.length > 0 && (
          <div style={{ display: "flex", gap: 5 }}>
            <Mb col={accent} onClick={() => copy(items.join(", "), copyLabel)}>📋 Copy</Mb>
            <Mb col="#475569" onClick={() => setOpen(o => !o)}>{open ? "▲" : "▼"}</Mb>
          </div>
        )}
      </div>
      {open && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, maxHeight: 110, overflowY: "auto" }}>
          {items.map(w => (
            <span key={w} onClick={() => copy(w, w)} title="Click to copy"
              style={{ background: "rgba(30,41,59,0.9)", border: "1px solid rgba(148,163,184,0.1)", borderRadius: 4, padding: "2px 6px", fontSize: 10, fontFamily: "monospace", color: "#94a3b8", cursor: "pointer" }}>
              {w}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tiny helpers ─────────────────────────────────────────────────────────────
function CopyBtn({ label, data, col }) {
  return (
    <button style={{ marginRight: 5, padding: "3px 9px", background: "transparent", border: `1px solid ${col}`, borderRadius: 6, color: col, fontSize: 11, fontWeight: 600, cursor: "pointer" }}
      onClick={() => copy(data.join(", "), label)}>
      {label}
    </button>
  );
}

function Mb({ col, onClick, children }) {
  return (
    <button onClick={onClick} style={{ padding: "2px 8px", background: "transparent", border: `1px solid ${col}55`, borderRadius: 5, color: col, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
      {children}
    </button>
  );
}

function Num({ n, good, bad, warn }) {
  if (!n) return <span style={{ color: "#64748b", fontWeight: 700 }}>0</span>;
  const col = good ? "#34d399" : bad ? "#f87171" : "#fbbf24";
  return <span style={{ padding: "2px 8px", borderRadius: 6, fontSize: 12, fontWeight: 700, color: col, background: `${col}18` }}>{n}</span>;
}

// ── Per-row scan button — label + color react to dispatch status ───────────────
function ScanRowButton({ status, hasItems, onClick, onComplete }) {
  if (status === 0 && !hasItems) {
    return (
      <button
        onClick={onComplete}
        style={{
          padding: "5px 12px", border: "none", borderRadius: 7,
          background: "linear-gradient(135deg,#10b981,#059669)",
          color: "#fff",
          fontSize: 12, fontWeight: 700, cursor: "pointer",
          boxShadow: "0 2px 8px rgba(16,185,129,0.3)",
          whiteSpace: "nowrap", transition: "all 0.15s",
        }}
      >
        ✅ Complete
      </button>
    );
  }

  const cfg = {
    0: { label: "📦 Scan Undelivered", bg: "linear-gradient(135deg,#3b82f6,#2563eb)", shadow: "rgba(59,130,246,0.3)" },
    1: { label: "🔄 Continue Scanning", bg: "linear-gradient(135deg,#f59e0b,#d97706)", shadow: "rgba(245,158,11,0.3)" },
    2: { label: "🔄 Continue Scanning", bg: "linear-gradient(135deg,#f59e0b,#d97706)", shadow: "rgba(245,158,11,0.3)" },
    3: { label: "✅ Submitted",          bg: "linear-gradient(135deg,#10b981,#059669)", shadow: "rgba(16,185,129,0.3)" },
  };
  const c = cfg[status] ?? cfg[0];
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 12px", border: "none", borderRadius: 7,
        background: c.bg,
        color: "#fff",
        fontSize: 12, fontWeight: 700, cursor: "pointer",
        boxShadow: `0 2px 8px ${c.shadow}`,
        whiteSpace: "nowrap", transition: "all 0.15s",
      }}
    >
      {c.label}
    </button>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  page:      { padding: "22px 26px", background: "linear-gradient(135deg,#0f172a,#1a2540)", minHeight: "100vh", color: "#e2e8f0", fontFamily: "'Inter','Segoe UI',sans-serif" },
  header:    { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 },
  title:     { fontSize: 24, fontWeight: 800, color: "#fff", margin: 0 },
  sub:       { color: "#475569", fontSize: 13, margin: "3px 0 0" },
  dateInput: { padding: "9px 13px", borderRadius: 8, background: "rgba(15,23,42,0.8)", border: "1px solid rgba(148,163,184,0.2)", color: "#fff", fontSize: 14, outline: "none" },
  syncBtn:   { padding: "9px 18px", background: "linear-gradient(135deg,#3b82f6,#2563eb)", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 12px rgba(37,99,235,0.3)", height: 40 },
  scanUndeliveredBtn: {
    display: "inline-flex", alignItems: "center", gap: 8,
    background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
    color: "#fff", border: "none", padding: "9px 20px",
    borderRadius: 8, fontSize: 14, fontWeight: 700,
    cursor: "pointer", transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(239,68,68,0.35)",
    letterSpacing: "0.3px", height: 40,
  },
  manageBtn: {
    padding: "6px 14px", border: "none", borderRadius: 8,
    background: "linear-gradient(135deg,#8b5cf6,#6d28d9)",
    color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
    boxShadow: "0 4px 12px rgba(139,92,246,0.3)", transition: "all 0.15s"
  },
  completeBtn: {
    padding: "6px 14px", border: "none", borderRadius: 8,
    background: "linear-gradient(135deg,#10b981,#059669)",
    color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
    boxShadow: "0 4px 12px rgba(16,185,129,0.3)", transition: "all 0.15s"
  },
  statRow:   { display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" },
  stat:      { flex: "1 1 120px", background: "rgba(30,41,59,0.7)", border: "1px solid rgba(148,163,184,0.12)", borderRadius: 10, padding: "12px 16px", display: "flex", flexDirection: "column", gap: 3 },
  statLbl:   { fontSize: 11, color: "#475569", fontWeight: 700, textTransform: "uppercase" },
  tabBar:    { display: "flex", gap: 8, marginBottom: 16, borderBottom: "1px solid rgba(148,163,184,0.1)", paddingBottom: 12 },
  tab:       { padding: "9px 18px", background: "rgba(30,41,59,0.5)", border: "1px solid rgba(148,163,184,0.15)", borderRadius: 8, color: "#94a3b8", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all .15s" },
  tabActive: { background: "rgba(59,130,246,0.18)", border: "1px solid rgba(59,130,246,0.4)", color: "#60a5fa" },
  tabBadge:  { padding: "1px 7px", borderRadius: 20, fontSize: 11, fontWeight: 700 },
  tableWrap: { background: "rgba(30,41,59,0.6)", border: "1px solid rgba(148,163,184,0.12)", borderRadius: 14, padding: 18, overflowX: "auto" },
  table:     { width: "100%", borderCollapse: "separate", borderSpacing: "0 5px" },
  th:        { padding: "9px 13px", color: "#475569", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid rgba(148,163,184,0.08)", whiteSpace: "nowrap" },
  tr:        { cursor: "pointer", transition: "background .12s" },
  td:        { padding: "12px 13px", fontSize: 13, color: "#e2e8f0" },
  empty:     { textAlign: "center", padding: 44, color: "#475569" },
  pgBtn:     { padding: "7px 14px", background: "rgba(30,41,59,0.8)", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 6, color: "#e2e8f0", cursor: "pointer", fontSize: 13 },
};
