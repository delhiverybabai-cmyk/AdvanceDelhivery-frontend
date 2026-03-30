import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const BASE = process.env.REACT_APP_BASE_URL;

/* ── Inline Debt Modal ───────────────────────────────────────────────────── */
function DebtModal({ rider, amounts, onClose, onSuccess }) {
  const [form, setForm]       = useState({ amount: "", note: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState(null);
  const [errs, setErrs]       = useState({});

  const validate = () => {
    const e = {};
    if (!form.amount || Number(form.amount) <= 0) e.amount = "Enter a valid amount";
    if (Number(form.amount) > 100000) e.amount = "Max ₹1,00,000";
    if (!form.note.trim() || form.note.trim().length < 5) e.note = "Note must be ≥ 5 characters";
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

  const fmtCur = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n || 0);
  const getInitials = (name) => (name ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "??");

  return (
    <div style={ms.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={ms.modal}>
        {/* Header */}
        <div style={ms.header}>
          <div style={ms.avatar}>{getInitials(rider.name)}</div>
          <div style={{ flex: 1 }}>
            <div style={ms.riderName}>{rider.name}</div>
            <div style={ms.riderPhone}>📱 {rider.mobileNumber}</div>
          </div>
          <button style={ms.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Balance banner */}
        <div style={ms.balanceBanner}>
          <div style={ms.balanceItem}>
            <span style={ms.balanceLbl}>💰 Payable Balance</span>
            <span style={{ ...ms.balanceVal, color: (amounts?.balance ?? 0) >= 0 ? "#10b981" : "#ef4444" }}>
              {fmtCur(amounts?.balance ?? 0)}
            </span>
          </div>
          <div style={ms.balanceDivider} />
          <div style={ms.balanceItem}>
            <span style={ms.balanceLbl}>📈 Total Earned</span>
            <span style={{ ...ms.balanceVal, color: "#10b981" }}>{fmtCur(amounts?.totalCredit ?? 0)}</span>
          </div>
          <div style={ms.balanceDivider} />
          <div style={ms.balanceItem}>
            <span style={ms.balanceLbl}>📉 Total Debited</span>
            <span style={{ ...ms.balanceVal, color: "#ef4444" }}>{fmtCur(amounts?.totalDebit ?? 0)}</span>
          </div>
        </div>

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
            type="number" value={form.amount} placeholder="Enter amount" min="1"
            onChange={e => { setForm(p => ({ ...p, amount: e.target.value })); setErrs(p => ({ ...p, amount: "" })); }}
            style={{ ...ms.input, borderColor: errs.amount ? "#ef4444" : "rgba(148,163,184,0.2)" }}
            disabled={loading}
          />
          {errs.amount && <div style={ms.err}>{errs.amount}</div>}
        </div>

        <div style={ms.formGroup}>
          <label style={ms.label}>Note / Reason *</label>
          <textarea
            value={form.note} placeholder="Enter reason for this transaction (min 5 chars)…"
            onChange={e => { setForm(p => ({ ...p, note: e.target.value })); setErrs(p => ({ ...p, note: "" })); }}
            style={{ ...ms.input, minHeight: 80, resize: "vertical" }}
            disabled={loading} maxLength={200}
          />
          {errs.note && <div style={ms.err}>{errs.note}</div>}
          <div style={ms.charCount}>{form.note.length} / 200</div>
        </div>

        <div style={ms.btnRow}>
          <button
            style={{ ...ms.btn, background: "linear-gradient(135deg,#ef4444,#dc2626)", boxShadow: "0 4px 16px rgba(239,68,68,0.3)", opacity: loading ? 0.6 : 1 }}
            onClick={() => submit("debit")} disabled={loading}
          >
            {loading ? "Processing…" : "💳 Borrow (Debit)"}
          </button>
          <button
            style={{ ...ms.btn, background: "linear-gradient(135deg,#10b981,#059669)", boxShadow: "0 4px 16px rgba(16,185,129,0.3)", opacity: loading ? 0.6 : 1 }}
            onClick={() => submit("credit")} disabled={loading}
          >
            {loading ? "Processing…" : "💵 Repay (Credit)"}
          </button>
        </div>
      </div>
    </div>
  );
}

const ms = {
  overlay:       { position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",backdropFilter:"blur(6px)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:16 },
  modal:         { background:"linear-gradient(145deg,#1e293b,#0f172a)",border:"1px solid rgba(148,163,184,0.15)",borderRadius:20,padding:"28px 26px",width:"100%",maxWidth:480,boxShadow:"0 24px 64px rgba(0,0,0,0.5)",maxHeight:"90vh",overflowY:"auto" },
  header:        { display:"flex",alignItems:"center",gap:14,marginBottom:20 },
  avatar:        { width:50,height:50,borderRadius:14,background:"linear-gradient(135deg,#f59e0b,#d97706)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:19,flexShrink:0 },
  riderName:     { fontSize:19,fontWeight:800,color:"#f1f5f9" },
  riderPhone:    { fontSize:12,color:"#64748b",marginTop:2 },
  closeBtn:      { background:"rgba(148,163,184,0.1)",border:"1px solid rgba(148,163,184,0.15)",borderRadius:8,color:"#94a3b8",width:32,height:32,cursor:"pointer",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 },
  balanceBanner: { display:"flex",alignItems:"center",gap:0,background:"rgba(15,23,42,0.5)",border:"1px solid rgba(148,163,184,0.08)",borderRadius:12,padding:"16px 18px",marginBottom:20 },
  balanceItem:   { flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4 },
  balanceDivider:{ width:1,background:"rgba(148,163,184,0.1)",alignSelf:"stretch",margin:"0 4px" },
  balanceLbl:    { fontSize:11,color:"#475569",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em" },
  balanceVal:    { fontSize:18,fontWeight:800 },
  feedback:      { border:"1px solid",borderRadius:10,padding:"12px 16px",marginBottom:16,fontSize:14,fontWeight:600 },
  formGroup:     { marginBottom:16 },
  label:         { display:"block",fontSize:12,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8 },
  input:         { width:"100%",boxSizing:"border-box",padding:"12px 15px",fontSize:15,fontWeight:500,color:"#f1f5f9",background:"rgba(15,23,42,0.7)",border:"1px solid rgba(148,163,184,0.2)",borderRadius:10,outline:"none",fontFamily:"inherit" },
  err:           { color:"#ef4444",fontSize:12,marginTop:5 },
  charCount:     { textAlign:"right",fontSize:11,color:"#475569",marginTop:4 },
  btnRow:        { display:"flex",gap:10,marginTop:20 },
  btn:           { flex:1,padding:"13px 0",border:"none",borderRadius:10,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer" },
};

/* ── Main Component ──────────────────────────────────────────────────────── */
export default function RiderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [rider,   setRider]   = useState(null);
  const [amounts, setAmounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [debtOpen, setDebtOpen] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const [riderRes, amtRes] = await Promise.all([
        axios.get(`${BASE}/api/rider/get-rider/${id}`),
        axios.get(`${BASE}/api/rider-payment/total-amount/${id}`),
      ]);
      setRider(riderRes.data?.data || riderRes.data);
      setAmounts(amtRes.data?.data || { balance: 0, totalCredit: 0, totalDebit: 0 });
    } catch (err) {
      setError(err.response?.status === 404 ? "Rider not found." : "Failed to load rider details.");
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const getInitials = (name) => (name ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "NR");
  const fmtCur = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n || 0);
  const fmtDate = (d) => { if (!d) return "N/A"; const dt = new Date(d); return isNaN(dt) ? "N/A" : dt.toLocaleDateString("en-IN", { year:"numeric", month:"long", day:"numeric" }); };

  if (loading) return (
    <div style={S.page}>
      <div style={S.center}>
        <div style={S.spinner} />
        <p style={{ color:"#64748b", marginTop:16 }}>Loading rider details…</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={S.page}>
      <div style={S.center}>
        <div style={{ fontSize:48, marginBottom:16 }}>⚠️</div>
        <p style={{ color:"#ef4444", fontSize:18, marginBottom:16 }}>{error}</p>
        <button onClick={fetchAll} style={S.retryBtn}>🔄 Retry</button>
      </div>
    </div>
  );

  if (!rider) return null;
  const isActive = rider.status?.toLowerCase() === "active";

  return (
    <div style={S.page}>
      <main style={S.main}>

        {/* ── Back ── */}
        <button style={S.backBtn} onClick={() => navigate("/rider-management")}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(148,163,184,0.2)"; e.currentTarget.style.color = "#e2e8f0"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(148,163,184,0.08)"; e.currentTarget.style.color = "#94a3b8"; }}>
          ← Back to Riders
        </button>

        {/* ── Profile hero ── */}
        <div style={S.heroCard}>
          {/* Left: Avatar + name */}
          <div style={S.heroLeft}>
            <div style={S.heroAvatar}>{getInitials(rider.name)}</div>
            <div>
              <h1 style={S.heroName}>{rider.name}</h1>
              <p style={S.heroPhone}>📱 {Array.isArray(rider.mobileNumber) ? rider.mobileNumber.join(", ") : rider.mobileNumber}</p>
              <span style={{ ...S.badge, ...(isActive ? S.badgeGreen : S.badgeRed) }}>
                {isActive ? "● Active" : "● Inactive"}
              </span>
            </div>
          </div>

          {/* Right: quick action buttons */}
          <div style={S.heroActions}>
            <button style={S.updateBtn}
              onClick={() => navigate(`/update-rider/${id}`)}>
              ✏️ Update Details
            </button>
            <button style={S.debtBtn}
              onClick={() => setDebtOpen(true)}>
              💳 Manage Debt
            </button>
          </div>
        </div>

        {/* ── Balance cards ── */}
        <div style={S.balanceRow}>
          <div style={{ ...S.balCard, borderColor: "rgba(16,185,129,0.2)" }}>
            <div style={S.balCardLbl}>💰 Payable Balance</div>
            <div style={{ ...S.balCardVal, color: (amounts?.balance ?? 0) >= 0 ? "#10b981" : "#ef4444" }}>
              {fmtCur(amounts?.balance ?? 0)}
            </div>
          </div>
          <div style={{ ...S.balCard, borderColor: "rgba(59,130,246,0.2)" }}>
            <div style={S.balCardLbl}>📈 Total Earned</div>
            <div style={{ ...S.balCardVal, color: "#60a5fa" }}>{fmtCur(amounts?.totalCredit ?? 0)}</div>
          </div>
          <div style={{ ...S.balCard, borderColor: "rgba(239,68,68,0.2)" }}>
            <div style={S.balCardLbl}>📉 Total Debited</div>
            <div style={{ ...S.balCardVal, color: "#f87171" }}>{fmtCur(amounts?.totalDebit ?? 0)}</div>
          </div>
          <div style={{ ...S.balCard, borderColor: "rgba(148,163,184,0.15)" }}>
            <div style={S.balCardLbl}>🔄 Transactions</div>
            <div style={{ ...S.balCardVal, color: "#94a3b8" }}>{amounts?.totalTransactions ?? 0}</div>
          </div>
        </div>

        {/* ── Info grid ── */}
        <div style={S.infoGrid}>
          <div style={S.infoCard}>
            <div style={S.infoLbl}>Rate / Parcel</div>
            <div style={S.infoVal}>₹{rider.perParcelRate}</div>
          </div>
          <div style={S.infoCard}>
            <div style={S.infoLbl}>Joined Date</div>
            <div style={S.infoVal}>{fmtDate(rider.createdAt)}</div>
          </div>
          <div style={S.infoCard}>
            <div style={S.infoLbl}>Last Updated</div>
            <div style={S.infoVal}>{fmtDate(rider.updatedAt)}</div>
          </div>
          <div style={S.infoCard}>
            <div style={S.infoLbl}>Employee ID</div>
            <div style={{ ...S.infoVal, fontSize: 13, wordBreak: "break-all", color: "#64748b" }}>{rider.feEmployeeId || rider._id}</div>
          </div>
        </div>

        {/* ── History links ── */}
        <div style={S.historyRow}>
          <button style={S.histBtn}
            onClick={() => navigate(`/rider-delivery-history/${id}`)}>
            <span style={S.histIcon}>📦</span>
            <div>
              <div style={S.histTitle}>Delivery History</div>
              <div style={S.histSub}>View all dispatch records &amp; earnings</div>
            </div>
            <span style={{ color:"#64748b", fontSize:20 }}>→</span>
          </button>
          <button style={{ ...S.histBtn, borderColor:"rgba(245,158,11,0.2)" }}
            onClick={() => navigate(`/rider-paid-history/${id}`)}>
            <span style={{ ...S.histIcon, background:"linear-gradient(135deg,#f59e0b,#d97706)" }}>💰</span>
            <div>
              <div style={S.histTitle}>Paid History</div>
              <div style={S.histSub}>View all credit &amp; debit transactions</div>
            </div>
            <span style={{ color:"#64748b", fontSize:20 }}>→</span>
          </button>
        </div>

      </main>

      {/* ── Debt Modal ── */}
      {debtOpen && (
        <DebtModal
          rider={rider}
          amounts={amounts}
          onClose={() => setDebtOpen(false)}
          onSuccess={() => { setDebtOpen(false); fetchAll(); }}
        />
      )}
    </div>
  );
}

/* ── Styles ─────────────────────────────────────────────────────────────── */
const S = {
  page: { minHeight:"100vh",background:"linear-gradient(135deg,#0f172a 0%,#1e293b 100%)",fontFamily:'"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' },
  main: { maxWidth:1100,margin:"0 auto",padding:"40px 28px" },

  center:   { display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"60vh" },
  spinner:  { width:44,height:44,border:"4px solid rgba(139,92,246,0.2)",borderTop:"4px solid #8b5cf6",borderRadius:"50%",animation:"spin 0.8s linear infinite" },
  retryBtn: { padding:"12px 28px",background:"linear-gradient(135deg,#3b82f6,#1d4ed8)",color:"#fff",border:"none",borderRadius:10,fontWeight:700,cursor:"pointer",fontSize:15 },

  backBtn: { display:"inline-flex",alignItems:"center",gap:8,padding:"10px 18px",background:"rgba(148,163,184,0.08)",border:"1px solid rgba(148,163,184,0.18)",borderRadius:9,color:"#94a3b8",cursor:"pointer",fontSize:14,fontWeight:600,marginBottom:28,transition:"all 0.15s" },

  heroCard:    { background:"linear-gradient(145deg,rgba(30,41,59,0.85),rgba(15,23,42,0.9))",border:"1px solid rgba(148,163,184,0.1)",borderRadius:20,padding:"32px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:24,marginBottom:20,flexWrap:"wrap" },
  heroLeft:    { display:"flex",alignItems:"center",gap:22 },
  heroAvatar:  { width:76,height:76,borderRadius:20,background:"linear-gradient(135deg,#8b5cf6,#6d28d9)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:28,flexShrink:0,boxShadow:"0 12px 30px rgba(139,92,246,0.35)" },
  heroName:    { fontSize:28,fontWeight:900,color:"#f1f5f9",margin:0,marginBottom:6,letterSpacing:"-0.01em" },
  heroPhone:   { fontSize:15,color:"#64748b",margin:0,marginBottom:10 },
  badge:       { padding:"4px 14px",borderRadius:20,fontSize:12,fontWeight:700 },
  badgeGreen:  { background:"rgba(16,185,129,0.12)",color:"#10b981",border:"1px solid rgba(16,185,129,0.25)" },
  badgeRed:    { background:"rgba(239,68,68,0.12)",color:"#ef4444",border:"1px solid rgba(239,68,68,0.25)" },
  heroActions: { display:"flex",gap:12,flexWrap:"wrap" },
  updateBtn:   { padding:"13px 22px",background:"linear-gradient(135deg,#3b82f6,#1d4ed8)",border:"none",borderRadius:11,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",boxShadow:"0 6px 20px rgba(59,130,246,0.25)" },
  debtBtn:     { padding:"13px 22px",background:"linear-gradient(135deg,#f59e0b,#d97706)",border:"none",borderRadius:11,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",boxShadow:"0 6px 20px rgba(245,158,11,0.25)" },

  balanceRow: { display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:14,marginBottom:20 },
  balCard:    { background:"rgba(15,23,42,0.6)",border:"1px solid",borderRadius:14,padding:"20px 18px",textAlign:"center" },
  balCardLbl: { fontSize:12,color:"#475569",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10 },
  balCardVal: { fontSize:22,fontWeight:800 },

  infoGrid: { display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:14,marginBottom:20 },
  infoCard: { background:"rgba(30,41,59,0.5)",border:"1px solid rgba(148,163,184,0.08)",borderRadius:14,padding:"20px",textAlign:"center" },
  infoLbl:  { fontSize:11,color:"#475569",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8 },
  infoVal:  { fontSize:17,fontWeight:700,color:"#e2e8f0" },

  historyRow: { display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginTop:4 },
  histBtn:    { display:"flex",alignItems:"center",gap:16,padding:"22px 24px",background:"rgba(30,41,59,0.6)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:16,cursor:"pointer",textAlign:"left",transition:"all 0.18s" },
  histIcon:   { width:44,height:44,borderRadius:12,background:"linear-gradient(135deg,#3b82f6,#1d4ed8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0 },
  histTitle:  { fontSize:16,fontWeight:700,color:"#f1f5f9",marginBottom:4 },
  histSub:    { fontSize:12,color:"#64748b" },
};
