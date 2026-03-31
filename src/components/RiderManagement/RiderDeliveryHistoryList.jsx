import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";

const RiderDeliveryHistoryList = () => {
  const { riderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isRecordMode = location.pathname.endsWith("/record");
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc");
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [updateDate, setUpdateDate] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  const styles = {
    container: { minHeight: "100vh", backgroundColor: "#0f172a", fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" },
    main: { maxWidth: "1400px", margin: "0 auto", padding: "48px 32px" },
    backButton: { display: "flex", alignItems: "center", padding: "12px 20px", background: "rgba(148, 163, 184, 0.1)", color: "#94a3b8", border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "500", transition: "all 0.3s ease", marginBottom: "32px" },
    headerSection: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "48px", flexWrap: "wrap", gap: "24px" },
    mainTitle: { fontSize: "42px", fontWeight: "800", background: "linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "16px", letterSpacing: "-0.02em" },
    subtitle: { fontSize: "18px", color: "#94a3b8", lineHeight: "1.6" },
    controlsSection: { display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" },
    sortButton: { padding: "12px 20px", fontSize: "14px", fontWeight: "600", color: "#94a3b8", background: "rgba(148, 163, 184, 0.1)", border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: "8px", cursor: "pointer", transition: "all 0.3s ease" },
    addHistoryButton: { display: "flex", alignItems: "center", padding: "14px 28px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "#ffffff", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "16px", fontWeight: "600", transition: "all 0.3s", boxShadow: "0 8px 25px rgba(16, 185, 129, 0.3)" },
    summaryCards: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "32px" },
    summaryCard: { background: "rgba(15, 23, 42, 0.3)", border: "1px solid rgba(148, 163, 184, 0.05)", borderRadius: "12px", padding: "20px", textAlign: "center" },
    summaryNumber: { fontSize: "24px", fontWeight: "700", color: "#ffffff", marginBottom: "8px" },
    summaryLabel: { fontSize: "12px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" },
    tableContainer: { background: "linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)", backdropFilter: "blur(10px)", border: "1px solid rgba(148, 163, 184, 0.1)", borderRadius: "20px", padding: "32px", position: "relative" },
    table: { width: "100%", borderCollapse: "collapse", backgroundColor: "transparent" },
    th: { padding: "16px 12px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#e2e8f0", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid rgba(148, 163, 184, 0.1)", position: "sticky", top: 0, background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(10px)" },
    td: { padding: "16px 12px", fontSize: "14px", color: "#ffffff", borderBottom: "1px solid rgba(148, 163, 184, 0.05)", fontWeight: "500" },
    tableRow: { transition: "all 0.3s ease", cursor: "pointer" },
    successValue: { color: "#10b981", fontWeight: "600" },
    cancelValue: { color: "#f59e0b", fontWeight: "600" },
    earningsValue: { color: "#3b82f6", fontWeight: "600" },
    returnValue: { color: "#8b5cf6", fontWeight: "600" },
    loadingContainer: { display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "400px" },
    loadingSpinner: { width: "40px", height: "40px", border: "3px solid rgba(59, 130, 246, 0.3)", borderTop: "3px solid #3b82f6", borderRadius: "50%", marginBottom: "16px" },
    loadingText: { color: "#94a3b8", fontSize: "16px" },
    errorContainer: { textAlign: "center", padding: "60px 40px", color: "#ef4444", background: "rgba(239, 68, 68, 0.1)", borderRadius: "12px", border: "1px solid rgba(239, 68, 68, 0.2)" },
    emptyState: { textAlign: "center", padding: "60px 40px", color: "#94a3b8" },
    emptyIcon: { fontSize: "48px", marginBottom: "16px" },
    emptyTitle: { fontSize: "20px", fontWeight: "600", color: "#e2e8f0", marginBottom: "8px" },
    emptyDescription: { fontSize: "14px", color: "#64748b" },
  };

  const SpinnerComponent = () => {
    const [rotation, setRotation] = useState(0);
    useEffect(() => { const interval = setInterval(() => setRotation(prev => (prev + 10) % 360), 50); return () => clearInterval(interval); }, []);
    return <div style={{ ...styles.loadingSpinner, transform: `rotate(${rotation}deg)` }} />;
  };

  useEffect(() => { fetchDeliveryHistory(); }, [riderId, sortOrder]);

  const fetchDeliveryHistory = async () => {
    try {
      setLoading(true); setError(null);
      const params = new URLSearchParams({ sortOrder, riderId });
      const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/rider-payment/get-all-delivery-payment-history?${params}`);
      setHistoryData(res.data?.status && res.data?.data ? res.data.data : []);
    } catch (err) {
      setError(err.response?.status === 404 ? "No delivery history found for this rider." : "Failed to load delivery history.");
    } finally { setLoading(false); }
  };

  const openUpdateModal = (record) => {
    setSelectedRecord(record);
    const date = new Date(record.createdAt);
    setUpdateDate(date.toISOString().split("T")[0]);
    setIsUpdateModalOpen(true);
    setUpdateError(null);
  };

  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedRecord(null);
    setUpdateDate("");
    setUpdateError(null);
  };

  const handleUpdateDate = async (e) => {
    e.preventDefault();
    if (!updateDate) {
      setUpdateError("Date is required");
      return;
    }
    const selectedObj = new Date(updateDate);
    if (selectedObj > new Date()) {
      setUpdateError("Date cannot be in the future");
      return;
    }

    setUpdateLoading(true);
    try {
      await axios.put(`${process.env.REACT_APP_BASE_URL}/api/rider-payment/delivery-payment-history/${selectedRecord._id}`, { selectedDate: updateDate });
      closeUpdateModal();
      fetchDeliveryHistory();
    } catch (err) {
      setUpdateError(err.response?.data?.message || "Failed to update date.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleRowHover = (e, isEnter) => {
    if (isEnter) { e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.1)"; e.currentTarget.style.transform = "scale(1.01)"; }
    else { e.currentTarget.style.backgroundColor = ""; e.currentTarget.style.transform = "scale(1)"; }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(amount);
  const formatDate = (d) => new Intl.DateTimeFormat("en-IN", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(d));

  const calculateSummary = () => {
    if (!historyData.length) return null;
    return historyData.reduce((acc, r) => ({ totalAssigned: acc.totalAssigned + r.assignedParcels, totalDelivered: acc.totalDelivered + r.successfulDelivered, totalRVP: acc.totalRVP + r.successfulRVP, totalReturned: acc.totalReturned + (r.parcelsReturnInHub || 0), totalRiderEarnings: acc.totalRiderEarnings + r.riderEarning }), { totalAssigned: 0, totalDelivered: 0, totalRVP: 0, totalReturned: 0, totalRiderEarnings: 0 });
  };

  if (loading) return <div style={styles.container}><main style={styles.main}><div style={styles.loadingContainer}><SpinnerComponent /><div style={styles.loadingText}>Loading delivery history...</div></div></main></div>;
  if (error) return <div style={styles.container}><main style={styles.main}><button style={styles.backButton} onClick={() => navigate(`/rider-management`)}>← Back</button><div style={styles.errorContainer}><h3>⚠️ Error</h3><p>{error}</p><button style={{ padding: "12px 24px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }} onClick={fetchDeliveryHistory}>🔄 Retry</button></div></main></div>;

  const summary = calculateSummary();

  const modalStyles = {
    overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
    modal: { background: "linear-gradient(145deg, rgba(30, 41, 59, 1) 0%, rgba(15, 23, 42, 1) 100%)", border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "400px", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" },
    title: { fontSize: "24px", fontWeight: "700", color: "#ffffff", marginBottom: "8px", textAlign: "center" },
    subtitle: { fontSize: "14px", color: "#94a3b8", marginBottom: "24px", textAlign: "center" },
    label: { display: "block", fontSize: "14px", fontWeight: "600", color: "#e2e8f0", marginBottom: "8px" },
    input: { width: "100%", padding: "12px 16px", fontSize: "16px", color: "#ffffff", backgroundColor: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: "8px", outline: "none", marginBottom: "16px", boxSizing: "border-box", colorScheme: "dark" },
    buttonGroup: { display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" },
    submitBtn: { padding: "10px 20px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", opacity: 1 },
    submitBtnDisabled: { opacity: 0.7, cursor: "not-allowed" },
    cancelBtn: { padding: "10px 20px", background: "transparent", color: "#94a3b8", border: "1px solid rgba(148, 163, 184, 0.3)", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
    error: { color: "#ef4444", fontSize: "14px", marginBottom: "16px", textAlign: "center", background: "rgba(239,68,68,0.1)", padding: "8px", borderRadius: "8px" }
  };

  return (
    <div style={styles.container}>
      <main style={styles.main}>
        <button style={styles.backButton} onClick={() => navigate(`/rider-management`)} onMouseEnter={e => { e.target.style.background = "rgba(148,163,184,0.2)"; e.target.style.color = "#e2e8f0"; }} onMouseLeave={e => { e.target.style.background = "rgba(148,163,184,0.1)"; e.target.style.color = "#94a3b8"; }}>← Back</button>
        <div style={styles.headerSection}>
          <div><h1 style={styles.mainTitle}>Delivery History</h1><p style={styles.subtitle}>Complete delivery and payment history records</p></div>
          <div style={styles.controlsSection}>
            <button style={styles.sortButton} onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}>{sortOrder === "asc" ? "↑" : "↓"} Sort {sortOrder === "asc" ? "Ascending" : "Descending"}</button>
            {isRecordMode && (
              <button style={styles.addHistoryButton} onClick={() => navigate(`/add-rider-delivery-history/${riderId}`)}><span style={{ marginRight: "8px", fontSize: "18px" }}>+</span>Add History</button>
            )}
          </div>
        </div>
        {summary && (
          <div style={styles.summaryCards}>
            <div style={styles.summaryCard}><div style={styles.summaryNumber}>{summary.totalAssigned}</div><div style={styles.summaryLabel}>Total Assigned</div></div>
            <div style={styles.summaryCard}><div style={styles.summaryNumber}>{summary.totalDelivered}</div><div style={styles.summaryLabel}>Successful Delivered</div></div>
            <div style={styles.summaryCard}><div style={styles.summaryNumber}>{summary.totalRVP}</div><div style={styles.summaryLabel}>Successful RVP</div></div>
            <div style={styles.summaryCard}><div style={styles.summaryNumber}>{summary.totalReturned}</div><div style={styles.summaryLabel}>Returned to Hub</div></div>
            <div style={styles.summaryCard}><div style={styles.summaryNumber}>{formatCurrency(summary.totalRiderEarnings)}</div><div style={styles.summaryLabel}>Total Rider Earnings</div></div>
          </div>
        )}
        {historyData.length === 0 ? (
          <div style={styles.emptyState}><div style={styles.emptyIcon}>📦</div><h3 style={styles.emptyTitle}>No Delivery History Found</h3><p style={styles.emptyDescription}>No delivery records available for this rider</p></div>
        ) : (
          <div style={styles.tableContainer}>
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead><tr>{["Date Created","Assigned Parcels","Successful Delivered","Successful RVP","Canceled by Code","Returned to Hub","Cash Deposited","Rider Earning"].concat(isRecordMode ? ["Action"] : []).map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {historyData.map((record, index) => (
                    <tr key={record._id || index} style={{ ...styles.tableRow, backgroundColor: index % 2 === 0 ? "rgba(15,23,42,0.2)" : "rgba(30,41,59,0.1)" }} onMouseEnter={e => handleRowHover(e, true)} onMouseLeave={e => handleRowHover(e, false)}>
                      <td style={styles.td}>{formatDate(record.createdAt)}</td>
                      <td style={styles.td}>{record.assignedParcels}</td>
                      <td style={{ ...styles.td, ...styles.successValue }}>{record.successfulDelivered}</td>
                      <td style={{ ...styles.td, ...styles.successValue }}>{record.successfulRVP}</td>
                      <td style={{ ...styles.td, ...styles.cancelValue }}>{record.canceledByCode}</td>
                      <td style={{ ...styles.td, ...styles.returnValue }}>{record.parcelsReturnInHub || 0}</td>
                      <td style={{ ...styles.td, ...styles.earningsValue }}>{formatCurrency(record.cashedDeposited)}</td>
                      <td style={{ ...styles.td, ...styles.earningsValue }}>{formatCurrency(record.riderEarning)}</td>
                      {isRecordMode && (
                        <td style={styles.td}>
                          <button style={styles.sortButton} onClick={() => openUpdateModal(record)}>✏️ Update</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {isUpdateModalOpen && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <h2 style={modalStyles.title}>Update Date</h2>
            <p style={modalStyles.subtitle}>Modify the date for this delivery record</p>
            
            {updateError && <div style={modalStyles.error}>⚠️ {updateError}</div>}
            
            <form onSubmit={handleUpdateDate}>
              <label style={modalStyles.label}>Select New Date</label>
              <input 
                type="date" 
                value={updateDate} 
                onChange={(e) => setUpdateDate(e.target.value)} 
                style={modalStyles.input} 
                max={new Date().toISOString().split("T")[0]}
                disabled={updateLoading}
              />
              
              <div style={modalStyles.buttonGroup}>
                <button type="button" onClick={closeUpdateModal} style={modalStyles.cancelBtn} disabled={updateLoading}>Cancel</button>
                <button type="submit" style={{ ...modalStyles.submitBtn, ...(updateLoading ? modalStyles.submitBtnDisabled : {}) }} disabled={updateLoading}>
                  {updateLoading ? "Updating..." : "Update Date"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiderDeliveryHistoryList;
