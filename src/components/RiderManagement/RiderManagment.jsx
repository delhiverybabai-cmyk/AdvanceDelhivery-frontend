import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import RiderPaymentLedger from "./RiderPaymentLedger";

const BASE = process.env.REACT_APP_BASE_URL;

function getInitials(name) {
  return (
    name.split(" ").map((seg) => seg[0]?.toUpperCase() || "").join("").slice(0, 2) || "R"
  );
}

function RiderManagment() {
  const navigate = useNavigate();
  const [riders,       setRiders]       = useState([]);
  const [balances,     setBalances]     = useState({}); // riderId → { currentBalance, ... }
  const [isActive,     setIsActive]     = useState(true);
  const [hoveredCard,  setHoveredCard]  = useState(null);
  const [hoveredButton,setHoveredButton]= useState(null);

  // Ledger modal
  const [ledgerRider, setLedgerRider] = useState(null);

  const fetchRider = async () => {
    try {
      const response = await axios.get(`${BASE}/api/rider/get-riders`, {
        headers: { "Content-Type": "application/json" },
      });
      if (response.data.success) {
        const list = response.data.data;
        setRiders(list);
        // Build balance map directly from the rider docs (denormalized fields).
        // For riders that pre-date the schema change, fallback to the balance API.
        const preloaded = {};
        const needsFetch = [];
        list.forEach((r) => {
          if (r.currentBalance !== undefined) {
            preloaded[r._id] = {
              currentBalance: r.currentBalance,
              totalCredits:   r.totalCredits  ?? 0,
              totalDebits:    r.totalDebits   ?? 0,
              txCount:        r.totalTxCount  ?? 0,
            };
          } else {
            needsFetch.push(r);
          }
        });
        setBalances(preloaded);
        if (needsFetch.length > 0) fetchAllBalances(needsFetch);
      }
    } catch (error) {
      console.error("Error fetching riders: ", error);
    }
  };

  const fetchAllBalances = async (riderList) => {
    const results = await Promise.allSettled(
      riderList.map((r) =>
        axios.get(`${BASE}/api/payments/balance/${r._id}`).then((res) => ({
          id: r._id,
          data: res.data,
        }))
      )
    );
    const map = {};
    results.forEach((r) => {
      if (r.status === "fulfilled") map[r.value.id] = r.value.data;
    });
    setBalances((prev) => ({ ...prev, ...map }));
  };

  useEffect(() => { fetchRider(); }, []); // eslint-disable-line

  const filteredRiders = riders.filter((rider) =>
    isActive
      ? rider.status.toLowerCase() === "active"
      : rider.status.toLowerCase() === "inactive"
  );

  return (
    <div style={styles.container}>
      <main style={styles.main}>
        <div style={styles.headerSection}>
          <div style={styles.titleSection}>
            <h2 style={styles.mainTitle}>Rider Management</h2>
            <p style={styles.subtitle}>Manage and monitor your delivery team members</p>
          </div>
          <div style={styles.buttonGroup}>
            <button
              style={{ ...styles.addButton, ...(hoveredButton === "add" ? styles.addButtonHover : {}) }}
              onClick={() => navigate("/add-rider")}
              onMouseEnter={() => setHoveredButton("add")}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <span style={styles.addButtonIcon}>+</span>
              Add New Rider
            </button>
            <button
              style={{ ...styles.riderButton, ...(hoveredButton === "toggle" ? styles.riderButtonHover : {}) }}
              onClick={() => setIsActive(!isActive)}
              onMouseEnter={() => setHoveredButton("toggle")}
              onMouseLeave={() => setHoveredButton(null)}
            >
              {isActive ? "⏳ Pending Riders" : "✅ Active Riders"}
            </button>
          </div>
        </div>

        {filteredRiders.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>👥</div>
            <h3 style={styles.emptyTitle}>No Riders Found</h3>
            <p style={styles.emptyDescription}>
              {isActive
                ? "No active riders in the system. Add new riders to get started."
                : "No pending riders at the moment."}
            </p>
          </div>
        ) : (
          <div style={styles.ridersGrid}>
            {filteredRiders.map((rider) => {
              const bal     = balances[rider._id];
              const balance = bal?.currentBalance ?? null;
              const isPos   = balance !== null && balance >= 0;

              return (
                <div
                  key={rider._id}
                  style={{
                    ...styles.riderCard,
                    ...(hoveredCard === rider._id ? styles.riderCardHover : {}),
                  }}
                  onClick={() => navigate(`/rider-details/${rider._id}`)}
                  onMouseEnter={() => setHoveredCard(rider._id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div style={styles.riderHeader}>
                    <div style={styles.riderAvatar}>{getInitials(rider.name)}</div>
                    <div style={styles.riderInfo}>
                      <div style={styles.riderName}>{rider.name}</div>
                      <div style={styles.riderMobile}>📱 {rider.mobileNumber}</div>
                    </div>
                  </div>

                  {/* Balance strip */}
                  <div style={styles.balanceStrip}>
                    <div>
                      <div style={styles.balLabel}>Earnings Balance</div>
                      <div
                        style={{
                          ...styles.balValue,
                          color: balance === null ? "#475569" : isPos ? "#34d399" : "#f87171",
                        }}
                      >
                        {balance === null
                          ? "— Loading"
                          : `₹${Number(balance).toLocaleString("en-IN")}`}
                      </div>
                    </div>
                    <button
                      style={styles.ledgerBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setLedgerRider(rider);
                      }}
                    >
                      📊 Manage
                    </button>
                  </div>

                  <div style={styles.riderFooter}>
                    <div style={styles.statusBadge}>
                      <span style={styles.statusDot} />
                      Active
                    </div>
                    <div style={styles.riderBadge}>Rider</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Payment Ledger Modal */}
      <RiderPaymentLedger
        rider={ledgerRider}
        isOpen={!!ledgerRider}
        onClose={() => {
          setLedgerRider(null);
          // Refresh balances after any changes
          fetchAllBalances(riders);
        }}
      />
    </div>
  );
}

export default RiderManagment;

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    padding: "24px",
  },
  main: { maxWidth: "1400px", margin: "0 auto", padding: "32px 0" },
  headerSection: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: "40px", flexWrap: "wrap", gap: "20px",
  },
  titleSection: { flex: 1, minWidth: "280px" },
  mainTitle: {
    fontSize: "36px", fontWeight: "800",
    background: "linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)",
    backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    marginBottom: "8px", letterSpacing: "-0.02em", lineHeight: "1.2",
  },
  subtitle: { fontSize: "15px", color: "#64748b", lineHeight: "1.6" },
  buttonGroup: { display: "flex", gap: "12px", flexWrap: "wrap" },
  addButton: {
    display: "flex", alignItems: "center", gap: "8px",
    padding: "12px 24px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#ffffff", border: "none", borderRadius: "10px", cursor: "pointer",
    fontSize: "14px", fontWeight: "600", boxShadow: "0 2px 8px rgba(16,185,129,0.2)",
    transition: "all 0.2s ease", whiteSpace: "nowrap",
  },
  addButtonHover: { transform: "translateY(-2px)", boxShadow: "0 6px 16px rgba(16,185,129,0.3)" },
  riderButton: {
    display: "flex", alignItems: "center", gap: "8px",
    padding: "12px 24px", background: "rgba(51,65,85,0.4)", backdropFilter: "blur(10px)",
    color: "#e2e8f0", border: "1px solid rgba(148,163,184,0.2)", borderRadius: "10px",
    cursor: "pointer", fontSize: "14px", fontWeight: "600", transition: "all 0.2s ease", whiteSpace: "nowrap",
  },
  riderButtonHover: { background: "rgba(51,65,85,0.6)", borderColor: "rgba(148,163,184,0.4)" },
  addButtonIcon: { fontSize: "18px", fontWeight: "700" },
  ridersGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "20px", width: "100%",
  },
  riderCard: {
    background: "linear-gradient(145deg, rgba(30,41,59,0.6) 0%, rgba(15,23,42,0.8) 100%)",
    backdropFilter: "blur(20px)", border: "1px solid rgba(148,163,184,0.1)",
    borderRadius: "16px", padding: "24px", cursor: "pointer",
    transition: "all 0.2s ease", boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    display: "flex", flexDirection: "column", gap: "16px",
  },
  riderCardHover: { transform: "translateY(-4px)", boxShadow: "0 8px 24px rgba(0,0,0,0.2)", borderColor: "rgba(148,163,184,0.25)" },
  riderHeader: { display: "flex", alignItems: "center", gap: "16px" },
  riderAvatar: {
    width: "52px", height: "52px", borderRadius: "14px",
    background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    color: "#fff", fontWeight: "700", fontSize: "20px",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, boxShadow: "0 4px 12px rgba(59,130,246,0.25)",
  },
  riderInfo: { flex: 1, minWidth: 0, overflow: "hidden" },
  riderName: {
    fontSize: "18px", fontWeight: "700", color: "#f1f5f9", marginBottom: "4px",
    letterSpacing: "-0.015em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  },
  riderMobile: { fontSize: "13px", color: "#94a3b8", fontWeight: "500" },
  // Balance strip
  balanceStrip: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    background: "rgba(15,23,42,0.4)", border: "1px solid rgba(148,163,184,0.07)",
    borderRadius: 10, padding: "10px 14px",
  },
  balLabel: { fontSize: 11, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 3 },
  balValue: { fontSize: 17, fontWeight: 800, fontFamily: "monospace" },
  ledgerBtn: {
    padding: "7px 14px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.35)",
    color: "#a5b4fc", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
    whiteSpace: "nowrap", flexShrink: 0,
  },
  riderFooter: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    paddingTop: "12px", borderTop: "1px solid rgba(148,163,184,0.1)",
  },
  statusBadge: {
    display: "flex", alignItems: "center", gap: "6px",
    padding: "6px 12px", background: "rgba(16,185,129,0.1)",
    borderRadius: "8px", color: "#10b981", fontWeight: "600", fontSize: "12px",
  },
  statusDot: { width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" },
  riderBadge: {
    padding: "6px 12px", background: "rgba(59,130,246,0.1)",
    borderRadius: "8px", border: "1px solid rgba(59,130,246,0.2)",
    color: "#3b82f6", fontWeight: "600", fontSize: "11px",
    textTransform: "uppercase", letterSpacing: "0.5px",
  },
  emptyState: { textAlign: "center", padding: "100px 40px", color: "#64748b" },
  emptyIcon:  { fontSize: "64px", marginBottom: "20px", opacity: 0.4 },
  emptyTitle: { fontSize: "22px", fontWeight: "700", color: "#cbd5e1", marginBottom: "10px" },
  emptyDescription: { fontSize: "15px", color: "#64748b", lineHeight: "1.6" },
};
