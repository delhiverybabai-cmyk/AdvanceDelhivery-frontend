import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const BASE = process.env.REACT_APP_BASE_URL;

/* ── Debt Modal (inline) ─────────────────────────────────────────────────── */
function DebtModal({ rider, onClose, onSuccess }) {
  const [form, setForm]       = useState({ amount: "", note: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState(null);   // {text, ok}
  const [errs, setErrs]       = useState({});

  const validate = () => {
    const e = {};
    if (!form.amount || Number(form.amount) <= 0) e.amount = "Enter a valid amount";
    if (Number(form.amount) > 100000) e.amount = "Max ₹1,00,000";
    if (!form.note.trim() || form.note.trim().length < 5) e.note = "Note must be ≥ 5 chars";
    setErrs(e);
    return !Object.keys(e).length;
  };

  const submit = async (type) => {
    if (!validate()) return;
    setLoading(true);
    try {
      const ep = type === "debit" ? "debt-borrow" : "debt-repay";
      await axios.put(`${BASE}/api/rider-payment/${ep}/${rider._id}`, {
        amount: Number(form.amount), note: form.note.trim(),
      });
      setMsg({ text: `✅ Amount ${type === "debit" ? "debited" : "credited"} successfully!`, ok: true });
      setForm({ amount: "", note: "" });
      setTimeout(() => { setMsg(null); onSuccess(); }, 1800);
    } catch (err) {
      setMsg({ text: err.response?.data?.message || "Action failed. Try again.", ok: false });
    } finally { setLoading(false); }
  };

  return (
    <div style={ms.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={ms.modal}>
        {/* Header */}
        <div style={ms.header}>
          <div>
            <div style={ms.avatar}>{rider.name?.slice(0, 2).toUpperCase()}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={ms.riderName}>{rider.name}</div>
            <div style={ms.riderId}>💼 Manage Debt</div>
          </div>
          <button style={ms.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Balance banner */}
        {rider.balance !== undefined && (
          <div style={ms.balanceBanner}>
            <span style={ms.balanceLbl}>Current Payable Balance</span>
            <span style={{ ...ms.balanceVal, color: rider.balance >= 0 ? "#10b981" : "#ef4444" }}>
              ₹{rider.balance?.toLocaleString("en-IN") ?? "—"}
            </span>
          </div>
        )}

        {/* Feedback */}
        {msg && (
          <div style={{ ...ms.feedback, background: msg.ok ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", borderColor: msg.ok ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)", color: msg.ok ? "#10b981" : "#ef4444" }}>
            {msg.text}
          </div>
        )}

        {/* Form */}
        <div style={ms.formGroup}>
          <label style={ms.label}>Amount (₹) *</label>
          <input
            type="number" value={form.amount} placeholder="Enter amount"
            onChange={e => { setForm(p => ({ ...p, amount: e.target.value })); setErrs(p => ({ ...p, amount: "" })); }}
            style={{ ...ms.input, borderColor: errs.amount ? "#ef4444" : "rgba(148,163,184,0.2)" }}
            disabled={loading}
          />
          {errs.amount && <div style={ms.err}>{errs.amount}</div>}
        </div>
        <div style={ms.formGroup}>
          <label style={ms.label}>Note / Reason *</label>
          <textarea
            value={form.note} placeholder="Enter reason (min 5 chars)..."
            onChange={e => { setForm(p => ({ ...p, note: e.target.value })); setErrs(p => ({ ...p, note: "" })); }}
            style={{ ...ms.input, minHeight: 80, resize: "vertical" }}
            disabled={loading} maxLength={200}
          />
          {errs.note && <div style={ms.err}>{errs.note}</div>}
          <div style={ms.charCount}>{form.note.length}/200</div>
        </div>

        {/* Actions */}
        <div style={ms.btnRow}>
          <button
            style={{ ...ms.btn, background: "linear-gradient(135deg,#ef4444,#dc2626)", boxShadow: "0 4px 16px rgba(239,68,68,0.3)", opacity: loading ? 0.7 : 1 }}
            onClick={() => submit("debit")} disabled={loading}
          >
            {loading ? "…" : "💳 Borrow (Debit)"}
          </button>
          <button
            style={{ ...ms.btn, background: "linear-gradient(135deg,#10b981,#059669)", boxShadow: "0 4px 16px rgba(16,185,129,0.3)", opacity: loading ? 0.7 : 1 }}
            onClick={() => submit("credit")} disabled={loading}
          >
            {loading ? "…" : "💵 Repay (Credit)"}
          </button>
        </div>
      </div>
    </div>
  );
}

const ms = {
  overlay:      { position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",backdropFilter:"blur(6px)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:16 },
  modal:        { background:"linear-gradient(145deg,#1e293b,#0f172a)",border:"1px solid rgba(148,163,184,0.15)",borderRadius:20,padding:"32px 28px",width:"100%",maxWidth:440,boxShadow:"0 24px 64px rgba(0,0,0,0.5)" },
  header:       { display:"flex",alignItems:"center",gap:16,marginBottom:20 },
  avatar:       { width:48,height:48,borderRadius:14,background:"linear-gradient(135deg,#8b5cf6,#6d28d9)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:18,flexShrink:0 },
  riderName:    { fontSize:20,fontWeight:800,color:"#f1f5f9" },
  riderId:      { fontSize:12,color:"#64748b",marginTop:2 },
  closeBtn:     { background:"rgba(148,163,184,0.1)",border:"1px solid rgba(148,163,184,0.15)",borderRadius:8,color:"#94a3b8",width:32,height:32,cursor:"pointer",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 },
  balanceBanner:{ display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(15,23,42,0.5)",border:"1px solid rgba(148,163,184,0.08)",borderRadius:12,padding:"14px 18px",marginBottom:20 },
  balanceLbl:   { fontSize:13,color:"#64748b",fontWeight:600 },
  balanceVal:   { fontSize:22,fontWeight:800 },
  feedback:     { border:"1px solid",borderRadius:10,padding:"12px 16px",marginBottom:16,fontSize:14,fontWeight:600 },
  formGroup:    { marginBottom:18 },
  label:        { display:"block",fontSize:12,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8 },
  input:        { width:"100%",boxSizing:"border-box",padding:"13px 16px",fontSize:15,fontWeight:500,color:"#f1f5f9",background:"rgba(15,23,42,0.7)",border:"1px solid rgba(148,163,184,0.2)",borderRadius:10,outline:"none",fontFamily:"inherit" },
  err:          { color:"#ef4444",fontSize:12,marginTop:5 },
  charCount:    { textAlign:"right",fontSize:11,color:"#475569",marginTop:4 },
  btnRow:       { display:"flex",gap:12,marginTop:24 },
  btn:          { flex:1,padding:"13px 0",border:"none",borderRadius:10,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer" },
};

/* ── Main component ──────────────────────────────────────────────────────── */
export default function RiderManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const isRecordMode = location.pathname.endsWith("/record");
  const [riders,  setRiders]  = useState([]);
  const [amounts, setAmounts] = useState({}); // { [riderId]: { balance, totalCredit, totalDebit } }
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [debtRider, setDebtRider] = useState(null);

  /* ── Fetch riders list ── */
  const fetchRiders = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const res = await axios.get(`${BASE}/api/rider/get-riders`);
      const list = res.data?.data || [];
      setRiders(list);
      // Fire off total-amount for all riders in parallel
      fetchAllAmounts(list);
    } catch (err) {
      setError(err.message || "Failed to fetch riders");
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  /* ── Fetch total amounts for all riders ── */
  const fetchAllAmounts = async (list) => {
    const results = await Promise.allSettled(
      list.map(r => axios.get(`${BASE}/api/rider-payment/total-amount/${r._id}`))
    );
    const map = {};
    results.forEach((res, i) => {
      if (res.status === "fulfilled") {
        map[list[i]._id] = res.value.data?.data || { balance: 0, totalCredit: 0, totalDebit: 0 };
      } else {
        map[list[i]._id] = { balance: 0, totalCredit: 0, totalDebit: 0 };
      }
    });
    setAmounts(map);
  };

  useEffect(() => { fetchRiders(); }, [fetchRiders]);

  const getInitials = (name) => (name ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "NR");
  const fmtCur = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n || 0);

  const avatarColors = [
    "linear-gradient(135deg,#3b82f6,#1d4ed8)",
    "linear-gradient(135deg,#8b5cf6,#6d28d9)",
    "linear-gradient(135deg,#10b981,#059669)",
    "linear-gradient(135deg,#f59e0b,#d97706)",
    "linear-gradient(135deg,#ef4444,#dc2626)",
    "linear-gradient(135deg,#06b6d4,#0891b2)",
  ];

  /* ── Loading ── */
  if (loading) return (
    <div style={S.page}>
      <div style={S.centerMsg}>
        <div style={S.spinner} />
        <p style={{ color: "#64748b", marginTop: 16, fontSize: 16 }}>Loading riders…</p>
      </div>
    </div>
  );

  /* ── Error ── */
  if (error) return (
    <div style={S.page}>
      <div style={S.centerMsg}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <p style={{ color: "#ef4444", fontSize: 18, marginBottom: 16 }}>{error}</p>
        <button onClick={fetchRiders} style={S.retryBtn}>🔄 Retry</button>
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      <main style={S.main}>

        {/* ── Header ── */}
        <div style={S.topBar}>
          <div>
            <h1 style={S.title}>🛵 Rider Management</h1>
            <p style={S.sub}>Manage your delivery fleet, track balances &amp; handle debt.</p>
          </div>
          <div style={S.headerBtns}>
            <button style={S.expBtn} onClick={() => navigate("/expence-profit")}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
              💼 Company Expenses
            </button>
            <button style={S.addBtn} onClick={() => navigate("/add-rider")}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
              + Add Rider
            </button>
          </div>
        </div>

        {/* ── Summary stat row ── */}
        {riders.length > 0 && (
          <div style={S.statBar}>
            <div style={S.stat}>
              <div style={S.statNum}>{riders.length}</div>
              <div style={S.statLbl}>Total Riders</div>
            </div>
            <div style={S.stat}>
              <div style={{ ...S.statNum, color: "#10b981" }}>
                {riders.filter(r => r.status?.toLowerCase() === "active").length}
              </div>
              <div style={S.statLbl}>Active</div>
            </div>
            <div style={S.stat}>
              <div style={{ ...S.statNum, color: "#fbbf24" }}>
                {fmtCur(Object.values(amounts).reduce((s, a) => s + (a.balance || 0), 0))}
              </div>
              <div style={S.statLbl}>Total Payable</div>
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {riders.length === 0 ? (
          <div style={S.empty}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🛵</div>
            <h2 style={{ color: "#fff", fontWeight: 700, marginBottom: 8 }}>No Riders Found</h2>
            <p style={{ color: "#64748b" }}>Start by adding your first delivery rider.</p>
          </div>
        ) : (
          <div style={S.grid}>
            {riders.map((rider, idx) => {
              const amt = amounts[rider._id] || {};
              const balance = amt.balance ?? null;
              const isActive = rider.status?.toLowerCase() === "active";

              return (
                <div key={rider._id} style={S.card}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 24px 48px rgba(0,0,0,0.35)"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.25)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = S.card.boxShadow; e.currentTarget.style.borderColor = S.card.border.replace("border:","").trim(); }}
                >
                  {/* ── Card Header ── */}
                  <div style={S.cardHead}>
                    <div style={{ ...S.avatar, background: avatarColors[idx % avatarColors.length] }}>
                      {getInitials(rider.name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={S.riderName}>{rider.name}</div>
                      <div style={S.riderPhone}>📱 {Array.isArray(rider.mobileNumber) ? rider.mobileNumber.join(", ") : rider.mobileNumber}</div>
                    </div>
                    <span style={{ ...S.badge, ...(isActive ? S.badgeGreen : S.badgeRed) }}>
                      {isActive ? "● Active" : "● Inactive"}
                    </span>
                  </div>

              

                  {/* ── Payable balance banner ── */}
                  <div style={S.payableBanner}>
                    <span style={S.payableLbl}>💰 Payable Amount</span>
                    <span style={{ ...S.payableVal, color: balance !== null ? (balance >= 0 ? "#10b981" : "#ef4444") : "#64748b" }}>
                      {balance !== null ? fmtCur(balance) : "Loading…"}
                    </span>
                  </div>

                  {/* ── Action buttons: 3 in a row ── */}
                  <div style={S.cardActions}>
                    <button style={S.histBtn}
                      onClick={() => navigate(`/rider-delivery-history/${rider._id}`)}>
                      📦 Delivery History
                    </button>
                    <button style={S.paidBtn}
                      onClick={() => navigate(`/rider-paid-history/${rider._id}`)}>
                      💰 Payment History
                    </button>
                    {isRecordMode && (
                      <button style={S.debtBtn}
                        onClick={() => setDebtRider({ ...rider, balance })}>
                        💳 Manage Debt
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Debt Modal ── */}
      {debtRider && (
        <DebtModal
          rider={debtRider}
          onClose={() => setDebtRider(null)}
          onSuccess={() => { setDebtRider(null); fetchRiders(); }}
        />
      )}
    </div>
  );
}

/* ── Styles ────────────────────────────────────────────────────────────────── */
const S = {
  page:    { minHeight:"100vh", background:"linear-gradient(135deg,#0f172a 0%,#1e293b 100%)", fontFamily:'"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' },
  main:    { maxWidth:1400, margin:"0 auto", padding:"48px 32px" },

  centerMsg: { display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"60vh" },
  spinner:   { width:44,height:44,border:"4px solid rgba(139,92,246,0.25)",borderTop:"4px solid #8b5cf6",borderRadius:"50%",animation:"spin 0.8s linear infinite" },
  retryBtn:  { padding:"12px 28px",background:"linear-gradient(135deg,#3b82f6,#1d4ed8)",color:"#fff",border:"none",borderRadius:10,fontWeight:700,cursor:"pointer",fontSize:15 },

  topBar:     { display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:36,flexWrap:"wrap",gap:20 },
  title:      { fontSize:40,fontWeight:900,background:"linear-gradient(135deg,#fff 0%,#e2e8f0 70%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",letterSpacing:"-0.02em",margin:0,marginBottom:8 },
  sub:        { fontSize:16,color:"#64748b",margin:0 },
  headerBtns: { display:"flex",gap:12,alignItems:"center",flexShrink:0 },
  expBtn:     { padding:"13px 22px",background:"linear-gradient(135deg,#3b82f6,#1d4ed8)",color:"#fff",border:"none",borderRadius:11,fontWeight:700,fontSize:14,cursor:"pointer",boxShadow:"0 6px 20px rgba(59,130,246,0.3)",transition:"transform 0.15s" },
  addBtn:     { padding:"13px 22px",background:"linear-gradient(135deg,#10b981,#059669)",color:"#fff",border:"none",borderRadius:11,fontWeight:700,fontSize:14,cursor:"pointer",boxShadow:"0 6px 20px rgba(16,185,129,0.3)",transition:"transform 0.15s" },

  statBar:  { display:"flex",gap:16,marginBottom:36,flexWrap:"wrap" },
  stat:     { flex:"1 1 140px",background:"rgba(30,41,59,0.7)",border:"1px solid rgba(148,163,184,0.1)",borderRadius:14,padding:"18px 22px" },
  statNum:  { fontSize:26,fontWeight:800,color:"#f1f5f9",lineHeight:1 },
  statLbl:  { fontSize:12,color:"#475569",fontWeight:600,marginTop:6,textTransform:"uppercase",letterSpacing:"0.05em" },

  empty: { textAlign:"center",padding:"80px 40px",border:"1px dashed rgba(148,163,184,0.15)",borderRadius:20 },

  grid:  { display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(360px,1fr))",gap:22 },

  card: {
    background:"linear-gradient(145deg,rgba(30,41,59,0.85),rgba(15,23,42,0.95))",
    backdropFilter:"blur(12px)",
    border:"1px solid rgba(148,163,184,0.1)",
    borderRadius:18,
    padding:"26px 24px",
    cursor:"default",
    transition:"all 0.25s cubic-bezier(0.4,0,0.2,1)",
    boxShadow:"0 4px 24px rgba(0,0,0,0.2)",
    display:"flex",flexDirection:"column",gap:0,
  },

  cardHead: { display:"flex",alignItems:"center",gap:16,marginBottom:20 },
  avatar:   { width:56,height:56,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:20,flexShrink:0,boxShadow:"0 8px 20px rgba(0,0,0,0.25)" },
  riderName:  { fontSize:18,fontWeight:800,color:"#f1f5f9",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" },
  riderPhone: { fontSize:13,color:"#64748b",marginTop:3 },
  badge:      { padding:"4px 12px",borderRadius:20,fontSize:11,fontWeight:700,whiteSpace:"nowrap",flexShrink:0 },
  badgeGreen: { background:"rgba(16,185,129,0.12)",color:"#10b981",border:"1px solid rgba(16,185,129,0.25)" },
  badgeRed:   { background:"rgba(239,68,68,0.12)",color:"#ef4444",border:"1px solid rgba(239,68,68,0.25)" },

  infoStrip:    { display:"flex",gap:20,marginBottom:14 },
  infoStripLbl: { fontSize:10,color:"#475569",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4 },
  infoStripVal: { fontSize:14,fontWeight:700,color:"#cbd5e1" },

  payableBanner: { display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(15,23,42,0.55)",border:"1px solid rgba(148,163,184,0.08)",borderRadius:12,padding:"14px 18px",marginBottom:16 },
  payableLbl:    { fontSize:13,color:"#64748b",fontWeight:600 },
  payableVal:    { fontSize:22,fontWeight:900 },

  cardActions: { display:"flex",gap:8 },
  histBtn: { flex:1,padding:"10px 2px",background:"rgba(59,130,246,0.1)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:10,color:"#60a5fa",fontWeight:700,fontSize:12,cursor:"pointer",transition:"all 0.15s" },
  paidBtn: { flex:1,padding:"10px 2px",background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:10,color:"#34d399",fontWeight:700,fontSize:12,cursor:"pointer",transition:"all 0.15s" },
  debtBtn: { flex:1,padding:"10px 2px",background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:10,color:"#fbbf24",fontWeight:700,fontSize:12,cursor:"pointer",transition:"all 0.15s" },
};
