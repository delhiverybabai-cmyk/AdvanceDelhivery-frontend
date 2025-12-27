import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#0f172a 0%,#1e293b 100%)",
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    paddingBottom: "42px",
  },
  main: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "48px 32px",
  },
  headerSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "56px",
    flexWrap: "wrap",
    gap: "24px",
  },
  titleSection: {
    flex: 1,
    textAlign: "left",
  },
  mainTitle: {
    fontSize: "48px",
    fontWeight: "800",
    background: "linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "16px",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    fontSize: "18px",
    color: "#94a3b8",
    lineHeight: "1.6",
    maxWidth: "500px",
  },
  buttonGroup: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
  },
  addButton: {
    display: "flex",
    alignItems: "center",
    padding: "15px 30px",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    boxShadow: "0 8px 25px rgba(16, 185, 129, 0.3)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    whiteSpace: "nowrap",
  },
  riderButton: {
    display: "flex",
    alignItems: "center",
    padding: "15px 30px",
    background: "linear-gradient(135deg, #face1f 0%, #f59e0b 100%)",
    color: "#222",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    boxShadow: "0 6px 20px rgba(250, 206, 36, 0.4)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    whiteSpace: "nowrap",
  },
  addButtonIcon: {
    marginRight: "12px",
    fontSize: "18px",
  },
  // ✅ Fixed grid - prevents stretching with single item
  ridersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 350px))", // ✅ Fixed width
    gap: "24px",
    justifyContent: "start", // ✅ Align left instead of stretch
  },
  riderCard: {
    background:
      "linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(148, 163, 184, 0.1)",
    borderRadius: "16px",
    padding: "24px",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    cursor: "pointer",
    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
    width: "100%", // ✅ Fill grid cell
  },
  riderHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  riderAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: "linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%)",
    color: "#fff",
    fontWeight: "700",
    fontSize: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  riderInfo: {
    flex: 1,
    minWidth: 0, // ✅ Prevent text overflow
  },
  riderName: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#fff",
    marginBottom: "4px",
    letterSpacing: "-0.025em",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  riderMobile: {
    fontSize: "14px",
    color: "#94a3b8",
  },
  riderStatItem: {
    padding: "6px 14px",
    background: "rgba(15, 23, 42, 0.6)",
    borderRadius: "8px",
    border: "1px solid rgba(148, 163, 184, 0.15)",
    color: "#10b981",
    fontWeight: "600",
    fontSize: "13px",
    flexShrink: 0,
  },
  emptyState: {
    textAlign: "center",
    padding: "80px 40px",
    color: "#94a3b8",
  },
  emptyIcon: {
    fontSize: "64px",
    marginBottom: "16px",
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: "22px",
    fontWeight: "600",
    color: "#e2e8f0",
    marginBottom: "8px",
  },
  emptyDescription: {
    fontSize: "16px",
    color: "#94a3b8",
  },
};

function getInitials(name) {
  return (
    name
      .split(" ")
      .map((seg) => seg[0]?.toUpperCase() || "")
      .join("")
      .slice(0, 2) || "R"
  );
}

function RiderManagment() {
  const navigate = useNavigate();
  const [riders, setRiders] = useState([]);
  const [isActive, setIsActive] = useState(true);

  const fetchRider = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/rider/get-riders`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response.data.success) {
        setRiders(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching riders: ", error);
    }
  };

  React.useEffect(() => {
    fetchRider();
  }, []);

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
            <p style={styles.subtitle}>
              View all registered riders in your delivery team
            </p>
          </div>
          <div style={styles.buttonGroup}>
            <button
              style={styles.addButton}
              onClick={() => {
                navigate("/add-rider");
              }}
            >
              <span style={styles.addButtonIcon}>+</span> Add New Rider
            </button>

            <button
              style={styles.riderButton}
              onClick={() => setIsActive(!isActive)}
            >
              {isActive ? "Show Pending Riders" : "Show Active Riders"}
            </button>
          </div>
        </div>

        {filteredRiders.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>👥</div>
            <h3 style={styles.emptyTitle}>No Riders Found</h3>
            <p style={styles.emptyDescription}>
              {isActive
                ? "No active riders in the system"
                : "No pending riders at the moment"}
            </p>
          </div>
        ) : (
          <div style={styles.ridersGrid}>
            {filteredRiders.map((rider) => (
              <div
                key={rider._id}
                style={styles.riderCard}
                onClick={() => navigate(`/rider-details/${rider._id}`)}
              >
                <div style={styles.riderHeader}>
                  <div style={styles.riderAvatar}>
                    {getInitials(rider.name)}
                  </div>
                  <div style={styles.riderInfo}>
                    <div style={styles.riderName}>{rider.name}</div>
                    <div style={styles.riderMobile}>{rider.mobileNumber}</div>
                  </div>
                  <div style={styles.riderStatItem}>RIDER</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default RiderManagment;
