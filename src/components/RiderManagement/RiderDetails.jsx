import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const RiderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rider, setRider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const styles = {
    container: { minHeight: "100vh", backgroundColor: "#0f172a", fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" },
    main: { maxWidth: "1200px", margin: "0 auto", padding: "48px 32px" },
    backButton: { display: "flex", alignItems: "center", padding: "12px 20px", background: "rgba(148, 163, 184, 0.1)", color: "#94a3b8", border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "500", transition: "all 0.3s ease", marginBottom: "24px" },
    mainTitle: { fontSize: "42px", fontWeight: "800", background: "linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "8px", letterSpacing: "-0.02em" },
    subtitle: { fontSize: "16px", color: "#64748b", lineHeight: "1.6" },
    actionButtons: { display: "flex", gap: "12px", flexWrap: "wrap" },
    updateButton: { display: "flex", alignItems: "center", padding: "14px 24px", background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", color: "#ffffff", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: "600", transition: "all 0.3s", boxShadow: "0 6px 20px rgba(59, 130, 246, 0.3)" },
    debtButton: { display: "flex", alignItems: "center", padding: "14px 24px", background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", color: "#ffffff", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: "600", transition: "all 0.3s", boxShadow: "0 6px 20px rgba(245, 158, 11, 0.3)" },
    headerSection: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px", flexWrap: "wrap", gap: "24px" },
    detailsContainer: { background: "linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)", backdropFilter: "blur(10px)", border: "1px solid rgba(148, 163, 184, 0.1)", borderRadius: "20px", padding: "40px", position: "relative" },
    riderProfile: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", padding: "32px", background: "rgba(15, 23, 42, 0.5)", borderRadius: "16px", border: "1px solid rgba(148, 163, 184, 0.05)", flexWrap: "wrap", gap: "24px" },
    riderMainInfo: { display: "flex", alignItems: "center", flex: 1, minWidth: "300px" },
    riderAvatar: { width: "80px", height: "80px", borderRadius: "20px", background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontWeight: "700", fontSize: "28px", marginRight: "24px", boxShadow: "0 12px 30px rgba(59, 130, 246, 0.4)" },
    riderName: { fontSize: "28px", fontWeight: "700", color: "#ffffff", marginBottom: "8px" },
    riderMobile: { fontSize: "16px", color: "#94a3b8", marginBottom: "8px" },
    riderEarnings: { fontSize: "18px", fontWeight: "600", color: "#10b981" },
    profileButtons: { display: "flex", gap: "12px", flexWrap: "wrap" },
    profileButton: { display: "flex", alignItems: "center", padding: "12px 20px", background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", border: "1px solid rgba(59, 130, 246, 0.2)", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600", transition: "all 0.3s" },
    paidButton: { background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b", border: "1px solid rgba(245, 158, 11, 0.2)" },
    riderDetails: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px" },
    detailCard: { padding: "24px", background: "rgba(15, 23, 42, 0.3)", borderRadius: "12px", border: "1px solid rgba(148, 163, 184, 0.05)", textAlign: "center" },
    detailLabel: { fontSize: "12px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" },
    detailValue: { fontSize: "18px", fontWeight: "700", color: "#ffffff" },
    loadingContainer: { display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "400px" },
    loadingSpinner: { width: "40px", height: "40px", border: "3px solid rgba(59, 130, 246, 0.3)", borderTop: "3px solid #3b82f6", borderRadius: "50%", marginBottom: "16px" },
    loadingText: { color: "#94a3b8", fontSize: "16px" },
    errorContainer: { textAlign: "center", padding: "60px 40px", color: "#ef4444", background: "rgba(239, 68, 68, 0.1)", borderRadius: "12px", border: "1px solid rgba(239, 68, 68, 0.2)" },
  };

  const SpinnerComponent = () => {
    const [rotation, setRotation] = useState(0);
    useEffect(() => { const interval = setInterval(() => setRotation(prev => (prev + 10) % 360), 50); return () => clearInterval(interval); }, []);
    return <div style={{ ...styles.loadingSpinner, transform: `rotate(${rotation}deg)` }} />;
  };

  useEffect(() => { fetchRiderDetails(); }, [id]);

  const fetchRiderDetails = async () => {
    try {
      setLoading(true); setError(null);
      const [riderRes, balanceRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_BASE_URL}/api/rider/get-rider/${id}`),
        axios.get(`${process.env.REACT_APP_BASE_URL}/api/rider-payment/total-amount/${id}`)
      ]);
      const riderData = riderRes.data?.data || riderRes.data;
      const balance = balanceRes.data?.data?.balance ?? 0;
      setRider({ ...riderData, totalEarnings: balance });
    } catch (err) {
      setError(err.response?.status === 404 ? "Rider not found." : "Failed to load rider details.");
    } finally { setLoading(false); }
  };

  const getInitials = (name) => {
    if (!name) return "NR";
    return name.split(" ").map(w => w.charAt(0)).join("").toUpperCase().slice(0, 2);
  };
  const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(amount);
  const formatDate = (d) => {
    if (!d) return "N/A";
    const date = new Date(d);
    return isNaN(date.getTime()) ? "Invalid Date" : new Intl.DateTimeFormat("en-IN", { year: "numeric", month: "long", day: "numeric" }).format(date);
  };

  const hover = (e, enter, type) => {
    if (enter) {
      if (type === "back") { e.currentTarget.style.background = "rgba(148,163,184,0.2)"; e.currentTarget.style.color = "#e2e8f0"; }
      else { e.currentTarget.style.transform = "translateY(-2px) scale(1.05)"; }
    } else {
      if (type === "back") { e.currentTarget.style.background = "rgba(148,163,184,0.1)"; e.currentTarget.style.color = "#94a3b8"; }
      else { e.currentTarget.style.transform = "translateY(0) scale(1)"; }
    }
  };

  if (loading) return <div style={styles.container}><main style={styles.main}><div style={styles.loadingContainer}><SpinnerComponent /><div style={styles.loadingText}>Loading rider details...</div></div></main></div>;
  if (error) return <div style={styles.container}><main style={styles.main}><div style={styles.errorContainer}><h3>⚠️ Error</h3><p>{error}</p><button style={{ padding: "12px 24px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }} onClick={fetchRiderDetails}>🔄 Retry</button></div></main></div>;
  if (!rider) return null;

  return (
    <div style={styles.container}>
      <main style={styles.main}>
        <button style={styles.backButton} onClick={() => navigate("/rider-management")} onMouseEnter={e => hover(e, true, "back")} onMouseLeave={e => hover(e, false, "back")}>← Back to Riders</button>
        <div style={styles.headerSection}>
          <div><h1 style={styles.mainTitle}>Rider Details</h1><p style={styles.subtitle}>Complete information and management options</p></div>
          <div style={styles.actionButtons}>
            <button style={styles.updateButton} onClick={() => navigate(`/update-rider/${id}`)} onMouseEnter={e => hover(e, true, "update")} onMouseLeave={e => hover(e, false, "update")}><span style={{ marginRight: "8px" }}>✏️</span>Update Details</button>
            <button style={styles.debtButton} onClick={() => navigate(`/rider-debt/${id}`)} onMouseEnter={e => hover(e, true, "debt")} onMouseLeave={e => hover(e, false, "debt")}><span style={{ marginRight: "8px" }}>💳</span>Manage Debt</button>
          </div>
        </div>
        <div style={styles.detailsContainer}>
          <div style={styles.riderProfile}>
            <div style={styles.riderMainInfo}>
              <div style={styles.riderAvatar}>{getInitials(rider.name)}</div>
              <div>
                <h2 style={styles.riderName}>{rider.name}</h2>
                <p style={styles.riderMobile}>📱 {Array.isArray(rider.mobileNumber) ? rider.mobileNumber.join(", ") : rider.mobileNumber}</p>
                <p style={styles.riderEarnings}>💰 {formatCurrency(rider.totalEarnings)} (Payable Amount)</p>
              </div>
            </div>
            <div style={styles.profileButtons}>
              <button style={styles.profileButton} onClick={() => navigate(`/rider-delivery-history/${id}`)}><span style={{ marginRight: "6px" }}>📦</span>Delivery History</button>
              <button style={{ ...styles.profileButton, ...styles.paidButton }} onClick={() => navigate(`/rider-paid-history/${id}`)}><span style={{ marginRight: "6px" }}>💰</span>Paid History</button>
            </div>
          </div>
          <div style={styles.riderDetails}>
            <div style={styles.detailCard}><div style={styles.detailLabel}>Per Parcel Rate</div><div style={styles.detailValue}>₹{rider.perParcelRate}</div></div>
            <div style={styles.detailCard}><div style={styles.detailLabel}>Joined Date</div><div style={styles.detailValue}>{formatDate(rider.createdAt)}</div></div>
            <div style={styles.detailCard}><div style={styles.detailLabel}>Last Updated</div><div style={styles.detailValue}>{formatDate(rider.updatedAt)}</div></div>
            <div style={styles.detailCard}><div style={styles.detailLabel}>Rider ID</div><div style={{ ...styles.detailValue, fontSize: "12px" }}>{rider._id}</div></div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RiderDetails;
