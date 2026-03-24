import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ExpenseProfitList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [totals, setTotals] = useState({ totalExpense: 0, totalProfit: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState("all");

  const styles = {
    container: { minHeight: "100vh", backgroundColor: "#0f172a", fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" },
    main: { maxWidth: "1400px", margin: "0 auto", padding: "48px 32px" },
    headerSection: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "48px", flexWrap: "wrap", gap: "24px" },
    mainTitle: { fontSize: "42px", fontWeight: "800", background: "linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "16px", letterSpacing: "-0.02em" },
    subtitle: { fontSize: "18px", color: "#94a3b8", lineHeight: "1.6" },
    controlsSection: { display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", width: "100%", justifyContent: "space-between" },
    filterSection: { display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" },
    filterButton: { padding: "12px 20px", fontSize: "14px", fontWeight: "600", border: "none", borderRadius: "8px", cursor: "pointer", transition: "all 0.3s ease" },
    activeFilter: { background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", color: "#ffffff", boxShadow: "0 6px 20px rgba(59, 130, 246, 0.3)" },
    inactiveFilter: { background: "rgba(148, 163, 184, 0.1)", color: "#94a3b8", border: "1px solid rgba(148, 163, 184, 0.2)" },
    addButton: { padding: "12px 24px", fontSize: "14px", fontWeight: "600", color: "#ffffff", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", border: "none", borderRadius: "8px", cursor: "pointer", transition: "all 0.3s ease", display: "flex", alignItems: "center", gap: "8px" },
    summaryCards: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px", marginBottom: "32px" },
    summaryCard: { background: "rgba(15, 23, 42, 0.3)", borderRadius: "12px", border: "1px solid rgba(148, 163, 184, 0.05)", padding: "24px", display: "flex", alignItems: "center", gap: "20px" },
    summaryIcon: { width: "56px", height: "56px", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" },
    summaryInfo: { flex: 1 },
    summaryLabel: { fontSize: "14px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" },
    summaryValue: { fontSize: "28px", fontWeight: "700" },
    profitColor: { color: "#10b981" },
    profitBg: { background: "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.2) 100%)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" },
    expenseColor: { color: "#ef4444" },
    expenseBg: { background: "linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(220,38,38,0.2) 100%)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" },
    transactionContainer: { background: "linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)", backdropFilter: "blur(10px)", border: "1px solid rgba(148, 163, 184, 0.1)", borderRadius: "20px", padding: "32px" },
    transactionList: { display: "flex", flexDirection: "column", gap: "16px" },
    transactionItem: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px", background: "rgba(15, 23, 42, 0.3)", borderRadius: "12px", border: "1px solid rgba(148, 163, 184, 0.05)", transition: "all 0.3s ease" },
    transactionLeft: { display: "flex", alignItems: "center", gap: "20px", flex: 1 },
    transactionIcon: { width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "700" },
    transactionInfo: { flex: 1 },
    transactionTitle: { fontSize: "16px", fontWeight: "600", color: "#ffffff", marginBottom: "4px" },
    transactionDate: { fontSize: "14px", color: "#64748b", display: "flex", alignItems: "center", gap: "6px" },
    transactionRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" },
    transactionAmount: { fontSize: "20px", fontWeight: "700" },
    transactionTypeBadge: { padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", textTransform: "camelCase" },
    profitText: { color: "#10b981" },
    profitBadge: { background: "rgba(16, 185, 129, 0.1)", color: "#10b981" },
    expenseText: { color: "#ef4444" },
    expenseBadge: { background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" },
    loadingContainer: { display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "400px" },
    loadingSpinner: { width: "40px", height: "40px", border: "3px solid rgba(59, 130, 246, 0.3)", borderTop: "3px solid #3b82f6", borderRadius: "50%", marginBottom: "16px" },
    loadingText: { color: "#94a3b8", fontSize: "16px" },
    errorContainer: { textAlign: "center", padding: "60px 40px", color: "#ef4444", background: "rgba(239, 68, 68, 0.1)", borderRadius: "12px", border: "1px solid rgba(239, 68, 68, 0.2)" },
    emptyState: { textAlign: "center", padding: "60px 40px", color: "#94a3b8" },
    emptyIcon: { fontSize: "48px", marginBottom: "16px" },
    emptyTitle: { fontSize: "20px", fontWeight: "600", color: "#e2e8f0", marginBottom: "8px" }
  };

  const SpinnerComponent = () => {
    const [rotation, setRotation] = useState(0);
    useEffect(() => { const interval = setInterval(() => setRotation(prev => (prev + 10) % 360), 50); return () => clearInterval(interval); }, []);
    return <div style={{ ...styles.loadingSpinner, transform: `rotate(${rotation}deg)` }} />;
  };

  useEffect(() => { fetchExpenseData(); }, [filterType]);

  const fetchExpenseData = async () => {
    try {
      setLoading(true); setError(null);
      const [listRes, totalsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_BASE_URL}/api/company-management/profit-loose`),
        axios.get(`${process.env.REACT_APP_BASE_URL}/api/company-management/profit-loose/totals`)
      ]);
      setData(listRes.data?.data || []);
      setTotals(totalsRes.data?.data?.[0] || { totalExpense: 0, totalProfit: 0 });
    } catch (err) {
      if (err.response?.status !== 404) setError("Failed to load records.");
    } finally { setLoading(false); }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
  const formatDate = (d) => new Intl.DateTimeFormat("en-IN", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(d));

  const filteredData = filterType === "all" ? data : data.filter(item => item.type === filterType);

  if (loading) return <div style={styles.container}><main style={styles.main}><div style={styles.loadingContainer}><SpinnerComponent /><div style={styles.loadingText}>Loading records...</div></div></main></div>;
  if (error) return <div style={styles.container}><main style={styles.main}><div style={styles.errorContainer}><h3>⚠️ Error</h3><p>{error}</p><button style={{ padding: "12px 24px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", marginTop: "16px" }} onClick={fetchExpenseData}>🔄 Retry</button></div></main></div>;

  const currentBalance = totals.totalProfit - totals.totalExpense;

  return (
    <div style={styles.container}>
      <main style={styles.main}>
        <div style={styles.headerSection}>
          <div><h1 style={styles.mainTitle}>Company Ledger</h1><p style={styles.subtitle}>Track and manage company wide expenses & profits</p></div>
        </div>
        <div style={styles.summaryCards}>
            <div style={{ ...styles.summaryCard, borderTop: "4px solid #10b981" }}><div style={{ ...styles.summaryIcon, ...styles.profitBg }}>↗️</div><div style={styles.summaryInfo}><div style={styles.summaryLabel}>Total Income/Profit</div><div style={{ ...styles.summaryValue, ...styles.profitColor }}>{formatCurrency(totals.totalProfit)}</div></div></div>
            <div style={{ ...styles.summaryCard, borderTop: "4px solid #ef4444" }}><div style={{ ...styles.summaryIcon, ...styles.expenseBg }}>↙️</div><div style={styles.summaryInfo}><div style={styles.summaryLabel}>Total Expenses</div><div style={{ ...styles.summaryValue, ...styles.expenseColor }}>{formatCurrency(totals.totalExpense)}</div></div></div>
            <div style={{ ...styles.summaryCard, borderTop: `4px solid ${currentBalance >= 0 ? "#10b981" : "#ef4444"}` }}><div style={{ ...styles.summaryIcon, background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>💰</div><div style={styles.summaryInfo}><div style={styles.summaryLabel}>Overall Balance</div><div style={{ ...styles.summaryValue, color: currentBalance >= 0 ? "#10b981" : "#ef4444" }}>{formatCurrency(currentBalance)}</div></div></div>
        </div>
        <div style={styles.controlsSection}>
          <div style={styles.filterSection}>
            {["all", "profit", "expense"].map(type => (
              <button key={type} style={{ ...styles.filterButton, ...(filterType === type ? styles.activeFilter : styles.inactiveFilter) }} onClick={() => setFilterType(type)}>
                {type.charAt(0).toUpperCase() + type.slice(1)}s
              </button>
            ))}
          </div>
          <button style={styles.addButton} onClick={() => navigate("/add-expence-profit")}><span>+</span> Add Entry</button>
        </div>
        {filteredData.length === 0 ? (
          <div style={styles.emptyState}><div style={styles.emptyIcon}>📊</div><h3 style={styles.emptyTitle}>No Records Found</h3><p style={{ color: "#64748b" }}>There are no {filterType !== "all" ? filterType : ""} records to display.</p></div>
        ) : (
          <div style={{ marginTop: "32px", ...styles.transactionContainer }}>
            <div style={styles.transactionList}>
              {filteredData.map(item => {
                const isProfit = item.type === "profit";
                return (
                  <div key={item._id} style={styles.transactionItem} onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgba(15, 23, 42, 0.3)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                    <div style={styles.transactionLeft}>
                      <div style={{ ...styles.transactionIcon, ...(isProfit ? styles.profitBg : styles.expenseBg) }}>{isProfit ? "↗️" : "↙️"}</div>
                      <div style={styles.transactionInfo}>
                        <div style={styles.transactionTitle}>{item.title}</div>
                        <div style={styles.transactionDate}><span>📅</span>{formatDate(item.createdAt)}</div>
                      </div>
                    </div>
                    <div style={styles.transactionRight}>
                      <div style={{ ...styles.transactionAmount, ...(isProfit ? styles.profitText : styles.expenseText) }}>{isProfit ? "+" : "-"} {formatCurrency(item.amount)}</div>
                      <div style={{ ...styles.transactionTypeBadge, ...(isProfit ? styles.profitBadge : styles.expenseBadge) }}>{item.type}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ExpenseProfitList;
