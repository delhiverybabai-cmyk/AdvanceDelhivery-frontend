import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const UpdateDeliveryHistoryDate = () => {
  const { historyId, riderId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ selectedDate: "" });
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  const styles = {
    container: { minHeight: "100vh", backgroundColor: "#0f172a", fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" },
    main: { maxWidth: "600px", margin: "0 auto", padding: "48px 32px" },
    backButton: { display: "flex", alignItems: "center", padding: "12px 20px", background: "rgba(148, 163, 184, 0.1)", color: "#94a3b8", border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "500", transition: "all 0.3s ease", marginBottom: "32px" },
    headerSection: { textAlign: "center", marginBottom: "48px" },
    mainTitle: { fontSize: "42px", fontWeight: "800", background: "linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "16px", letterSpacing: "-0.02em" },
    subtitle: { fontSize: "18px", color: "#94a3b8", lineHeight: "1.6" },
    riderInfo: { background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)", borderRadius: "12px", padding: "16px 20px", marginBottom: "32px", textAlign: "center" },
    riderIdLabel: { fontSize: "16px", color: "#ffffff", fontWeight: "600" },
    formContainer: { background: "linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)", backdropFilter: "blur(10px)", border: "1px solid rgba(148, 163, 184, 0.1)", borderRadius: "20px", padding: "40px", position: "relative" },
    formGroup: { marginBottom: "32px" },
    label: { display: "block", fontSize: "16px", fontWeight: "600", color: "#e2e8f0", marginBottom: "12px", textAlign: "center" },
    input: { width: "100%", padding: "20px 24px", fontSize: "18px", fontWeight: "500", color: "#ffffff", backgroundColor: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: "12px", outline: "none", transition: "all 0.3s ease", boxSizing: "border-box", textAlign: "center" },
    inputWrapper: { position: "relative", maxWidth: "300px", margin: "0 auto" },
    inputIcon: { position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", color: "#64748b", fontSize: "20px" },
    errorMessage: { color: "#ef4444", fontSize: "14px", marginTop: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" },
    buttonGroup: { display: "flex", gap: "16px", justifyContent: "center" },
    submitButton: { padding: "16px 32px", fontSize: "16px", fontWeight: "600", color: "#ffffff", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", border: "none", borderRadius: "12px", cursor: "pointer", boxShadow: "0 8px 25px rgba(16, 185, 129, 0.3)", minWidth: "160px" },
    submitButtonDisabled: { background: "rgba(148, 163, 184, 0.3)", cursor: "not-allowed", boxShadow: "none" },
    cancelButton: { padding: "16px 32px", fontSize: "16px", fontWeight: "600", color: "#94a3b8", background: "transparent", border: "1px solid rgba(148, 163, 184, 0.3)", borderRadius: "12px", cursor: "pointer" },
    loadingSpinner: { width: "20px", height: "20px", border: "2px solid rgba(255, 255, 255, 0.3)", borderTop: "2px solid #ffffff", borderRadius: "50%", display: "inline-block", marginRight: "8px" },
    successMessage: { background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "12px", padding: "16px 20px", marginBottom: "24px", color: "#10b981", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" },
    loadingContainer: { display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "400px" },
    loadingSpinnerLarge: { width: "40px", height: "40px", border: "3px solid rgba(59, 130, 246, 0.3)", borderTop: "3px solid #3b82f6", borderRadius: "50%", marginBottom: "16px" },
    loadingText: { color: "#94a3b8", fontSize: "16px" }
  };

  const SpinnerComponent = ({ large }) => {
    const [rotation, setRotation] = useState(0);
    useEffect(() => { const interval = setInterval(() => setRotation(prev => (prev + 10) % 360), 50); return () => clearInterval(interval); }, []);
    return <div style={{ ...(large ? styles.loadingSpinnerLarge : styles.loadingSpinner), transform: `rotate(${rotation}deg)` }} />;
  };

  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        setFetchingData(true);
        const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/rider-payment/delivery-payment-history/${historyId}`);
        if (res.data?.status && res.data.data) {
          setOriginalData(res.data.data);
          const date = new Date(res.data.data.createdAt);
          setFormData({ selectedDate: date.toISOString().split("T")[0] });
        }
      } catch (err) {
        setErrors({ fetch: "Failed to load history data." });
      } finally { setFetchingData(false); }
    };
    if (historyId) fetchHistoryData();
  }, [historyId]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.selectedDate) newErrors.selectedDate = "Date is required";
    else {
      const selectedObj = new Date(formData.selectedDate);
      const today = new Date();
      if (selectedObj > today) newErrors.selectedDate = "Date cannot be in the future";
    }
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
      await axios.put(`${process.env.REACT_APP_BASE_URL}/api/rider-payment/delivery-payment-history/${historyId}`, { selectedDate: formData.selectedDate });
      setSuccess(true);
      setTimeout(() => navigate(`/rider-delivery-history/${riderId}`), 2000);
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || "Failed to update date." });
    } finally { setLoading(false); }
  };

  const handleFocus = (e) => { e.target.style.borderColor = "#10b981"; e.target.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.1)"; e.target.style.backgroundColor = "rgba(15, 23, 42, 0.8)"; };
  const handleBlur = (e) => { e.target.style.borderColor = errors[e.target.name] ? "#ef4444" : "rgba(148, 163, 184, 0.2)"; e.target.style.boxShadow = "none"; e.target.style.backgroundColor = "rgba(15, 23, 42, 0.6)"; };

  if (fetchingData) return <div style={styles.container}><main style={styles.main}><div style={styles.loadingContainer}><SpinnerComponent large /><div style={styles.loadingText}>Loading history data...</div></div></main></div>;

  return (
    <div style={styles.container}>
      <main style={styles.main}>
        <button style={styles.backButton} onClick={() => navigate(`/rider-delivery-history/${riderId}`)} onMouseEnter={e => { e.target.style.background = "rgba(148,163,184,0.2)"; e.target.style.color = "#e2e8f0"; }} onMouseLeave={e => { e.target.style.background = "rgba(148,163,184,0.1)"; e.target.style.color = "#94a3b8"; }}>← Back to Delivery History</button>
        <div style={styles.headerSection}><h1 style={styles.mainTitle}>Update Date</h1><p style={styles.subtitle}>Modify the date for this delivery record</p></div>
        <div style={styles.riderInfo}><div style={styles.riderIdLabel}>History ID: {historyId}</div></div>
        <div style={styles.formContainer}>
          {success && <div style={styles.successMessage}><span>✅</span><span>Date updated successfully! Redirecting...</span></div>}
          {errors.submit && <div style={{ ...styles.successMessage, background: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }}><span>⚠️</span><span>{errors.submit}</span></div>}
          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label htmlFor="selectedDate" style={styles.label}>Select New Date</label>
              <div style={styles.inputWrapper}>
                <input type="date" id="selectedDate" name="selectedDate" value={formData.selectedDate} onChange={handleInputChange} onFocus={handleFocus} onBlur={handleBlur} style={styles.input} disabled={loading} max={new Date().toISOString().split("T")[0]} />
                <div style={styles.inputIcon}>📅</div>
              </div>
              {errors.selectedDate && <div style={styles.errorMessage}><span>⚠️</span>{errors.selectedDate}</div>}
            </div>
            <div style={styles.buttonGroup}>
              <button type="button" onClick={() => navigate(`/rider-delivery-history/${riderId}`)} style={styles.cancelButton} disabled={loading}>Cancel</button>
              <button type="submit" style={{ ...styles.submitButton, ...(loading ? styles.submitButtonDisabled : {}) }} disabled={loading}>
                {loading ? <><SpinnerComponent />Updating...</> : <><span style={{ marginRight: "8px" }}>💾</span>Update Date</>}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default UpdateDeliveryHistoryDate;
