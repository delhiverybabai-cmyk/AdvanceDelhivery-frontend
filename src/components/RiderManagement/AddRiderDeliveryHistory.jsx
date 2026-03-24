import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const AddRiderDeliveryHistory = () => {
  const { riderId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ riderId: riderId || "", assignedParcels: "", successfulDelivered: "", successfulRVP: "", cashedDeposited: "", perParcelRate: 15, selectedDate: "" });
  const computedReturnInHub = Math.max(0, (Number(formData.assignedParcels) || 0) - (Number(formData.successfulDelivered) || 0) - (Number(formData.successfulRVP) || 0));
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const s = {
    container: { minHeight: "100vh", backgroundColor: "#0f172a", fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" },
    main: { maxWidth: "900px", margin: "0 auto", padding: "48px 32px" },
    backButton: { display: "flex", alignItems: "center", padding: "12px 20px", background: "rgba(148, 163, 184, 0.1)", color: "#94a3b8", border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "500", transition: "all 0.3s ease", marginBottom: "32px" },
    headerSection: { textAlign: "center", marginBottom: "48px" },
    mainTitle: { fontSize: "42px", fontWeight: "800", background: "linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "16px", letterSpacing: "-0.02em" },
    subtitle: { fontSize: "18px", color: "#94a3b8", lineHeight: "1.6" },
    riderInfo: { background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)", borderRadius: "12px", padding: "16px 20px", marginBottom: "32px", textAlign: "center" },
    riderIdLabel: { fontSize: "12px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" },
    formContainer: { background: "linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)", backdropFilter: "blur(10px)", border: "1px solid rgba(148, 163, 184, 0.1)", borderRadius: "20px", padding: "40px", position: "relative" },
    formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" },
    formGroup: { marginBottom: "24px" },
    label: { display: "block", fontSize: "14px", fontWeight: "600", color: "#e2e8f0", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" },
    input: { width: "100%", padding: "16px 20px", fontSize: "16px", fontWeight: "500", color: "#ffffff", backgroundColor: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: "12px", outline: "none", transition: "all 0.3s ease", boxSizing: "border-box" },
    inputWrapper: { position: "relative" },
    inputIcon: { position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", color: "#64748b", fontSize: "18px" },
    errorMessage: { color: "#ef4444", fontSize: "13px", marginTop: "6px", display: "flex", alignItems: "center", gap: "6px" },
    buttonGroup: { display: "flex", gap: "16px", justifyContent: "flex-end", marginTop: "32px", gridColumn: "1 / -1" },
    submitButton: { padding: "16px 32px", fontSize: "16px", fontWeight: "600", color: "#ffffff", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", border: "none", borderRadius: "12px", cursor: "pointer", boxShadow: "0 8px 25px rgba(16, 185, 129, 0.3)", minWidth: "160px" },
    submitButtonDisabled: { background: "rgba(148, 163, 184, 0.3)", cursor: "not-allowed", boxShadow: "none" },
    cancelButton: { padding: "16px 32px", fontSize: "16px", fontWeight: "600", color: "#94a3b8", background: "transparent", border: "1px solid rgba(148, 163, 184, 0.3)", borderRadius: "12px", cursor: "pointer" },
    loadingSpinner: { width: "20px", height: "20px", border: "2px solid rgba(255, 255, 255, 0.3)", borderTop: "2px solid #ffffff", borderRadius: "50%", display: "inline-block", marginRight: "8px" },
    successMessage: { background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "12px", padding: "16px 20px", marginBottom: "24px", color: "#10b981", fontSize: "14px", display: "flex", alignItems: "center", gap: "10px" },
  };

  const SpinnerComponent = () => {
    const [rotation, setRotation] = useState(0);
    React.useEffect(() => { const interval = setInterval(() => setRotation(prev => (prev + 10) % 360), 50); return () => clearInterval(interval); }, []);
    return <div style={{ ...s.loadingSpinner, transform: `rotate(${rotation}deg)` }} />;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.assignedParcels || Number(formData.assignedParcels) <= 0) newErrors.assignedParcels = "Enter a valid number greater than 0";
    if (!formData.successfulDelivered && formData.successfulDelivered !== "0") newErrors.successfulDelivered = "Required";
    else if (Number(formData.successfulDelivered) > Number(formData.assignedParcels)) newErrors.successfulDelivered = "Cannot exceed assigned parcels";
    if (!formData.successfulRVP && formData.successfulRVP !== "0") newErrors.successfulRVP = "Required";
    if (!formData.cashedDeposited && formData.cashedDeposited !== "0") newErrors.cashedDeposited = "Required";
    const td = Number(formData.successfulDelivered) || 0, tr = Number(formData.successfulRVP) || 0, ta = Number(formData.assignedParcels) || 0;
    if (td + tr > ta) newErrors.general = "Total of delivered and RVP cannot exceed assigned parcels";
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
      await axios.post(`${process.env.REACT_APP_BASE_URL}/api/rider-payment/delivery-payment-history`, {
        riderId: formData.riderId.trim(), assignedParcels: Number(formData.assignedParcels), successfulDelivered: Number(formData.successfulDelivered), successfulRVP: Number(formData.successfulRVP), canceledByCode: 0, parcelsReturnInHub: computedReturnInHub, cashedDeposited: Number(formData.cashedDeposited), perParcelRate: Number(formData.perParcelRate), selectedDate: formData.selectedDate || new Date().toISOString().split("T")[0]
      });
      setSuccess(true);
      setFormData({ riderId: riderId || "", assignedParcels: "", successfulDelivered: "", successfulRVP: "", cashedDeposited: "", perParcelRate: 15, selectedDate: "" });
      setTimeout(() => { setSuccess(false); navigate(`/rider-details/${riderId}`); }, 3000);
    } catch (error) { setErrors({ submit: error.response?.data?.message || "Failed to add delivery history." }); }
    finally { setLoading(false); }
  };

  const handleFocus = (e) => { e.target.style.borderColor = "#10b981"; e.target.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.1)"; e.target.style.backgroundColor = "rgba(15, 23, 42, 0.8)"; };
  const handleBlur = (e) => { e.target.style.borderColor = errors[e.target.name] ? "#ef4444" : "rgba(148, 163, 184, 0.2)"; e.target.style.boxShadow = "none"; e.target.style.backgroundColor = "rgba(15, 23, 42, 0.6)"; };
  const isFormValid = () => ["assignedParcels", "successfulDelivered", "successfulRVP", "cashedDeposited", "perParcelRate"].every(f => formData[f] !== "") && Object.keys(errors).length === 0;

  return (
    <div style={s.container}>
      <main style={s.main}>
        <button style={s.backButton} onClick={() => navigate(`/rider-details/${riderId}`)} onMouseEnter={e => { e.target.style.background = "rgba(148,163,184,0.2)"; e.target.style.color = "#e2e8f0"; }} onMouseLeave={e => { e.target.style.background = "rgba(148,163,184,0.1)"; e.target.style.color = "#94a3b8"; }}>← Back to Delivery History</button>
        <div style={s.headerSection}><h1 style={s.mainTitle}>Add Delivery History</h1><p style={s.subtitle}>Record new delivery and payment history for the rider</p></div>
        <div style={s.riderInfo}><div style={s.riderIdLabel}>Rider ID: {formData.riderId}</div></div>
        <div style={s.formContainer}>
          {success && <div style={s.successMessage}><span>✅</span><span>Delivery history added successfully! Redirecting...</span></div>}
          {errors.submit && <div style={{ ...s.successMessage, background: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }}><span>⚠️</span><span>{errors.submit}</span></div>}
          {errors.general && <div style={{ ...s.successMessage, background: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }}><span>⚠️</span><span>{errors.general}</span></div>}
          <form onSubmit={handleSubmit}>
            <div style={s.formGrid}>
              {[["assignedParcels","Assigned Parcels *","📦","Enter assigned parcels count",1],["successfulDelivered","Successful Delivered *","✅","Enter successful deliveries",0],["successfulRVP","Successful RVP *","🔄","Enter successful RVP count",0],["cashedDeposited","Cash Deposited (₹) *","💵","Enter cash deposited amount",0]].map(([name, label, icon, placeholder, min]) => (
                <div key={name} style={s.formGroup}>
                  <label htmlFor={name} style={s.label}>{label}</label>
                  <div style={s.inputWrapper}>
                    <input type="number" id={name} name={name} value={formData[name]} onChange={handleInputChange} onFocus={handleFocus} onBlur={handleBlur} style={s.input} placeholder={placeholder} min={min} disabled={loading} />
                    <div style={s.inputIcon}>{icon}</div>
                  </div>
                  {errors[name] && <div style={s.errorMessage}><span>⚠️</span>{errors[name]}</div>}
                </div>
              ))}
              <div style={s.formGroup}>
                <label style={s.label}>Return In Hub (Auto)</label>
                <div style={{ ...s.input, display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(15, 23, 42, 0.3)", border: "1px solid rgba(148, 163, 184, 0.1)", color: "#10b981", fontWeight: "700", fontSize: "18px", cursor: "default" }}>
                  <span>🏢</span><span>{computedReturnInHub}</span><span style={{ fontSize: "11px", color: "#64748b", fontWeight: "400" }}>Assigned − Delivered − RVP</span>
                </div>
              </div>
              <div style={s.formGroup}>
                <label htmlFor="perParcelRate" style={s.label}>Per Parcel Rate (₹) *</label>
                <div style={s.inputWrapper}>
                  <select id="perParcelRate" name="perParcelRate" value={formData.perParcelRate} onChange={handleInputChange} onFocus={handleFocus} onBlur={handleBlur} style={{ ...s.input, appearance: "none", WebkitAppearance: "none", cursor: "pointer" }} disabled={loading}>
                    {[12,13,14,15,16].map(v => <option key={v} value={v}>₹{v}</option>)}
                  </select>
                  <div style={s.inputIcon}>💰</div>
                </div>
              </div>
              <div style={s.formGroup}>
                <label htmlFor="selectedDate" style={s.label}>Select Date *</label>
                <div style={s.inputWrapper}>
                  <input type="date" id="selectedDate" name="selectedDate" value={formData.selectedDate} onChange={handleInputChange} onFocus={handleFocus} onBlur={handleBlur} style={s.input} disabled={loading} />
                  <div style={s.inputIcon}>📅</div>
                </div>
              </div>
              <div style={s.buttonGroup}>
                <button type="button" onClick={() => navigate(`/rider-details/${riderId}`)} style={s.cancelButton} disabled={loading}>Cancel</button>
                <button type="submit" style={{ ...s.submitButton, ...(loading ? s.submitButtonDisabled : {}) }} disabled={loading}>
                  {loading ? <><SpinnerComponent />Adding History...</> : <><span style={{ marginRight: "8px" }}>💾</span>Add History</>}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddRiderDeliveryHistory;
