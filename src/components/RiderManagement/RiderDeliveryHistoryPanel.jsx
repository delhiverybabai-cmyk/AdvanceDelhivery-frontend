import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const BASE = process.env.REACT_APP_BASE_URL;

/* ─── tiny helpers ───────────────────────────────────────────── */
const fmt = (n) => `₹${Number(n ?? 0).toLocaleString("en-IN")}`;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");
const today = () => new Date().toISOString().split("T")[0];

/* ═══════════════════════════════════════════════════════════════ */
export default function RiderDeliveryHistoryPanel({ riders = [] }) {
  const [selectedRider, setSelectedRider] = useState("");
  const [historyRows, setHistoryRows] = useState([]);
  const [totals, setTotals] = useState(null);
  const [paidHistory, setPaidHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // sub-tabs
  const [subTab, setSubTab] = useState("history"); // history | paid | adjust

  // Add-history modal
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    riderId: "",
    assignedParcels: "",
    successfulDelivered: "",
    successfulRVP: "",
    canceledByCode: "",
    parcelsReturnInHub: "",
    cashedDeposited: "",
    perParcelRate: "",
    selectedDate: today(),
  });
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  // Edit-date modal
  const [editRow, setEditRow] = useState(null);
  const [editDate, setEditDate] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Adjust (debit / credit)
  const [adjustForm, setAdjustForm] = useState({ amount: "", note: "", type: "debit" });
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [adjustMsg, setAdjustMsg] = useState("");

  /* ── fetch helpers ── */
  const fetchHistory = useCallback(async (riderId) => {
    setLoading(true);
    try {
      const url = riderId
        ? `${BASE}/api/rider-payment/get-all-delivery-payment-history?riderId=${riderId}`
        : `${BASE}/api/rider-payment/get-all-delivery-payment-history`;
      const res = await axios.get(url);
      setHistoryRows(res.data?.data ?? []);
    } catch { setHistoryRows([]); }
    setLoading(false);
  }, []);

  const fetchTotals = useCallback(async (riderId) => {
    if (!riderId) { setTotals(null); return; }
    try {
      const res = await axios.get(`${BASE}/api/rider-payment/total-amount/${riderId}`);
      setTotals(res.data?.data ?? null);
    } catch { setTotals(null); }
  }, []);

  const fetchPaidHistory = useCallback(async (riderId) => {
    if (!riderId) { setPaidHistory([]); return; }
    try {
      const res = await axios.get(`${BASE}/api/rider-payment/paid-history/${riderId}`);
      setPaidHistory(res.data?.data ?? []);
    } catch { setPaidHistory([]); }
  }, []);

  useEffect(() => {
    fetchHistory(selectedRider);
    fetchTotals(selectedRider);
    fetchPaidHistory(selectedRider);
  }, [selectedRider, fetchHistory, fetchTotals, fetchPaidHistory]);

  /* ── add history ── */
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddLoading(true); setAddError("");
    try {
      await axios.post(`${BASE}/api/rider-payment/delivery-payment-history`, {
        ...addForm,
        riderId: addForm.riderId || selectedRider,
        assignedParcels:      Number(addForm.assignedParcels),
        successfulDelivered:  Number(addForm.successfulDelivered),
        successfulRVP:        Number(addForm.successfulRVP),
        canceledByCode:       Number(addForm.canceledByCode),
        parcelsReturnInHub:   Number(addForm.parcelsReturnInHub),
        cashedDeposited:      Number(addForm.cashedDeposited),
        perParcelRate:        Number(addForm.perParcelRate),
      });
      setShowAdd(false);
      fetchHistory(selectedRider);
      fetchTotals(selectedRider);
    } catch (err) {
      setAddError(err.response?.data?.error || err.message);
    }
    setAddLoading(false);
  };

  /* ── edit date ── */
  const handleEditDate = async () => {
    if (!editRow || !editDate) return;
    setEditLoading(true);
    try {
      await axios.put(`${BASE}/api/rider-payment/delivery-payment-history/${editRow._id}`, {
        selectedDate: editDate,
      });
      setEditRow(null);
      fetchHistory(selectedRider);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
    setEditLoading(false);
  };

  /* ── debit / credit ── */
  const handleAdjust = async (e) => {
    e.preventDefault();
    if (!selectedRider) return;
    setAdjustLoading(true); setAdjustMsg("");
    const endpoint = adjustForm.type === "debit"
      ? `${BASE}/api/rider-payment/debt-borrow/${selectedRider}`
      : `${BASE}/api/rider-payment/debt-repay/${selectedRider}`;
    try {
      await axios.put(endpoint, {
        amount: Number(adjustForm.amount),
        note: adjustForm.note,
      });
      setAdjustMsg(`✅ ${adjustForm.type === "debit" ? "Debit" : "Credit"} of ${fmt(adjustForm.amount)} recorded`);
      setAdjustForm({ amount: "", note: "", type: adjustForm.type });
      fetchTotals(selectedRider);
      fetchPaidHistory(selectedRider);
    } catch (err) {
      setAdjustMsg(`❌ ${err.response?.data?.error || err.message}`);
    }
    setAdjustLoading(false);
  };

  /* ── render ── */
  return (
    <div style={s.wrap}>
      {/* ─── filter row ─── */}
      <div style={s.filterRow}>
        <select style={s.select} value={selectedRider} onChange={(e) => setSelectedRider(e.target.value)}>
          <option value="">All Riders</option>
          {riders.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
        </select>

        {totals && (
          <div style={s.totalsRow}>
            <span style={s.chip}>💰 Credit: {fmt(totals.totalCredit)}</span>
            <span style={{ ...s.chip, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>🔻 Debit: {fmt(totals.totalDebit)}</span>
            <span style={{ ...s.chip, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc" }}>⚖️ Balance: {fmt(totals.balance)}</span>
          </div>
        )}

        <button style={s.addBtn} onClick={() => { setAddForm({ ...addForm, riderId: selectedRider, selectedDate: today() }); setShowAdd(true); }}>+ Add Entry</button>
      </div>

      {/* ─── sub-tabs ─── */}
      <div style={s.subTabBar}>
        {["history", "paid", "adjust"].map((t) => (
          <button key={t} style={{ ...s.subTab, ...(subTab === t ? s.subTabActive : {}) }} onClick={() => setSubTab(t)}>
            {{ history: "📋 Delivery History", paid: "💳 Paid History", adjust: "⚙️ Debit / Credit" }[t]}
          </button>
        ))}
      </div>

      {/* ─── HISTORY table ─── */}
      {subTab === "history" && (
        loading ? <div style={s.empty}>Loading…</div> :
        historyRows.length === 0 ? <div style={s.empty}>No delivery history found.</div> :
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                {["Date","Rider","Assigned","Delivered","RVP","Cancelled","Return","Cashed","Earning","Paid","Edit"].map((h) => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {historyRows.map((row) => {
                const riderName = riders.find((r) => r._id === (row.riderId?._id ?? row.riderId))?.name ?? "—";
                return (
                  <tr key={row._id} style={s.tr}>
                    <td style={s.td}>{fmtDate(row.createdAt)}</td>
                    <td style={s.td}>{riderName}</td>
                    <td style={s.tdNum}>{row.assignedParcels}</td>
                    <td style={s.tdNum}>{row.successfulDelivered}</td>
                    <td style={s.tdNum}>{row.successfulRVP}</td>
                    <td style={s.tdNum}>{row.canceledByCode}</td>
                    <td style={s.tdNum}>{row.parcelsReturnInHub}</td>
                    <td style={s.tdNum}>{fmt(row.cashedDeposited)}</td>
                    <td style={{ ...s.tdNum, color: "#34d399", fontWeight: 700 }}>{fmt(row.riderEarning)}</td>
                    <td style={s.td}>
                      <span style={{ ...s.badge, ...(row.isPaid ? s.badgeGreen : s.badgeRed) }}>{row.isPaid ? "Paid" : "Unpaid"}</span>
                    </td>
                    <td style={s.td}>
                      <button style={s.editBtn} onClick={() => { setEditRow(row); setEditDate(row.createdAt?.split("T")[0] ?? today()); }}>📅</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── PAID HISTORY table ─── */}
      {subTab === "paid" && (
        !selectedRider ? <div style={s.empty}>Select a rider to view paid history.</div> :
        paidHistory.length === 0 ? <div style={s.empty}>No transaction history.</div> :
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                {["Date","Type","Amount","Note"].map((h) => <th key={h} style={s.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {paidHistory.map((row) => (
                <tr key={row._id} style={s.tr}>
                  <td style={s.td}>{fmtDate(row.createdAt)}</td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, ...(row.type === "credit" ? s.badgeGreen : s.badgeRed) }}>{row.type}</span>
                  </td>
                  <td style={{ ...s.tdNum, color: row.type === "credit" ? "#34d399" : "#f87171", fontWeight: 700 }}>
                    {row.type === "credit" ? "+" : "−"}{fmt(row.amount)}
                  </td>
                  <td style={{ ...s.td, maxWidth: 280, whiteSpace: "normal", fontSize: 12, color: "#94a3b8" }}>{row.note || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── ADJUST (debit / credit) ─── */}
      {subTab === "adjust" && (
        <div style={s.adjustWrap}>
          {!selectedRider && <div style={s.empty}>Select a rider first.</div>}
          {selectedRider && (
            <form style={s.adjustForm} onSubmit={handleAdjust}>
              <div style={s.typeToggle}>
                {["debit", "credit"].map((t) => (
                  <button key={t} type="button"
                    style={{ ...s.typeBtn, ...(adjustForm.type === t ? (t === "debit" ? s.typeBtnDebit : s.typeBtnCredit) : {}) }}
                    onClick={() => setAdjustForm({ ...adjustForm, type: t })}>
                    {t === "debit" ? "🔻 Debit" : "✅ Credit"}
                  </button>
                ))}
              </div>
              <input style={s.input} type="number" min="1" placeholder="Amount (₹)" value={adjustForm.amount}
                onChange={(e) => setAdjustForm({ ...adjustForm, amount: e.target.value })} required />
              <input style={s.input} type="text" placeholder="Note / Reason" value={adjustForm.note}
                onChange={(e) => setAdjustForm({ ...adjustForm, note: e.target.value })} />
              <button style={{ ...s.saveBtn, background: adjustForm.type === "debit" ? "linear-gradient(135deg,#ef4444,#b91c1c)" : "linear-gradient(135deg,#10b981,#059669)" }}
                type="submit" disabled={adjustLoading}>
                {adjustLoading ? "Saving…" : `Apply ${adjustForm.type}`}
              </button>
              {adjustMsg && <div style={{ marginTop: 10, fontSize: 13, color: adjustMsg.startsWith("✅") ? "#34d399" : "#f87171" }}>{adjustMsg}</div>}
            </form>
          )}
        </div>
      )}

      {/* ─── ADD MODAL ─── */}
      {showAdd && (
        <div style={s.overlay} onClick={() => setShowAdd(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={s.modalTitle}>Add Delivery History</h3>
            <form onSubmit={handleAddSubmit}>
              {/* Rider select if none chosen globally */}
              {!selectedRider && (
                <div style={s.formRow}>
                  <label style={s.label}>Rider</label>
                  <select style={s.input} value={addForm.riderId} onChange={(e) => setAddForm({ ...addForm, riderId: e.target.value })} required>
                    <option value="">Select rider</option>
                    {riders.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
                  </select>
                </div>
              )}
              <div style={s.formRow}>
                <label style={s.label}>Date</label>
                <input style={s.input} type="date" max={today()} value={addForm.selectedDate}
                  onChange={(e) => setAddForm({ ...addForm, selectedDate: e.target.value })} required />
              </div>
              <div style={s.formGrid}>
                {[
                  ["assignedParcels", "Assigned"],
                  ["successfulDelivered", "Delivered"],
                  ["successfulRVP", "RVP"],
                  ["canceledByCode", "Cancelled"],
                  ["parcelsReturnInHub", "Returned"],
                  ["cashedDeposited", "Cash Deposited (₹)"],
                  ["perParcelRate", "Rate/Parcel (₹)"],
                ].map(([key, label]) => (
                  <div key={key} style={s.formRow}>
                    <label style={s.label}>{label}</label>
                    <input style={s.input} type="number" min="0" placeholder="0"
                      value={addForm[key]}
                      onChange={(e) => setAddForm({ ...addForm, [key]: e.target.value })} required />
                  </div>
                ))}
              </div>
              {addError && <div style={{ color: "#f87171", fontSize: 12, marginBottom: 10 }}>{addError}</div>}
              <div style={s.modalActions}>
                <button type="button" style={s.cancelBtn} onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" style={s.saveBtn} disabled={addLoading}>{addLoading ? "Saving…" : "Save Entry"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── EDIT DATE MODAL ─── */}
      {editRow && (
        <div style={s.overlay} onClick={() => setEditRow(null)}>
          <div style={{ ...s.modal, maxWidth: 360 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={s.modalTitle}>Change Entry Date</h3>
            <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 16 }}>
              Current: {fmtDate(editRow.createdAt)}
            </p>
            <input style={s.input} type="date" max={today()} value={editDate}
              onChange={(e) => setEditDate(e.target.value)} />
            <div style={s.modalActions}>
              <button style={s.cancelBtn} onClick={() => setEditRow(null)}>Cancel</button>
              <button style={s.saveBtn} onClick={handleEditDate} disabled={editLoading}>
                {editLoading ? "Saving…" : "Update Date"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── styles ─────────────────────────────────────────────────── */
const s = {
  wrap: { padding: "0" },
  filterRow: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 20 },
  select: {
    padding: "9px 14px", background: "rgba(30,41,59,0.8)", border: "1px solid rgba(148,163,184,0.2)",
    borderRadius: 8, color: "#e2e8f0", fontSize: 14, outline: "none", minWidth: 180,
  },
  totalsRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  chip: {
    padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
    background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#6ee7b7",
  },
  addBtn: {
    marginLeft: "auto", padding: "9px 18px", background: "linear-gradient(135deg,#10b981,#059669)",
    color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer",
  },
  subTabBar: { display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid rgba(148,163,184,0.1)", paddingBottom: 0 },
  subTab: {
    padding: "9px 16px", background: "transparent", border: "none", borderBottom: "2px solid transparent",
    color: "#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
  },
  subTabActive: { color: "#a5b4fc", borderBottomColor: "#6366f1" },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { textAlign: "left", padding: "10px 12px", color: "#475569", fontSize: 11, fontWeight: 700, textTransform: "uppercase", borderBottom: "1px solid rgba(148,163,184,0.12)", whiteSpace: "nowrap" },
  tr: { borderBottom: "1px solid rgba(148,163,184,0.07)" },
  td: { padding: "11px 12px", color: "#cbd5e1", whiteSpace: "nowrap" },
  tdNum: { padding: "11px 12px", color: "#e2e8f0", textAlign: "right", fontVariantNumeric: "tabular-nums" },
  badge: { display: "inline-block", padding: "3px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700 },
  badgeGreen: { background: "rgba(16,185,129,0.15)", color: "#34d399" },
  badgeRed: { background: "rgba(239,68,68,0.15)", color: "#fca5a5" },
  editBtn: { background: "transparent", border: "none", cursor: "pointer", fontSize: 15 },
  empty: { textAlign: "center", padding: "60px 0", color: "#475569", fontSize: 14 },
  adjustWrap: { maxWidth: 480, margin: "0 auto", padding: "32px 0" },
  adjustForm: { display: "flex", flexDirection: "column", gap: 14 },
  typeToggle: { display: "flex", gap: 8 },
  typeBtn: {
    flex: 1, padding: "10px", border: "1px solid rgba(148,163,184,0.2)",
    borderRadius: 8, background: "rgba(30,41,59,0.5)", color: "#94a3b8", cursor: "pointer", fontWeight: 700, fontSize: 13,
  },
  typeBtnDebit: { background: "rgba(239,68,68,0.2)", borderColor: "rgba(239,68,68,0.4)", color: "#f87171" },
  typeBtnCredit: { background: "rgba(16,185,129,0.2)", borderColor: "rgba(16,185,129,0.4)", color: "#34d399" },
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20,
  },
  modal: {
    background: "linear-gradient(145deg,#1e293b,#0f172a)", border: "1px solid rgba(148,163,184,0.15)",
    borderRadius: 16, padding: "28px 32px", width: "100%", maxWidth: 580,
    maxHeight: "90vh", overflowY: "auto",
  },
  modalTitle: { color: "#f1f5f9", fontSize: 18, fontWeight: 800, marginBottom: 20 },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" },
  formRow: { marginBottom: 14 },
  label: { display: "block", color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", marginBottom: 5 },
  input: {
    width: "100%", padding: "9px 12px", background: "rgba(15,23,42,0.6)", border: "1px solid rgba(148,163,184,0.15)",
    borderRadius: 8, color: "#e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box",
  },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 },
  cancelBtn: {
    padding: "9px 18px", background: "rgba(51,65,85,0.5)", border: "1px solid rgba(148,163,184,0.2)",
    borderRadius: 8, color: "#94a3b8", cursor: "pointer", fontSize: 13, fontWeight: 600,
  },
  saveBtn: {
    padding: "9px 22px", background: "linear-gradient(135deg,#10b981,#059669)",
    border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700,
  },
};
