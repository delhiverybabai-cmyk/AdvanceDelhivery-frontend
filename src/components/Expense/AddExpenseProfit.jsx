import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddExpenseProfit = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: "", amount: "", type: "expense" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const styles = {
    container: { minHeight: "100vh", backgroundColor: "#0f172a", fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" },
    main: { maxWidth: "800px", margin: "0 auto", padding: "48px 32px" },
    backButton: { display: "flex", alignItems: "center", padding: "12px 20px", background: "rgba(148, 163, 184, 0.1)", color: "#94a3b8", border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "500", transition: "all 0.3s ease", marginBottom: "32px", width: "fit-content" },
    headerSection: { textAlign: "center", marginBottom: "48px" },
    mainTitle: { fontSize: "42px", fontWeight: "800", background: "linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "16px", letterSpacing: "-0.02em" },
    subtitle: { fontSize: "18px", color: "#94a3b8", lineHeight: "1.6" },
    formContainer: { background: "linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)", backdropFilter: "blur(10px)", border: "1px solid rgba(148, 163, 184, 0.1)", borderRadius: "20px", padding: "40px", position: "relative" },
    formGroup: { marginBottom: "24px" },
    label: { display: "block", fontSize: "14px", fontWeight: "600", color: "#e2e8f0", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" },
    input: { width: "100%", padding: "16px 20px", fontSize: "16px", fontWeight: "500", color: "#ffffff", backgroundColor: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: "12px", outline: "none", transition: "all 0.3s ease", boxSizing: "border-box" },
    textarea: { width: "100%", minHeight: "120px", padding: "16px 20px", fontSize: "16px", fontWeight: "500", color: "#ffffff", backgroundColor: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: "12px", outline: "none", transition: "all 0.3s ease", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" },
    inputWrapper: { position: "relative" },
    inputIcon: { position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", color: "#64748b", fontSize: "18px" },
    typeSelector: { display: "flex", gap: "16px", marginBottom: "32px", pading: "4px", background: "rgba(15, 23, 42, 0.4)", borderRadius: "16px", padding: "8px" },
    typeButton: { flex: 1, padding: "16px", borderRadius: "12px", border: "none", fontSize: "16px", fontWeight: "600", cursor: "pointer", transition: "all 0.3s ease", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" },
    typeExpense: { background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", color: "#ffffff", boxShadow: "0 8px 25px rgba(239, 68, 68, 0.3)" },
    typeProfit: { background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "#ffffff", boxShadow: "0 8px 25px rgba(16, 185, 129, 0.3)" },
    typeInactive: { background: "transparent", color: "#94a3b8" },
    errorMessage: { color: "#ef4444", fontSize: "13px", marginTop: "6px", display: "flex", alignItems: "center", gap: "6px" },
    buttonGroup: { display: "flex", gap: "16px", justifyContent: "flex-end", marginTop: "40px" },
    submitButton: { padding: "16px 32px", fontSize: "16px", fontWeight: "600", color: "#ffffff", background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", border: "none", borderRadius: "12px", cursor: "pointer", boxShadow: "0 8px 25px rgba(59, 130, 246, 0.3)", minWidth: "180px", display: "flex", alignItems: "center", justifyContent: "center" },
    submitButtonDisabled: { background: "rgba(148, 163, 184, 0.3)", cursor: "not-allowed", boxShadow: "none" },
    cancelButton: { padding: "16px 32px", fontSize: "16px", fontWeight: "600", color: "#94a3b8", background: "transparent", border: "1px solid rgba(148, 163, 184, 0.3)", borderRadius: "12px", cursor: "pointer" },
    loadingSpinner: { width: "20px", height: "20px", border: "2px solid rgba(255, 255, 255, 0.3)", borderTop: "2px solid #ffffff", borderRadius: "50%", display: "inline-block", marginRight: "8px" },
    successMessage: { background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "12px", padding: "16px 20px", marginBottom: "24px", color: "#10b981", fontSize: "14px", display: "flex", alignItems: "center", gap: "10px" }
  };

  const SpinnerComponent = () => {
    const [rotation, setRotation] = useState(0);
    React.useEffect(() => { const interval = setInterval(() => setRotation(prev => (prev + 10) % 360), 50); return () => clearInterval(interval); }, []);
    return <div style={{ ...styles.loadingSpinner, transform: `rotate(${rotation}deg)` }} />;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Description is required";
    else if (formData.title.trim().length < 3) newErrors.title = "Description must be at least 3 characters";
    if (!formData.amount) newErrors.amount = "Amount is required";
    else if (Number(formData.amount) <= 0) newErrors.amount = "Enter a valid amount greater than 0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    if (success) setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_BASE_URL}/api/company-management/profit-loose`, {
        title: formData.title.trim(), amount: Number(formData.amount), type: formData.type
      });
      setSuccess(true);
      setTimeout(() => navigate("/expence-profit"), 2000);
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || `Failed to add ${formData.type}.` });
    } finally { setLoading(false); }
  };

  const handleFocus = (e) => { e.target.style.borderColor = formData.type === "profit" ? "#10b981" : "#ef4444"; e.target.style.boxShadow = `0 0 0 3px ${formData.type === "profit" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)"}`; e.target.style.backgroundColor = "rgba(15, 23, 42, 0.8)"; };
  const handleBlur = (e) => { e.target.style.borderColor = errors[e.target.name] ? "#ef4444" : "rgba(148, 163, 184, 0.2)"; e.target.style.boxShadow = "none"; e.target.style.backgroundColor = "rgba(15, 23, 42, 0.6)"; };

  return (
    <div style={styles.container}>
      <main style={styles.main}>
        <button style={styles.backButton} onClick={() => navigate("/expence-profit")} onMouseEnter={e => { e.target.style.background = "rgba(148,163,184,0.2)"; e.target.style.color = "#e2e8f0"; }} onMouseLeave={e => { e.target.style.background = "rgba(148,163,184,0.1)"; e.target.style.color = "#94a3b8"; }}>← Back to Ledger</button>
        <div style={styles.headerSection}><h1 style={styles.mainTitle}>Add {formData.type === "expense" ? "Expense" : "Profit"}</h1><p style={styles.subtitle}>Record a new financial transaction</p></div>
        <div style={styles.formContainer}>
          {success && <div style={styles.successMessage}><span>✅</span><span>{formData.type === "expense" ? "Expense" : "Profit"} recorded successfully! Redirecting...</span></div>}
          {errors.submit && <div style={{ ...styles.successMessage, background: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }}><span>⚠️</span><span>{errors.submit}</span></div>}
          <div style={styles.typeSelector}>
            <button type="button" onClick={() => { setFormData(p => ({ ...p, type: "expense" })); setErrors({}); }} style={{ ...styles.typeButton, ...(formData.type === "expense" ? styles.typeExpense : styles.typeInactive) }}><span>↙️</span> Expense</button>
            <button type="button" onClick={() => { setFormData(p => ({ ...p, type: "profit" })); setErrors({}); }} style={{ ...styles.typeButton, ...(formData.type === "profit" ? styles.typeProfit : styles.typeInactive) }}><span>↗️</span> Profit / Income</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label htmlFor="title" style={styles.label}>Description / Title *</label>
              <textarea id="title" name="title" value={formData.title} onChange={handleInputChange} onFocus={handleFocus} onBlur={handleBlur} style={styles.textarea} placeholder={`Enter ${formData.type} description or reason...`} disabled={loading} />
              {errors.title && <div style={styles.errorMessage}><span>⚠️</span>{errors.title}</div>}
            </div>
            <div style={styles.formGroup}>
              <label htmlFor="amount" style={styles.label}>Amount (₹) *</label>
              <div style={styles.inputWrapper}>
                <input type="number" id="amount" name="amount" value={formData.amount} onChange={handleInputChange} onFocus={handleFocus} onBlur={handleBlur} style={styles.input} placeholder="0.00" min="0" step="0.01" disabled={loading} />
                <div style={styles.inputIcon}>💰</div>
              </div>
              {errors.amount && <div style={styles.errorMessage}><span>⚠️</span>{errors.amount}</div>}
            </div>
            <div style={styles.buttonGroup}>
              <button type="button" onClick={() => navigate("/expence-profit")} style={styles.cancelButton} disabled={loading}>Cancel</button>
              <button type="submit" style={{ ...styles.submitButton, ...(loading ? styles.submitButtonDisabled : {}) }} disabled={loading}>
                {loading ? <><SpinnerComponent />Saving...</> : <><span style={{ marginRight: "8px" }}>💾</span>Save Record</>}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddExpenseProfit;
