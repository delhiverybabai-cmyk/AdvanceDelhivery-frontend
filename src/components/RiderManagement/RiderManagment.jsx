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
  addButton: {
    display: "flex",
    alignItems: "center",
    padding: "16px 32px",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    boxShadow: "0 8px 25px rgba(16, 185, 129, 0.3)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden",
  },
  riderButton: {
    display: "flex",
    alignItems: "center",
    padding: "16px 32px",
    background: "linear-gradient(135deg, #face1fff 0%, #face1fff 100%)",
    color: "#222",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    boxShadow: "0 6px 20px rgba(250, 206, 36, 0.6)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden",
  },
  addButtonIcon: {
    marginRight: "12px",
    fontSize: "18px",
  },
  ridersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "24px",
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
  },
  riderHeader: {
    display: "flex",
    alignItems: "center",
    margin: "0 0 12px 0",
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
    marginRight: "18px",
  },
  riderInfo: {
    flex: 1,
  },
  riderName: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#fff",
    marginBottom: "2px",
    letterSpacing: "-0.025em",
  },
  riderMobile: {
    fontSize: "14px",
    color: "#94a3b8",
  },
  riderStatItem: {
    textAlign: "center",
    padding: "8px 16px",
    background: "rgba(15, 23, 42, 0.5)",
    borderRadius: "8px",
    border: "1px solid rgba(148, 163, 184, 0.05)",
    color: "#fff",
    fontWeight: "600",
    fontSize: "14px",
    alignSelf: "flex-end",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 40px",
    color: "#94a3b8",
  },
  emptyIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
};

function getInitials(name) {
  return name
    .split(" ")
    .map((seg) => seg[0].toUpperCase())
    .join("")
    .slice(0, 2);
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
      // Optionally show toast here for error
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

        {filteredRiders.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>👥</div>
            <h3 style={styles.emptyTitle}>No Riders Found</h3>
            <p style={styles.emptyDescription}>
              Start by adding riders to your delivery team
            </p>
            <button
              style={styles.addButton}
              onClick={() => {
                navigate("/add-rider");
              }}
            >
              <span style={styles.addButtonIcon}>+</span> Add New Rider
            </button>
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
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div style={styles.riderStatItem}>RIDER</div>
                  </div>
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
