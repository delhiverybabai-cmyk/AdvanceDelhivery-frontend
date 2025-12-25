import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

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
  summaryCards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  summaryCard: {
    background:
      "linear-gradient(145deg, rgba(30,41,59,0.88) 0%, rgba(15,23,42,0.97) 100%)",
    border: "1.5px solid rgba(148,163,184,0.14)",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 3px 14px rgba(51,84,124,0.07)",
  },
  cardLabel: {
    fontSize: "14px",
    color: "#94a3b8",
    fontWeight: 600,
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  cardValue: {
    fontSize: "32px",
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
    marginBottom: "30px",
  },
  sectionTitle: {
    fontSize: "24px",
    color: "#ffffff",
    fontWeight: "700",
    marginBottom: "16px",
    marginTop: "30px",
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
    background: "#3b82f633",
    color: "#60a5fa",
    borderRadius: "7px",
    padding: "6px 16px",
    fontWeight: "700",
    fontSize: "13px",
    display: "inline-block",
  },
  badgeFm: {
    background: "#22c55e33",
    color: "#22c55e",
  },
  badgeRt: {
    background: "#f59e0b33",
    color: "#f59e0b",
  },
  badgeMisroute: {
    background: "#ef444433",
    color: "#ef4444",
  },
  tableRow: {
    transition: "background 0.14s",
    cursor: "pointer",
  },
  evenRow: { backgroundColor: "rgba(15,23,42,0.12)" },
  oddRow: { backgroundColor: "rgba(30,41,59,0.05)" },
};

function RTConnection() {
  const [inTransitData, setInTransitData] = useState({
    fm: [],
    rt: [],
    misroute: [],
    summary: {
      fm_count: 0,
      rt_count: 0,
      misroute_count: 0,
      total_count: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [copiedWbn, setCopiedWbn] = useState(null);

  useEffect(() => {
    fetchInTransitData();
  }, []);

  const fetchInTransitData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/flow/in-transite`,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        setInTransitData({
          fm: response.data.fm || [],
          rt: response.data.rt || [],
          misroute: response.data.misroute || [],
          summary: response.data.summary || {
            fm_count: 0,
            rt_count: 0,
            misroute_count: 0,
            total_count: 0,
          },
        });
      } else {
        toast.error("Failed to fetch in-transit data");
      }
    } catch (error) {
      toast.error("Error fetching in-transit data");
      console.error("Error fetching in-transit data:", error);
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

  const renderTable = (data, packageType, badgeStyle) => {
    if (data.length === 0) {
      return (
        <div
          style={{
            textAlign: "center",
            color: "#94a3b8",
            fontSize: "16px",
            padding: "30px",
          }}
        >
          📦 No {packageType.toUpperCase()} packages found.
        </div>
      );
    }

    return (
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Waybill</th>
            <th style={styles.th}>Client</th>
            <th style={styles.th}>Consignee Name</th>
            <th style={styles.th}>Location</th>
            <th style={styles.th}>Pickup Date</th>
            <th style={styles.th}>In-Vehicle Date</th>
            <th style={styles.th}>First Rider Date</th>
            <th style={styles.th}>Copy</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, i) => (
            <tr
              key={item.wbn || i}
              style={{
                ...styles.tableRow,
                ...(i % 2 === 0 ? styles.evenRow : styles.oddRow),
              }}
            >
              <td style={styles.td}>
                <span style={{ ...styles.badge, ...badgeStyle }}>
                  {item.wbn || "-"}
                </span>
              </td>
              <td style={styles.td}>{item.cl || "-"}</td>
              <td style={styles.td}>{item.nm || "-"}</td>
              <td style={styles.td}>{item.loc || "-"}</td>
              <td style={styles.td}>
                {item.pd ? new Date(item.pd).toLocaleString() : "-"}
              </td>
              <td style={styles.td}>
                {item.ivd ? new Date(item.ivd).toLocaleString() : "-"}
              </td>
              <td style={styles.td}>
                {item.frd ? new Date(item.frd).toLocaleString() : "-"}
              </td>
              <td style={styles.td}>
                <button
                  style={styles.copyBtn}
                  onClick={() => handleCopyWaybill(item.wbn)}
                >
                  {copiedWbn === item.wbn ? "Copied!" : "Copy"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div style={styles.container}>
      <ToastContainer position="top-right" autoClose={3000} />
      <main style={styles.main}>
        <div style={styles.headerSection}>
          <div>
            <h2 style={styles.mainTitle}>In-Transit Packages</h2>
            <div style={styles.subtitle}>
              Real-time tracking of FM, RT, and Misroute packages
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {!loading && (
          <div style={styles.summaryCards}>
            <div style={styles.summaryCard}>
              <div style={styles.cardLabel}>FM Packages</div>
              <div style={styles.cardValue}>
                {inTransitData.summary.fm_count}
              </div>
            </div>
            <div style={styles.summaryCard}>
              <div style={styles.cardLabel}>RT Packages</div>
              <div style={styles.cardValue}>
                {inTransitData.summary.rt_count}
              </div>
            </div>
            <div style={styles.summaryCard}>
              <div style={styles.cardLabel}>Misroute Packages</div>
              <div style={styles.cardValue}>
                {inTransitData.summary.misroute_count}
              </div>
            </div>
            <div style={styles.summaryCard}>
              <div style={styles.cardLabel}>Total Packages</div>
              <div style={styles.cardValue}>
                {inTransitData.summary.total_count}
              </div>
            </div>
          </div>
        )}

        {/* FM Packages */}
        <h3 style={styles.sectionTitle}>FM Packages</h3>
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
              Loading FM packages...
            </div>
          ) : (
            renderTable(inTransitData.fm, "fm", styles.badgeFm)
          )}
        </div>

        {/* RT Packages */}
        <h3 style={styles.sectionTitle}>RT Packages</h3>
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
              Loading RT packages...
            </div>
          ) : (
            renderTable(inTransitData.rt, "rt", styles.badgeRt)
          )}
        </div>

        {/* Misroute Packages */}
        <h3 style={styles.sectionTitle}>Misroute Packages</h3>
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
              Loading Misroute packages...
            </div>
          ) : (
            renderTable(
              inTransitData.misroute,
              "misroute",
              styles.badgeMisroute
            )
          )}
        </div>
      </main>
    </div>
  );
}

export default RTConnection;
