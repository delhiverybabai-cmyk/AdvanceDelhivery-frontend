import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RiderManagment = () => {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const styles = {
    container: { minHeight: "100vh", backgroundColor: "#0f172a", fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" },
    main: { maxWidth: "1400px", margin: "0 auto", padding: "48px 32px" },
    headerSection: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "56px", flexWrap: "wrap", gap: "24px" },
    titleSection: { flex: 1, textAlign: "left" },
    mainTitle: { fontSize: "48px", fontWeight: "800", background: "linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "16px", letterSpacing: "-0.02em" },
    subtitle: { fontSize: "18px", color: "#94a3b8", lineHeight: "1.6", maxWidth: "500px" },
    buttonGroup: { display: "flex", gap: "16px" },
    addButton: { display: "flex", alignItems: "center", padding: "16px 32px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "#ffffff", border: "none", borderRadius: "12px", cursor: "pointer", fontSize: "16px", fontWeight: "600", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", boxShadow: "0 8px 25px rgba(16, 185, 129, 0.3)", position: "relative", overflow: "hidden" },
    expenseButton: { display: "flex", alignItems: "center", padding: "16px 32px", background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", color: "#ffffff", border: "none", borderRadius: "12px", cursor: "pointer", fontSize: "16px", fontWeight: "600", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", boxShadow: "0 8px 25px rgba(59, 130, 246, 0.3)", position: "relative", overflow: "hidden" },
    addButtonIcon: { marginRight: "12px", fontSize: "18px" },
    ridersGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "24px" },
    riderCard: { background: "linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)", backdropFilter: "blur(10px)", border: "1px solid rgba(148, 163, 184, 0.1)", borderRadius: "16px", padding: "32px", cursor: "pointer", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", position: "relative", overflow: "hidden" },
    riderHeader: { display: "flex", alignItems: "center", marginBottom: "28px" },
    riderAvatar: { width: "64px", height: "64px", borderRadius: "16px", background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontWeight: "700", fontSize: "24px", marginRight: "20px", boxShadow: "0 10px 25px rgba(59, 130, 246, 0.4)", textTransform: "uppercase" },
    riderInfo: { flex: 1 },
    riderName: { fontSize: "22px", fontWeight: "700", color: "#ffffff", marginBottom: "6px", letterSpacing: "-0.01em" },
    riderMobile: { fontSize: "15px", color: "#94a3b8", display: "flex", alignItems: "center" },
    riderMobileIcon: { marginRight: "6px", fontSize: "14px", opacity: 0.7 },
    riderDetails: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "28px", padding: "20px", background: "rgba(15, 23, 42, 0.4)", borderRadius: "12px", border: "1px solid rgba(148, 163, 184, 0.05)" },
    detailColumn: { display: "flex", flexDirection: "column" },
    detailLabel: { fontSize: "13px", color: "#64748b", marginBottom: "6px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.05em" },
    detailValue: { fontSize: "18px", fontWeight: "700", color: "#e2e8f0" },
    riderFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "24px", borderTop: "1px solid rgba(148, 163, 184, 0.1)" },
    statusBadge: { padding: "8px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: "600", letterSpacing: "0.02em" },
    statusActive: { background: "rgba(16, 185, 129, 0.1)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.2)" },
    statusInactive: { background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)" },
    viewDetailsText: { fontSize: "14px", fontWeight: "600", color: "#3b82f6", display: "flex", alignItems: "center", transition: "all 0.2s ease" },
    viewDetailsArrow: { marginLeft: "4px", transition: "transform 0.2s ease" },
    loadingContainer: { display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "400px" },
    loadingSpinner: { width: "48px", height: "48px", border: "4px solid rgba(59, 130, 246, 0.3)", borderTop: "4px solid #3b82f6", borderRadius: "50%", marginBottom: "24px" },
    loadingText: { color: "#94a3b8", fontSize: "18px", fontWeight: "500", letterSpacing: "0.02em" },
    errorContainer: { textAlign: "center", padding: "80px 40px", backgroundColor: "rgba(239, 68, 68, 0.05)", borderRadius: "24px", border: "1px solid rgba(239, 68, 68, 0.1)" },
    errorTitle: { fontSize: "24px", fontWeight: "700", color: "#ef4444", marginBottom: "16px" },
    errorText: { fontSize: "16px", color: "#94a3b8", maxWidth: "400px", margin: "0 auto", lineHeight: "1.6" },
    emptyState: { textAlign: "center", padding: "100px 40px", backgroundColor: "rgba(30, 41, 59, 0.3)", borderRadius: "24px", border: "1px dashed rgba(148, 163, 184, 0.2)" },
    emptyIcon: { fontSize: "64px", marginBottom: "24px", opacity: 0.5 },
    emptyTitle: { fontSize: "24px", fontWeight: "700", color: "#ffffff", marginBottom: "12px" },
    emptyText: { fontSize: "16px", color: "#94a3b8", maxWidth: "400px", margin: "0 auto" },
  };

  const SpinnerComponent = () => {
    const [rotation, setRotation] = useState(0);
    useEffect(() => { const interval = setInterval(() => setRotation(prev => (prev + 10) % 360), 50); return () => clearInterval(interval); }, []);
    return <div style={{ ...styles.loadingSpinner, transform: `rotate(${rotation}deg)` }} />;
  };

  useEffect(() => {
    fetchRiders();
  }, []);

  const fetchRiders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/rider/get-riders`);
      setRiders(res.data?.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch riders");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name ? name.split(" ").map(w => w.charAt(0)).join("").toUpperCase().slice(0, 2) : "NR";
  };

  const navigateToDetails = (id) => {
    navigate(`/rider-details/${id}`);
  };

  if (loading) return <div style={styles.container}><main style={styles.main}><div style={styles.loadingContainer}><SpinnerComponent /><div style={styles.loadingText}>Loading riders...</div></div></main></div>;
  if (error) return <div style={styles.container}><main style={styles.main}><div style={styles.errorContainer}><h3 style={styles.errorTitle}>Oops! Something went wrong</h3><p style={styles.errorText}>{error}</p><button onClick={fetchRiders} style={{ ...styles.addButton, marginTop: "24px", display: "inline-flex" }}>Try Again</button></div></main></div>;

  return (
    <div style={styles.container}>
      <main style={styles.main}>
        <div style={styles.headerSection}>
          <div style={styles.titleSection}>
            <h1 style={styles.mainTitle}>Rider Management</h1>
            <p style={styles.subtitle}>Manage your delivery fleet, track performance, and handle rider information efficiently.</p>
          </div>
          <div style={styles.buttonGroup}>
            <button
              style={styles.expenseButton}
              onClick={() => navigate("/expence-profit")}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 30px rgba(59, 130, 246, 0.4)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 25px rgba(59, 130, 246, 0.3)"; }}
            >
              <span style={styles.addButtonIcon}>💼</span>
              Company Expenses
            </button>
            <button
              style={styles.addButton}
              onClick={() => navigate("/add-rider")}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 30px rgba(16, 185, 129, 0.4)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 25px rgba(16, 185, 129, 0.3)"; }}
            >
              <span style={styles.addButtonIcon}>+</span>
              Add New Rider
            </button>
          </div>
        </div>
        {riders.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🛵</div>
            <h2 style={styles.emptyTitle}>No Riders Found</h2>
            <p style={styles.emptyText}>Get started by adding your first delivery rider to the system.</p>
          </div>
        ) : (
          <div style={styles.ridersGrid}>
            {riders.map((rider) => (
              <div
                key={rider._id}
                style={styles.riderCard}
                onClick={() => navigateToDetails(rider._id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.3)";
                  e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.3)";
                  const arrow = e.currentTarget.querySelector(".view-arrow");
                  if (arrow) arrow.style.transform = "translateX(4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.1)";
                  const arrow = e.currentTarget.querySelector(".view-arrow");
                  if (arrow) arrow.style.transform = "translateX(0)";
                }}
              >
                <div style={styles.riderHeader}>
                  <div style={styles.riderAvatar}>{getInitials(rider.name)}</div>
                  <div style={styles.riderInfo}>
                    <div style={styles.riderName}>{rider.name}</div>
                    <div style={styles.riderMobile}><span style={styles.riderMobileIcon}>📱</span>{Array.isArray(rider.mobileNumber) ? rider.mobileNumber.join(", ") : rider.mobileNumber}</div>
                  </div>
                </div>
                <div style={styles.riderDetails}>
                  <div style={styles.detailColumn}>
                    <span style={styles.detailLabel}>Rate/Parcel</span>
                    <span style={styles.detailValue}>₹{rider.perParcelRate}</span>
                  </div>
                  <div style={styles.detailColumn}>
                    <span style={styles.detailLabel}>Joined Date</span>
                    <span style={styles.detailValue}>{new Date(rider.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                </div>
                <div style={styles.riderFooter}>
                  <span style={{ ...styles.statusBadge, ...(rider.status?.toLowerCase() === "active" ? styles.statusActive : styles.statusInactive) }}>
                    {rider.status?.toLowerCase() === "active" ? "● Active" : "● Inactive"}
                  </span>
                  <div style={styles.viewDetailsText}>
                    View Details
                    <span className="view-arrow" style={styles.viewDetailsArrow}>→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default RiderManagment;
