import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const BASE = process.env.REACT_APP_BASE_URL;

/* ── Inline Debt Modal ───────────────────────────────────────────── */
function DebtModal({ riderId, balance, onClose, onSuccess }) {
  const [form, setForm]       = useState({ amount: "", note: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState(null);
  const [errs, setErrs]       = useState({});
  const fmtCur = (n) => new Intl.NumberFormat("en-IN", { style:"currency", currency:"INR", minimumFractionDigits:0 }).format(n??0);

  const validate = () => {
    const e = {};
    if (!form.amount || Number(form.amount) <= 0) e.amount = "Enter a valid amount";
    if (Number(form.amount) > 100000) e.amount = "Max ₹1,00,000";
    if (!form.note.trim() || form.note.trim().length < 5) e.note = "Note must be ≥ 5 chars";
    setErrs(e); return !Object.keys(e).length;
  };

  const submit = async (type) => {
    if (!validate()) return;
    setLoading(true);
    try {
      const ep = type === "debit" ? "debt-borrow" : "debt-repay";
      await axios.put(`${BASE}/api/rider-payment/${ep}/${riderId}`, { amount: Number(form.amount), note: form.note.trim() });
      setMsg({ text: `✅ Amount ${type === "debit" ? "debited" : "credited"} successfully!`, ok: true });
      setForm({ amount: "", note: "" });
      setTimeout(() => { setMsg(null); onSuccess(); }, 1800);
    } catch (err) {
      setMsg({ text: err.response?.data?.message || "Action failed.", ok: false });
    } finally { setLoading(false); }
  };

  return (
    <div style={ms.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={ms.modal}>
        <div style={ms.mHead}>
          <div>
            <div style={ms.mTitle}>💳 Manage Debt</div>
            <div style={ms.mSub}>Debit (borrow) or Credit (repay) an amount</div>
          </div>
          <button style={ms.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={ms.balBanner}>
          <span style={ms.balLbl}>Current Balance</span>
          <span style={{ ...ms.balVal, color: balance >= 0 ? "#10b981" : "#ef4444" }}>{fmtCur(balance)}</span>
        </div>
        {msg && <div style={{ ...ms.feedback, background: msg.ok?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.1)", borderColor: msg.ok?"rgba(16,185,129,0.3)":"rgba(239,68,68,0.3)", color: msg.ok?"#10b981":"#ef4444" }}>{msg.text}</div>}
        <div style={ms.fg}>
          <label style={ms.lbl}>Amount (₹) *</label>
          <input type="number" value={form.amount} placeholder="Enter amount" min="1"
            onChange={e => { setForm(p=>({...p,amount:e.target.value})); setErrs(p=>({...p,amount:""})); }}
            style={{ ...ms.input, borderColor: errs.amount?"#ef4444":"rgba(148,163,184,0.2)" }} disabled={loading} />
          {errs.amount && <div style={ms.err}>{errs.amount}</div>}
        </div>
        <div style={ms.fg}>
          <label style={ms.lbl}>Note / Reason *</label>
          <textarea value={form.note} placeholder="Min 5 characters…" maxLength={200}
            onChange={e => { setForm(p=>({...p,note:e.target.value})); setErrs(p=>({...p,note:""})); }}
            style={{ ...ms.input, minHeight:76, resize:"vertical" }} disabled={loading} />
          {errs.note && <div style={ms.err}>{errs.note}</div>}
          <div style={{ textAlign:"right", fontSize:11, color:"#475569", marginTop:3 }}>{form.note.length}/200</div>
        </div>
        <div style={ms.btnRow}>
          <button style={{ ...ms.btn, background:"linear-gradient(135deg,#ef4444,#dc2626)", opacity:loading?.6:1 }} onClick={()=>submit("debit")} disabled={loading}>
            {loading?"…":"💳 Borrow (Debit)"}
          </button>
          <button style={{ ...ms.btn, background:"linear-gradient(135deg,#10b981,#059669)", opacity:loading?.6:1 }} onClick={()=>submit("credit")} disabled={loading}>
            {loading?"…":"💵 Repay (Credit)"}
          </button>
        </div>
      </div>
    </div>
  );
}

const ms = {
  overlay:  { position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",backdropFilter:"blur(6px)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:16 },
  modal:    { background:"linear-gradient(145deg,#1e293b,#0f172a)",border:"1px solid rgba(148,163,184,0.15)",borderRadius:20,padding:"28px 26px",width:"100%",maxWidth:440,boxShadow:"0 24px 64px rgba(0,0,0,0.5)" },
  mHead:    { display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20 },
  mTitle:   { fontSize:18,fontWeight:800,color:"#f1f5f9" },
  mSub:     { fontSize:12,color:"#64748b",marginTop:3 },
  closeBtn: { background:"rgba(148,163,184,0.1)",border:"1px solid rgba(148,163,184,0.15)",borderRadius:8,color:"#94a3b8",width:30,height:30,cursor:"pointer",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center" },
  balBanner:{ display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(15,23,42,0.5)",border:"1px solid rgba(148,163,184,0.08)",borderRadius:12,padding:"13px 16px",marginBottom:18 },
  balLbl:   { fontSize:12,color:"#64748b",fontWeight:600 },
  balVal:   { fontSize:20,fontWeight:900 },
  feedback: { border:"1px solid",borderRadius:10,padding:"11px 14px",marginBottom:14,fontSize:13,fontWeight:600 },
  fg:       { marginBottom:14 },
  lbl:      { display:"block",fontSize:11,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6 },
  input:    { width:"100%",boxSizing:"border-box",padding:"11px 14px",fontSize:14,fontWeight:500,color:"#f1f5f9",background:"rgba(15,23,42,0.7)",border:"1px solid rgba(148,163,184,0.2)",borderRadius:10,outline:"none",fontFamily:"inherit" },
  err:      { color:"#ef4444",fontSize:11,marginTop:4 },
  btnRow:   { display:"flex",gap:10,marginTop:18 },
  btn:      { flex:1,padding:"12px 0",border:"none",borderRadius:10,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer" },
};

/* ── Main Page ───────────────────────────────────────────────────── */
export default function RiderPaidHistory() {
  const { riderId } = useParams();
  const navigate    = useNavigate();

  const [history,    setHistory]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [filter,     setFilter]     = useState("all"); // all | credit | debit
  const [debtOpen,   setDebtOpen]   = useState(false);

  /* ── Fetch ── */
  const fetchHistory = async () => {
    try {
      setLoading(true); setError(null);
      const res = await axios.get(`${BASE}/api/rider-payment/paid-history/${riderId}`);
      const raw = res.data?.data || [];
      // Sort oldest → newest for running balance to read naturally
      setHistory([...raw].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
    } catch (err) {
      setError("Failed to load payment history.");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchHistory(); }, [riderId]); // eslint-disable-line

  /* ── Helpers ── */
  const fmtCur  = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n ?? 0);
  const fmtDate = (d) => {
    const dt = new Date(d);
    return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      + "  " + dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  /* ── Derived ── */
  const filtered = filter === "all" ? history : history.filter(t => t.type === filter);

  const summary = history.reduce((acc, t) => {
    if (t.type === "credit") acc.credit += t.amount;
    else acc.debit += t.amount;
    return acc;
  }, { credit: 0, debit: 0 });
  summary.balance = summary.credit - summary.debit;

  /* ── Running balance (fallback for old rows without stored value) ── */
  const withBalance = filtered.map((t, idx, arr) => {
    if (t.runningBalance != null && t.runningBalance !== 0) {
      return { ...t, displayBalance: t.runningBalance };
    }
    // recompute from the start of all (not just filtered) sorted history
    const sliceEnd = history.indexOf(t) + 1;
    const bal = history.slice(0, sliceEnd).reduce(
      (b, tx) => tx.type === "credit" ? b + tx.amount : b - tx.amount, 0
    );
    return { ...t, displayBalance: bal };
  });

  /* ── States ── */
  if (loading) return (
    <div style={S.page}>
      <div style={S.center}>
        <div style={S.spinner} />
        <p style={{ color: "#64748b", marginTop: 16 }}>Loading payment history…</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={S.page}>
      <main style={S.main}>
        <button style={S.backBtn} onClick={() => navigate("/rider-management")}>← Back</button>
        <div style={S.errBox}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <p style={{ color: "#ef4444", marginBottom: 16 }}>{error}</p>
          <button style={S.retryBtn} onClick={fetchHistory}>🔄 Retry</button>
        </div>
      </main>
    </div>
  );

  return (
    <div style={S.page}>
      <main style={S.main}>

        {/* ── Back ── */}
        <button style={S.backBtn}
          onClick={() => navigate("/rider-management")}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(148,163,184,0.18)"; e.currentTarget.style.color = "#e2e8f0"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(148,163,184,0.08)"; e.currentTarget.style.color = "#94a3b8"; }}>
          ← Back to Riders
        </button>

        {/* ── Header ── */}
        <div style={S.topBar}>
          <div>
            <h1 style={S.title}>💳 Payment Ledger</h1>
            <p style={S.sub}>All credit &amp; debit transactions with running balance</p>
          </div>
          {/* Filter pills */}
          <div style={S.pills}>
            {[
              { key: "all",    label: "All",     color: "#3b82f6" },
              { key: "credit", label: "Credits", color: "#10b981" },
              { key: "debit",  label: "Debits",  color: "#ef4444" },
            ].map(({ key, label, color }) => (
              <button key={key} style={{
                ...S.pill,
                background: filter === key ? color : "rgba(148,163,184,0.08)",
                color:      filter === key ? "#fff" : "#94a3b8",
                border:     filter === key ? `1px solid ${color}` : "1px solid rgba(148,163,184,0.15)",
                boxShadow:  filter === key ? `0 4px 14px ${color}44` : "none",
              }} onClick={() => setFilter(key)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Balance + Manage Debt ── */}
        <div style={S.balRow}>
          <div style={{ ...S.balCard, borderLeft: `4px solid ${summary.balance >= 0 ? "#10b981" : "#ef4444"}` }}>
            <div style={S.balCardLbl}>💰 Current Balance</div>
            <div style={{ ...S.balCardVal, color: summary.balance >= 0 ? "#10b981" : "#ef4444" }}>
              {fmtCur(summary.balance)}
            </div>
            <div style={S.balCardSub}>{history.length} transactions total</div>
          </div>
          <button style={S.manageDebtBtn} onClick={() => setDebtOpen(true)}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
            💳 Manage Debt
          </button>
        </div>

        {/* ── Table ── */}
        {filtered.length === 0 ? (
          <div style={S.empty}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>💳</div>
            <h3 style={{ color: "#e2e8f0", marginBottom: 8 }}>No Transactions Found</h3>
            <p style={{ color: "#64748b" }}>No {filter === "all" ? "" : filter} records for this rider.</p>
          </div>
        ) : (
          <div style={S.tableWrap}>
            {/* Table header */}
            <div style={S.tableHead}>
              <div style={{ ...S.th, flex: "0 0 50px" }}>#</div>
              <div style={{ ...S.th, flex: "0 0 160px" }}>Date</div>
              <div style={{ ...S.th, flex: "0 0 100px" }}>Type</div>
              <div style={{ ...S.th, flex: 1 }}>Note / Reason</div>
              <div style={{ ...S.th, flex: "0 0 150px", textAlign: "right" }}>Amount</div>
              <div style={{ ...S.th, flex: "0 0 160px", textAlign: "right" }}>Balance After</div>
            </div>

            {/* Rows */}
            <div style={S.tableBody}>
              {[...withBalance].reverse().map((t, index) => {
                const isCredit = t.type === "credit";
                // calculate proper alternating colors and correct row number descending
                const num = withBalance.length - index;
                return (
                  <div key={t._id} style={{
                    ...S.row,
                    background: index % 2 === 0 ? "rgba(15,23,42,0.35)" : "rgba(30,41,59,0.25)",
                    borderLeft: `3px solid ${isCredit ? "#10b981" : "#ef4444"}`,
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = isCredit ? "rgba(16,185,129,0.07)" : "rgba(239,68,68,0.07)"}
                    onMouseLeave={e => e.currentTarget.style.background = index % 2 === 0 ? "rgba(15,23,42,0.35)" : "rgba(30,41,59,0.25)"}
                  >
                    {/* # */}
                    <div style={{ ...S.td, flex: "0 0 50px", color: "#475569", fontSize: 14 }}>
                      {num}
                    </div>

                    {/* Date */}
                    <div style={{ ...S.td, flex: "0 0 160px" }}>
                      <div style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.5 }}>
                        {fmtDate(t.createdAt)}
                      </div>
                    </div>

                    {/* Type badge */}
                    <div style={{ ...S.td, flex: "0 0 100px" }}>
                      <span style={{
                        padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                        background: isCredit ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                        color: isCredit ? "#10b981" : "#ef4444",
                        border: `1px solid ${isCredit ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                      }}>
                        {isCredit ? "↑ Credit" : "↓ Debit"}
                      </span>
                    </div>

                    {/* Note */}
                    <div style={{ ...S.td, flex: 1, color: "#cbd5e1", fontSize: 15 }}>
                      {t.note || <span style={{ color: "#475569" }}>—</span>}
                    </div>

                    {/* Amount */}
                    <div style={{ ...S.td, flex: "0 0 150px", textAlign: "right", fontWeight: 800, fontSize: 18,
                      color: isCredit ? "#10b981" : "#ef4444" }}>
                      {isCredit ? "+" : "−"}{fmtCur(t.amount)}
                    </div>

                    {/* Running balance */}
                    <div style={{ ...S.td, flex: "0 0 160px", textAlign: "right" }}>
                      <span style={{
                        fontWeight: 800, fontSize: 17,
                        color: t.displayBalance >= 0 ? "#34d399" : "#f87171",
                      }}>
                        {fmtCur(t.displayBalance)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer total */}
            <div style={S.tableFooter}>
              <div style={{ flex: 1, color: "#475569", fontSize: 15 }}>
                Showing {filtered.length} of {history.length} entries
              </div>
              <div style={{ color: "#94a3b8", fontSize: 16, fontWeight: 600 }}>
                Closing Balance:&nbsp;
                <span style={{ color: summary.balance >= 0 ? "#10b981" : "#ef4444", fontWeight: 800, fontSize: 18 }}>
                  {fmtCur(summary.balance)}
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Debt Modal ── */}
      {debtOpen && (
        <DebtModal
          riderId={riderId}
          balance={summary.balance}
          onClose={() => setDebtOpen(false)}
          onSuccess={() => { setDebtOpen(false); fetchHistory(); }}
        />
      )}
    </div>
  );
}

/* ─────────────────────── Debt modal portal (conditional) ─────────── */
// rendered at bottom of JSX ↓

/* ── Styles ─────────────────────────────────────────────────────────────── */
const S = {
  page:    { minHeight: "100vh", background: "linear-gradient(135deg,#0f172a 0%,#1e293b 100%)", fontFamily: '"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' },
  main:    { maxWidth: 1600, margin: "0 auto", padding: "40px 40px" },

  center:   { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" },
  spinner:  { width: 44, height: 44, border: "4px solid rgba(139,92,246,0.2)", borderTop: "4px solid #8b5cf6", borderRadius: "50%" },
  errBox:   { textAlign: "center", padding: "60px 40px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 16 },
  retryBtn: { padding: "11px 24px", background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", color: "#fff", border: "none", borderRadius: 9, fontWeight: 700, cursor: "pointer" },

  backBtn: { display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "rgba(148,163,184,0.08)", border: "1px solid rgba(148,163,184,0.18)", borderRadius: 9, color: "#94a3b8", cursor: "pointer", fontSize: 14, fontWeight: 600, marginBottom: 28, transition: "all 0.15s" },

  topBar: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 },
  title:  { fontSize: 34, fontWeight: 900, background: "linear-gradient(135deg,#fff,#e2e8f0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", margin: 0, marginBottom: 6, letterSpacing: "-0.02em" },
  sub:    { fontSize: 14, color: "#64748b", margin: 0 },

  pills: { display: "flex", gap: 8, flexWrap: "wrap" },
  pill:  { padding: "9px 20px", borderRadius: 24, fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.15s" },

  balRow:        { display: "flex", alignItems: "center", gap: 16, marginBottom: 24, flexWrap:"wrap" },
  balCard:       { flex: 1, minWidth: 220, background: "rgba(30,41,59,0.7)", border: "1px solid rgba(148,163,184,0.1)", borderRadius: 14, padding: "20px 24px", display:"flex", alignItems:"center", gap:20 },
  balCardLbl:    { fontSize: 12, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 },
  balCardVal:    { fontSize: 30, fontWeight: 900, lineHeight: 1 },
  balCardSub:    { fontSize: 12, color: "#475569", marginTop: 6 },
  manageDebtBtn: { padding: "16px 28px", background: "linear-gradient(135deg,#f59e0b,#d97706)", border: "none", borderRadius: 12, color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", boxShadow: "0 6px 20px rgba(245,158,11,0.3)", transition: "transform 0.15s", whiteSpace: "nowrap", flexShrink: 0 },

  empty: { textAlign: "center", padding: "70px 40px", border: "1px dashed rgba(148,163,184,0.12)", borderRadius: 18 },

  tableWrap: { background: "linear-gradient(145deg,rgba(30,41,59,0.8),rgba(15,23,42,0.9))", border: "1px solid rgba(148,163,184,0.1)", borderRadius: 18, overflow: "hidden", fontSize: 16 },

  tableHead: { display: "flex", alignItems: "center", padding: "20px 28px", background: "rgba(15,23,42,0.5)", borderBottom: "1px solid rgba(148,163,184,0.08)" },
  th: { fontSize: 13, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em" },

  tableBody: { display: "flex", flexDirection: "column" },
  row: { display: "flex", alignItems: "center", padding: "20px 28px", borderBottom: "1px solid rgba(148,163,184,0.05)", transition: "background 0.15s", cursor: "default" },
  td: { fontSize: 16, color: "#94a3b8" },

  tableFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 28px", borderTop: "1px solid rgba(148,163,184,0.08)", background: "rgba(15,23,42,0.4)" },
};
