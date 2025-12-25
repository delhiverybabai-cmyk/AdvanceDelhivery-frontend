import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#0f172a 0%,#1e293b 100%)",
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  main: {
    maxWidth: "1300px",
    margin: "0 auto",
    padding: "48px 32px",
  },
  headerSection: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: "25px",
    gap: "24px",
    flexWrap: "wrap",
  },
  mainTitle: {
    fontSize: "44px",
    color: "#ffffff",
    fontWeight: "800",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    marginBottom: "8px",
    letterSpacing: "-0.03em",
  },
  subtitle: {
    fontSize: "18px",
    color: "#94a3b8",
    fontWeight: 500,
    marginBottom: "2px",
  },
  refreshBtn: {
    background: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 97%)",
    color: "#fff",
    padding: "12px 28px",
    border: "none",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "15px",
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 3px 12px #3b82f658",
  },
  summaryCard: {
    background:
      "linear-gradient(145deg, rgba(30,41,59,0.88) 0%, rgba(15,23,42,0.97) 100%)",
    border: "1.5px solid rgba(148,163,184,0.14)",
    borderRadius: "18px",
    padding: "28px",
    boxShadow: "0 3px 14px rgba(51,84,124,0.07)",
    marginBottom: "30px",
    textAlign: "center",
  },
  cardLabel: {
    fontSize: "16px",
    color: "#94a3b8",
    fontWeight: 600,
    marginBottom: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  cardValue: {
    fontSize: "48px",
    color: "#ffffff",
    fontWeight: "800",
  },
  tableContainer: {
    background:
      "linear-gradient(145deg, rgba(30,41,59,0.88) 0%, rgba(15,23,42,0.97) 100%)",
    border: "1.5px solid rgba(148,163,184,0.14)",
    borderRadius: "18px",
    boxShadow: "0 3px 14px rgba(51,84,124,0.07)",
    overflowX: "auto",
    marginTop: "10px",
    padding: "18px",
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: "0",
    background: "transparent",
    fontSize: "15px",
  },
  th: {
    padding: "18px 12px",
    background: "rgba(23,31,42,0.96)",
    color: "#a7e0ff",
    fontWeight: "700",
    fontSize: "14px",
    borderBottom: "2px solid #213553",
    borderRight: "1px solid #22293b",
    textAlign: "left",
    letterSpacing: "0.04em",
  },
  td: {
    padding: "16px 12px",
    color: "#eaf4ff",
    borderBottom: "1px solid #203559",
    fontWeight: "500",
    background: "rgba(24,28,44,0.93)",
  },
  copyBtn: {
    background: "linear-gradient(90deg, #fed656 0%, #ffd600 98%)",
    color: "#222",
    padding: "8px 16px",
    border: "none",
    borderRadius: "8px",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    marginRight: "8px",
    boxShadow: "0 2px 8px #e6f51d48",
    transition: "all 0.2s",
  },
  badge: {
    background: "#ef444433",
    color: "#ef4444",
    borderRadius: "7px",
    padding: "6px 16px",
    fontWeight: "700",
    fontSize: "13px",
    display: "inline-block",
  },
  tableRow: {
    transition: "background 0.14s",
    cursor: "pointer",
  },
  evenRow: { backgroundColor: "rgba(15,23,42,0.12)" },
  oddRow: { backgroundColor: "rgba(30,41,59,0.05)" },
};

const CSEscalation = () => {
  const [escalationData, setEscalationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedWbn, setCopiedWbn] = useState(null);

  useEffect(() => {
    fetchEscalationData();
  }, []);

  const fetchEscalationData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/flow/fetch-escalation`,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        // Handle both array and object responses
        const data = Array.isArray(response.data.data)
          ? response.data.data
          : response.data.data?.shipments || [];
        setEscalationData(data);
        toast.success("Escalation data loaded successfully!");
      } else {
        toast.error("Failed to fetch escalation data");
        setEscalationData([]);
      }
    } catch (error) {
      toast.error("Error fetching escalation data");
      console.error("Error fetching escalation data:", error);
      setEscalationData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyWaybill = async (wbn) => {
    try {
      await navigator.clipboard.writeText(wbn);
      setCopiedWbn(wbn);
      toast.success(`Waybill ${wbn} copied to clipboard!`);
      setTimeout(() => setCopiedWbn(null), 2000);
    } catch (error) {
      toast.error("Failed to copy waybill");
      console.error("Failed to copy:", error);
    }
  };

  const handleRefresh = () => {
    fetchEscalationData();
  };

  return (
    <div style={styles.container}>
      <ToastContainer position="top-right" autoClose={3000} />
      <main style={styles.main}>
        <div style={styles.headerSection}>
          <div>
            <h2 style={styles.mainTitle}>CS Escalation</h2>
            <div style={styles.subtitle}>
              AVTD (Attempted Verification To Deliver) shipments requiring
              attention
            </div>
          </div>
          <button
            style={styles.refreshBtn}
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>

        {/* Summary Card */}
        {!loading && (
          <div style={styles.summaryCard}>
            <div style={styles.cardLabel}>Total Escalations</div>
            <div style={styles.cardValue}>{escalationData.length}</div>
          </div>
        )}

        {/* Escalation Table */}
        <div style={styles.tableContainer}>
          {loading ? (
            <div
              style={{
                color: "#b7d5fd",
                fontSize: "18px",
                textAlign: "center",
                margin: "46px 0",
              }}
            >
              Loading escalation data...
            </div>
          ) : escalationData.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                color: "#94a3b8",
                fontSize: "17px",
                padding: "40px",
              }}
            >
              ✅ No escalations found. All shipments are on track!
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Waybill</th>
                  <th style={styles.th}>Client</th>
                  <th style={styles.th}>Consignee Name</th>
                  <th style={styles.th}>Location</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Last Updated</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {escalationData.map((item, i) => (
                  <tr
                     onClick={() => window.open(`https://hq.delhivery.com/p/list/1?q=${item.wbn || item.waybill}`, '_blank')}
                    key={item.wbn || item.waybill || i}
                    style={{
                      ...styles.tableRow,
                      ...(i % 2 === 0 ? styles.evenRow : styles.oddRow),
                    }}
                  >
                    <td style={styles.td}>
                      <span style={styles.badge}>
                        {item.wbn || item.waybill || "-"}
                      </span>
                    </td>
                    <td style={styles.td}>{item.client || item.cl || "-"}</td>
                    <td style={styles.td}>
                      {item.consignee_name || item.nm || "-"}
                    </td>
                    <td style={styles.td}>
                      {item.location || item.loc || "-"}
                    </td>
                    <td style={styles.td}>
                      {item.status || item.status_type || "AVTD"}
                    </td>
                    <td style={styles.td}>
                      {item.updated_at || item.cs_ud
                        ? new Date(
                            item.updated_at || item.cs_ud
                          ).toLocaleString()
                        : "-"}
                    </td>
                    <td style={styles.td}>
                      <button
                        style={styles.copyBtn}
                        onClick={() =>
                          handleCopyWaybill(item.wbn || item.waybill)
                        }
                      >
                        {copiedWbn === (item.wbn || item.waybill)
                          ? "Copied!"
                          : "Copy"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default CSEscalation;
