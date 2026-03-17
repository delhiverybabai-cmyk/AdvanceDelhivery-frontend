import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const BASE = process.env.REACT_APP_BASE_URL;

const REASONS = [
  { value: "salary_payment",    label: "Salary Payment" },
  { value: "bonus",             label: "Bonus / Incentive" },
  { value: "advance_paid",      label: "Advance Paid" },
  { value: "advance_recovery",  label: "Advance Recovery" },
  { value: "penalty",           label: "Penalty / Deduction" },
  { value: "adjustment",        label: "Manual Adjustment" },
  { value: "other",             label: "Other" },
];

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const dateStr = (d) =>
  new Date(d).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });

export default function RiderPaymentLedger({ rider, isOpen, onClose }) {
  const [balance,     setBalance]    = useState(null);  // { currentBalance, totalCredits, totalDebits, txCount }
  const [payments,    setPayments]   = useState([]);
  const [totalPages,  setTotalPages] = useState(1);
  const [page,        setPage]       = useState(1);
  const [loadingData, setLoadingData]= useState(false);

  // Manual entry form
  const [showForm, setShowForm]  = useState(false);
  const [form,     setForm]      = useState({ type: "credit", amount: "", reason: "", note: "" });
  const [saving,   setSaving]    = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!rider?._id) return;
    try {
      const res = await axios.get(`${BASE}/api/payments/balance/${rider._id}`);
      if (res.data.success) setBalance(res.data);
    } catch (e) { console.error("fetchBalance error", e.message); }
  }, [rider?._id]);

  const fetchPayments = useCallback(async (pg = 1) => {
    if (!rider?._id) return;
    setLoadingData(true);
    try {
      const res = await axios.get(`${BASE}/api/payments/rider/${rider._id}`, {
        params: { page: pg, limit: 15 },
      });
      if (res.data.success) {
        setPayments(res.data.payments);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (e) { console.error("fetchPayments error", e.message); }
    finally { setLoadingData(false); }
  }, [rider?._id]);

  useEffect(() => {
    if (isOpen && rider?._id) {
      setPage(1);
      fetchBalance();
      fetchPayments(1);
    }
  }, [isOpen, rider?._id, fetchBalance, fetchPayments]);

  const handlePageChange = (pg) => {
    setPage(pg);
    fetchPayments(pg);
  };

  const handleFormChange = (field, val) =>
    setForm((prev) => ({ ...prev, [field]: val }));

  const handleSubmit = async () => {
    if (!form.amount || !form.reason) {
      toast.error("Amount and reason are required");
      return;
    }
    setSaving(true);
    try {
      const res = await axios.post(
        `${BASE}/api/payments/manual/${rider._id}`,
        {
          type:   form.type,
          amount: Number(form.amount),
          reason: form.reason,
          note:   form.note,
        }
      );
      if (res.data.success) {
        toast.success(`✅ ${res.data.message}`, { autoClose: 2500 });
        setForm({ type: "credit", amount: "", reason: "", note: "" });
        setShowForm(false);
        // Refresh both balance and list
        fetchBalance();
        setPage(1);
        fetchPayments(1);
      } else {
        toast.error(res.data.error || "Failed to save payment");
      }
    } catch (e) {
      toast.error(e.response?.data?.error || "Server error");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !rider) return null;

  const bal = balance?.currentBalance ?? 0;
  const balColor = bal >= 0 ? "#34d399" : "#f87171";

  return (
    <div style={S.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={S.modal}>

        {/* Header */}
        <div style={S.header}>
          <div style={S.headerLeft}>
            <div style={S.avatar}>{getInitials(rider.name)}</div>
            <div>
              <div style={S.riderName}>{rider.name}</div>
              <div style={S.riderSub}>💼 Earnings Ledger</div>
            </div>
          </div>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Balance Summary Cards */}
        <div style={S.balanceRow}>
          <div style={S.balCard}>
            <div style={S.balLbl}>Current Balance</div>
            <div style={{ ...S.balVal, color: balColor }}>{fmt(bal)}</div>
          </div>
          <div style={S.balCard}>
            <div style={S.balLbl}>Total Credits</div>
            <div style={{ ...S.balVal, color: "#34d399" }}>{fmt(balance?.totalCredits)}</div>
          </div>
          <div style={S.balCard}>
            <div style={S.balLbl}>Total Debits</div>
            <div style={{ ...S.balVal, color: "#f87171" }}>{fmt(balance?.totalDebits)}</div>
          </div>
          <div style={S.balCard}>
            <div style={S.balLbl}>Transactions</div>
            <div style={{ ...S.balVal, color: "#60a5fa" }}>{balance?.txCount ?? "—"}</div>
          </div>
        </div>

        {/* Add Entry Button */}
        <button
          style={{ ...S.addEntryBtn, ...(showForm ? S.addEntryBtnActive : {}) }}
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? "✕ Cancel Entry" : "＋ Add Credit / Debit"}
        </button>

        {/* Manual Entry Form */}
        {showForm && (
          <div style={S.formBox}>
            {/* Type Toggle */}
            <div style={S.typeToggle}>
              {["credit", "debit"].map((t) => (
                <button
                  key={t}
                  style={{
                    ...S.typeBtn,
                    ...(form.type === t
                      ? t === "credit" ? S.typeBtnCredit : S.typeBtnDebit
                      : {}),
                  }}
                  onClick={() => handleFormChange("type", t)}
                >
                  {t === "credit" ? "💚 Credit" : "🔴 Debit"}
                </button>
              ))}
            </div>
            {/* Amount */}
            <div style={S.formRow}>
              <label style={S.formLbl}>Amount (₹)</label>
              <input
                type="number" min="1" placeholder="0"
                style={S.formInput}
                value={form.amount}
                onChange={(e) => handleFormChange("amount", e.target.value)}
              />
            </div>
            {/* Reason */}
            <div style={S.formRow}>
              <label style={S.formLbl}>Reason</label>
              <select
                style={S.formInput}
                value={form.reason}
                onChange={(e) => handleFormChange("reason", e.target.value)}
              >
                <option value="">— Select Reason —</option>
                {REASONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            {/* Note */}
            <div style={S.formRow}>
              <label style={S.formLbl}>Note (optional)</label>
              <input
                type="text" placeholder="Additional details…"
                style={S.formInput}
                value={form.note}
                onChange={(e) => handleFormChange("note", e.target.value)}
              />
            </div>
            <button
              style={{ ...S.saveBtn, opacity: saving ? 0.6 : 1 }}
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? "Saving…" : `Save ${form.type === "credit" ? "Credit" : "Debit"}`}
            </button>
          </div>
        )}

        {/* Transaction History */}
        <div style={S.listHeader}>
          <span style={S.listTitle}>📋 Transaction History</span>
          {totalPages > 1 && (
            <div style={S.pgRow}>
              <button style={S.pgBtn} disabled={page === 1} onClick={() => handlePageChange(page - 1)}>←</button>
              <span style={S.pgInfo}>{page} / {totalPages}</span>
              <button style={S.pgBtn} disabled={page === totalPages} onClick={() => handlePageChange(page + 1)}>→</button>
            </div>
          )}
        </div>

        <div style={S.txList}>
          {loadingData ? (
            <div style={S.empty}>Loading…</div>
          ) : payments.length === 0 ? (
            <div style={S.empty}>No transactions yet</div>
          ) : (
            payments.map((p) => (
              <div key={p._id} style={S.txRow}>
                <div style={S.txLeft}>
                  <span style={{ ...S.txType, ...(p.type === "credit" ? S.txCredit : S.txDebit) }}>
                    {p.type === "credit" ? "▲" : "▼"}
                  </span>
                  <div>
                    <div style={S.txReason}>{reasonLabel(p.reason)}</div>
                    {p.note && <div style={S.txNote}>{p.note}</div>}
                    <div style={S.txDate}>{dateStr(p.transactionDate)}</div>
                  </div>
                </div>
                <div style={S.txRight}>
                  <div style={{ ...S.txAmount, color: p.type === "credit" ? "#34d399" : "#f87171" }}>
                    {p.type === "credit" ? "+" : "−"}{fmt(p.amount)}
                  </div>
                  <div style={S.txBalance}>Bal: {fmt(p.currentBalance)}</div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

function getInitials(name = "") {
  return name.split(" ").map((s) => s[0]?.toUpperCase() || "").join("").slice(0, 2) || "R";
}

function reasonLabel(reason) {
  const r = REASONS.find((x) => x.value === reason);
  return r ? r.label : reason?.replace(/_/g, " ") || "—";
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  overlay: {
    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
    background: "rgba(10,18,36,0.88)", backdropFilter: "blur(8px)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
  },
  modal: {
    background: "linear-gradient(145deg, rgba(22,32,52,0.99) 0%, rgba(13,20,38,0.99) 100%)",
    border: "1px solid rgba(148,163,184,0.14)", borderRadius: "22px",
    padding: "26px", width: "680px", maxWidth: "95vw", maxHeight: "92vh",
    display: "flex", flexDirection: "column", gap: "18px",
    boxShadow: "0 30px 80px rgba(0,0,0,0.6)", fontFamily: "'Inter','Segoe UI',sans-serif",
    overflowY: "auto",
  },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  headerLeft: { display: "flex", alignItems: "center", gap: 14 },
  avatar: {
    width: 48, height: 48, borderRadius: 14,
    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    color: "#fff", fontWeight: 800, fontSize: 18,
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 4px 12px rgba(59,130,246,0.3)", flexShrink: 0,
  },
  riderName: { fontSize: 18, fontWeight: 800, color: "#f1f5f9" },
  riderSub:  { fontSize: 12, color: "#64748b", marginTop: 3 },
  closeBtn: {
    background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
    color: "#fca5a5", borderRadius: 8, padding: "6px 11px", fontSize: 14, cursor: "pointer", fontWeight: 700,
  },
  // Balance row
  balanceRow: { display: "flex", gap: 12, flexWrap: "wrap" },
  balCard: {
    flex: "1 1 130px", background: "rgba(30,41,59,0.55)", border: "1px solid rgba(148,163,184,0.1)",
    borderRadius: 12, padding: "12px 16px",
  },
  balLbl: { fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 },
  balVal: { fontSize: 22, fontWeight: 800, fontFamily: "monospace" },
  // Add entry button
  addEntryBtn: {
    padding: "10px 20px", borderRadius: 10, border: "1px solid rgba(99,102,241,0.4)",
    background: "rgba(99,102,241,0.1)", color: "#a5b4fc", fontWeight: 700,
    fontSize: 13, cursor: "pointer", alignSelf: "flex-start", transition: "all 0.15s",
  },
  addEntryBtnActive: {
    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5",
  },
  // Form
  formBox: {
    background: "rgba(15,23,42,0.5)", border: "1px solid rgba(148,163,184,0.1)",
    borderRadius: 14, padding: "18px", display: "flex", flexDirection: "column", gap: 14,
  },
  typeToggle: { display: "flex", gap: 10 },
  typeBtn: {
    flex: 1, padding: "10px", borderRadius: 10, border: "1px solid rgba(148,163,184,0.2)",
    background: "rgba(30,41,59,0.5)", color: "#94a3b8", fontWeight: 700, fontSize: 13, cursor: "pointer",
  },
  typeBtnCredit: { background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.4)", color: "#34d399" },
  typeBtnDebit:  { background: "rgba(239,68,68,0.12)",  border: "1px solid rgba(239,68,68,0.4)",  color: "#f87171" },
  formRow: { display: "flex", flexDirection: "column", gap: 6 },
  formLbl: { fontSize: 12, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px" },
  formInput: {
    background: "rgba(15,23,42,0.8)", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 8,
    color: "#e2e8f0", padding: "10px 14px", fontSize: 14, outline: "none", fontFamily: "inherit",
    width: "100%", boxSizing: "border-box",
  },
  saveBtn: {
    padding: "11px 24px", background: "linear-gradient(135deg, #6366f1, #4f46e5)",
    border: "none", color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 14,
    cursor: "pointer", boxShadow: "0 4px 14px rgba(99,102,241,0.35)", alignSelf: "flex-end",
  },
  // List
  listHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  listTitle: { fontSize: 14, fontWeight: 700, color: "#e2e8f0" },
  pgRow:    { display: "flex", gap: 6, alignItems: "center" },
  pgBtn:    { padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(148,163,184,0.2)", background: "rgba(30,41,59,0.5)", color: "#94a3b8", cursor: "pointer", fontSize: 13 },
  pgInfo:   { fontSize: 12, color: "#64748b", minWidth: 36, textAlign: "center" },
  txList: { display: "flex", flexDirection: "column", gap: 8, overflowY: "auto", maxHeight: 340 },
  txRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    background: "rgba(30,41,59,0.4)", border: "1px solid rgba(148,163,184,0.07)",
    borderRadius: 10, padding: "12px 16px", gap: 12,
  },
  txLeft:   { display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 },
  txRight:  { textAlign: "right", flexShrink: 0 },
  txType:   { fontSize: 18, fontWeight: 900, flexShrink: 0 },
  txCredit: { color: "#34d399" },
  txDebit:  { color: "#f87171" },
  txReason: { fontSize: 13, fontWeight: 700, color: "#e2e8f0", textTransform: "capitalize" },
  txNote:   { fontSize: 11, color: "#64748b", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 260 },
  txDate:   { fontSize: 11, color: "#475569", marginTop: 4 },
  txAmount: { fontSize: 15, fontWeight: 800, fontFamily: "monospace" },
  txBalance:{ fontSize: 11, color: "#475569", marginTop: 3, fontFamily: "monospace" },
  empty: { textAlign: "center", padding: "28px", color: "#475569", fontSize: 14 },
};
