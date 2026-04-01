import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BASE = process.env.REACT_APP_BASE_URL;

export default function RiderOnlyManagement() {
  const navigate = useNavigate();
  const [riders,  setRiders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchRiders = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const res = await axios.get(`${BASE}/api/rider/get-riders`);
      setRiders(res.data?.data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch riders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRiders(); }, [fetchRiders]);

  const getInitials = (name) => (name ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "NR");

  const avatarColors = [
    "linear-gradient(135deg,#3b82f6,#1d4ed8)",
    "linear-gradient(135deg,#8b5cf6,#6d28d9)",
    "linear-gradient(135deg,#10b981,#059669)",
    "linear-gradient(135deg,#f59e0b,#d97706)",
    "linear-gradient(135deg,#ef4444,#dc2626)",
    "linear-gradient(135deg,#06b6d4,#0891b2)",
  ];

  if (loading) return (
    <div style={S.page}>
      <div style={S.centerMsg}>
        <div style={S.spinner} />
        <p style={{ color: "#64748b", marginTop: 16, fontSize: 16 }}>Loading riders…</p>
      </div>
    </div>
  );

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
        <div style={S.topBar}>
          <div>
            <h1 style={S.title}>🛵 Rider Directory</h1>
            <p style={S.sub}>View delivery and payment histories for all riders.</p>
          </div>
        </div>

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
          </div>
        )}

        {riders.length === 0 ? (
          <div style={S.empty}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🛵</div>
            <h2 style={{ color: "#fff", fontWeight: 700, marginBottom: 8 }}>No Riders Found</h2>
            <p style={{ color: "#64748b" }}>Currently there are no delivery riders.</p>
          </div>
        ) : (
          <div style={S.grid}>
            {riders.map((rider, idx) => {
              const isActive = rider.status?.toLowerCase() === "active";
              return (
                <div key={rider._id} style={S.card}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 24px 48px rgba(0,0,0,0.35)"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.25)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = S.card.boxShadow; e.currentTarget.style.borderColor = S.card.border.replace("border:","").trim(); }}
                >
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

                  <div style={S.cardActions}>
                    <button style={S.histBtn}
                      onClick={() => navigate(`/rider-delivery-history/${rider._id}`)}>
                      📦 Delivery History
                    </button>
                    <button style={S.paidBtn}
                      onClick={() => navigate(`/rider-paid-history/${rider._id}`)}>
                      💰 Payment History
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

const S = {
  page:    { minHeight:"100vh", background:"linear-gradient(135deg,#0f172a 0%,#1e293b 100%)", fontFamily:'"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' },
  main:    { maxWidth:1400, margin:"0 auto", padding:"48px 32px" },

  centerMsg: { display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"60vh" },
  spinner:   { width:44,height:44,border:"4px solid rgba(139,92,246,0.25)",borderTop:"4px solid #8b5cf6",borderRadius:"50%",animation:"spin 0.8s linear infinite" },
  retryBtn:  { padding:"12px 28px",background:"linear-gradient(135deg,#3b82f6,#1d4ed8)",color:"#fff",border:"none",borderRadius:10,fontWeight:700,cursor:"pointer",fontSize:15 },

  topBar:     { display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:36,flexWrap:"wrap",gap:20 },
  title:      { fontSize:40,fontWeight:900,background:"linear-gradient(135deg,#fff 0%,#e2e8f0 70%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",letterSpacing:"-0.02em",margin:0,marginBottom:8 },
  sub:        { fontSize:16,color:"#64748b",margin:0 },

  statBar:  { display:"flex",gap:16,marginBottom:36,flexWrap:"wrap" },
  stat:     { flex:"1 1 140px",background:"rgba(30,41,59,0.7)",border:"1px solid rgba(148,163,184,0.1)",borderRadius:14,padding:"18px 22px", maxWidth: 200 },
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

  cardActions: { display:"flex",gap:8 },
  histBtn: { flex:1,padding:"12px 2px",background:"rgba(59,130,246,0.1)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:10,color:"#60a5fa",fontWeight:700,fontSize:13,cursor:"pointer",transition:"all 0.15s" },
  paidBtn: { flex:1,padding:"12px 2px",background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:10,color:"#34d399",fontWeight:700,fontSize:13,cursor:"pointer",transition:"all 0.15s" },
};
