import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    padding: "48px 24px",
  },
  main: {
    maxWidth: "1400px",
    margin: "0 auto",
  },
  header: {
    fontSize: "38px",
    fontWeight: "800",
    color: "#f4fae3",
    marginBottom: "12px",
    letterSpacing: "-0.03em",
  },
  subtitle: {
    fontSize: "16px",
    color: "#94a3b8",
    marginBottom: "32px",
  },
  tabContainer: {
    display: "flex",
    gap: "12px",
    marginBottom: "28px",
    borderBottom: "2px solid rgba(148, 163, 184, 0.2)",
  },
  tab: {
    padding: "14px 28px",
    fontSize: "16px",
    fontWeight: "600",
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    borderBottom: "3px solid transparent",
    transition: "all 0.2s",
    position: "relative",
    bottom: "-2px",
  },
  activeTab: {
    color: "#22d487",
    borderBottom: "3px solid #22d487",
  },
  statsBar: {
    display: "flex",
    gap: "16px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  statCard: {
    background: "rgba(30, 41, 59, 0.8)",
    borderRadius: "12px",
    padding: "16px 24px",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    minWidth: "180px",
  },
  statLabel: {
    fontSize: "13px",
    color: "#94a3b8",
    marginBottom: "6px",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#fff",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
    gap: "24px",
  },
  card: {
    background: "rgba(30, 41, 59, 0.9)",
    borderRadius: "16px",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    overflow: "hidden",
    transition: "all 0.3s",
    position: "relative",
  },
  cardHover: {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 40px rgba(34, 212, 135, 0.2)",
  },
  imagePreview: {
    width: "100%",
    height: "280px",
    objectFit: "cover",
    background: "rgba(15, 23, 42, 0.5)",
  },
  cardContent: {
    padding: "20px",
  },
  productName: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#fff",
    marginBottom: "12px",
    lineHeight: "1.4",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
    fontSize: "14px",
    color: "#94a3b8",
  },
  icon: {
    fontSize: "16px",
  },
  imageBadge: {
    position: "absolute",
    top: "12px",
    right: "12px",
    background: "rgba(34, 212, 135, 0.9)",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "700",
  },
  // ✅ Action Icons Container
  actionIcons: {
    position: "absolute",
    top: "12px",
    left: "12px",
    display: "flex",
    gap: "8px",
    zIndex: 10,
  },
  iconButton: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    transition: "all 0.2s",
    backdropFilter: "blur(10px)",
  },
  copyButton: {
    background: "rgba(59, 130, 246, 0.9)",
    color: "#fff",
  },
  copyButtonHover: {
    background: "rgba(37, 99, 235, 1)",
    transform: "scale(1.1)",
  },
  redirectButton: {
    background: "rgba(34, 212, 135, 0.9)",
    color: "#fff",
  },
  redirectButtonHover: {
    background: "rgba(16, 185, 129, 1)",
    transform: "scale(1.1)",
  },
  waybillBadge: {
    background: "rgba(15, 23, 42, 0.8)",
    color: "#22d487",
    padding: "8px 12px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "700",
    marginTop: "12px",
    display: "inline-block",
    fontFamily: "monospace",
  },
  emptyState: {
    textAlign: "center",
    padding: "80px 40px",
    color: "#94a3b8",
  },
  emptyIcon: {
    fontSize: "64px",
    marginBottom: "16px",
    opacity: 0.5,
  },
  loader: {
    textAlign: "center",
    padding: "80px 40px",
    color: "#22d487",
    fontSize: "18px",
  },
  noImage: {
    width: "100%",
    height: "280px",
    background: "linear-gradient(135deg, #334155 0%, #1e293b 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "48px",
    color: "#475569",
  },
};

const PickupStatusPage = () => {
  const [activeTab, setActiveTab] = useState("qc");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredCopyIcon, setHoveredCopyIcon] = useState(null);
  const [hoveredRedirectIcon, setHoveredRedirectIcon] = useState(null);

  useEffect(() => {
    fetchPickupStatus();
  }, []);

  const fetchPickupStatus = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/dispatch/fetch-pickup-status`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response.data.success) {
        setData(response.data.data);
        toast.success("Pickup data loaded successfully!");
      }
    } catch (error) {
      toast.error("Failed to fetch pickup status");
      console.error("Error fetching pickup status:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Copy waybill to clipboard
  const handleCopy = (waybill, e) => {
    e.stopPropagation();
    if (waybill) {
      navigator.clipboard.writeText(waybill);
      toast.success(`📋 Copied: ${waybill}`);
    } else {
      toast.error("No waybill available");
    }
  };

  // ✅ Redirect to Delhivery portal
  const handleRedirect = (waybill, e) => {
    e.stopPropagation();
    if (waybill) {
      window.open(
        `https://hq.delhivery.com/p/pntrzz/${waybill}/`,
        "_blank",
        "noopener,noreferrer"
      );
    } else {
      toast.error("No waybill available");
    }
  };

  const qcItems = data.filter((item) => item.images && item.images.length > 0);
  const nonQcItems = data.filter(
    (item) => !item.images || item.images.length === 0
  );

  const currentItems = activeTab === "qc" ? qcItems : nonQcItems;

  return (
    <div style={styles.container}>
      <ToastContainer position="top-right" autoClose={3000} />
      <div style={styles.main}>
        {/* Header */}
        <h1 style={styles.header}>Pickup Status</h1>
        <div style={styles.subtitle}>
          Quality control check for pickup items with product images
        </div>

        {/* Stats Bar */}
        <div style={styles.statsBar}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Pickups</div>
            <div style={styles.statValue}>{data.length}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>QC Items</div>
            <div style={{ ...styles.statValue, color: "#22d487" }}>
              {qcItems.length}
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Non-QC Items</div>
            <div style={{ ...styles.statValue, color: "#f59e0b" }}>
              {nonQcItems.length}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabContainer}>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === "qc" ? styles.activeTab : {}),
            }}
            onClick={() => setActiveTab("qc")}
          >
            QC Items ({qcItems.length})
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === "non-qc" ? styles.activeTab : {}),
            }}
            onClick={() => setActiveTab("non-qc")}
          >
            Non-QC Items ({nonQcItems.length})
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div style={styles.loader}>Loading pickup status...</div>
        ) : currentItems.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📦</div>
            <h3
              style={{
                color: "#e2e8f0",
                fontSize: "22px",
                marginBottom: "8px",
              }}
            >
              No {activeTab === "qc" ? "QC" : "Non-QC"} Items
            </h3>
            <p>No items found in this category</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {currentItems.map((item, index) => (
              <div
                key={index}
                style={{
                  ...styles.card,
                  ...(hoveredCard === index ? styles.cardHover : {}),
                }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Image Preview */}
                <div style={{ position: "relative" }}>
                  {/* ✅ Action Icons */}
                  {item.waybill && (
                    <div style={styles.actionIcons}>
                      <button
                        style={{
                          ...styles.iconButton,
                          ...styles.copyButton,
                          ...(hoveredCopyIcon === index
                            ? styles.copyButtonHover
                            : {}),
                        }}
                        onClick={(e) => handleCopy(item.waybill, e)}
                        onMouseEnter={() => setHoveredCopyIcon(index)}
                        onMouseLeave={() => setHoveredCopyIcon(null)}
                        title="Copy Waybill"
                      >
                        📋
                      </button>
                      <button
                        style={{
                          ...styles.iconButton,
                          ...styles.redirectButton,
                          ...(hoveredRedirectIcon === index
                            ? styles.redirectButtonHover
                            : {}),
                        }}
                        onClick={(e) => handleRedirect(item.waybill, e)}
                        onMouseEnter={() => setHoveredRedirectIcon(index)}
                        onMouseLeave={() => setHoveredRedirectIcon(null)}
                        title="Open in Delhivery Portal"
                      >
                        🔗
                      </button>
                    </div>
                  )}

                  {item.images && item.images.length > 0 ? (
                    <>
                      <img
                        src={item.images[0]}
                        alt={item.product_description}
                        style={styles.imagePreview}
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/400x280?text=Image+Not+Found";
                        }}
                      />
                      {item.images.length > 1 && (
                        <div style={styles.imageBadge}>
                          +{item.images.length - 1} more
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={styles.noImage}>📷</div>
                  )}
                </div>

                {/* Card Content */}
                <div style={styles.cardContent}>
                  <div style={styles.productName}>
                    {item.product_description}
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.icon}>👤</span>
                    <span>{item.consignee_name}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.icon}>📍</span>
                    <span>{item.locality || "N/A"}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.icon}>🏠</span>
                    <span
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {item.consignee_address}
                    </span>
                  </div>
                  {/* ✅ Waybill Display */}
                  {item.waybill && (
                    <div style={styles.waybillBadge}>WB: {item.waybill}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PickupStatusPage;
