import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function RecordEntryModal({ isOpen, onClose, dispatch, filterDate, onSuccess }) {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [errs, setErrs] = useState({});
  const dateInputRef = useRef(null);

  const [formData, setFormData] = useState({
    riderId: "",
    assignedParcels: "",
    successfulDelivered: "",
    successfulRVP: "",
    cashedDeposited: "",
    perParcelRate: 15,
    selectedDate: "",
  });

  // Autofill form when modal opens
  useEffect(() => {
    if (isOpen && dispatch) {
      setFormData((prev) => ({
        ...prev,
        riderId: "", // Reset rider on open unless we know the rider
        assignedParcels: dispatch.totalPackages || 0,
        successfulDelivered: dispatch.deliveredCount || 0,
        successfulRVP: dispatch.pickupCompletedCount || 0,
        cashedDeposited: Math.floor(dispatch.expected_cod_amount || 0),
        perParcelRate: 15,
        selectedDate: filterDate || new Date().toISOString().split("T")[0],
      }));
      setMsg(null);
      setErrs({});
    }
  }, [isOpen, dispatch, filterDate]);

  // Fetch Riders and auto-select
  useEffect(() => {
    if (isOpen) {
      axios
        .get(`${process.env.REACT_APP_BASE_URL}/api/rider/get-riders`)
        .then((res) => {
          const fetchedRiders = res.data?.data || [];
          setRiders(fetchedRiders);
          
          // Auto-select rider matching dispatch.fePhone
          if (dispatch?.fePhone) {
            const matched = fetchedRiders.find(r => 
              Array.isArray(r.mobileNumber) 
                ? r.mobileNumber.includes(dispatch.fePhone)
                : r.mobileNumber === dispatch.fePhone
            );
            if (matched) {
              setFormData((prev) => ({ ...prev, riderId: matched._id }));
              setErrs((prev) => ({ ...prev, riderId: "" }));
            }
          }
        })
        .catch((err) => console.error("Error fetching riders", err));
    }
  }, [isOpen, dispatch?.fePhone]);

  if (!isOpen || !dispatch) return null;

  const computedReturnInHub = Math.max(
    0,
    (Number(formData.assignedParcels) || 0) -
      (Number(formData.successfulDelivered) || 0) -
      (Number(formData.successfulRVP) || 0)
  );

  const validate = () => {
    const e = {};
    if (!formData.riderId) e.riderId = "Please select a Rider";
    if (!formData.assignedParcels || Number(formData.assignedParcels) <= 0) e.assignedParcels = "Enter > 0";
    if (formData.successfulDelivered === "" || formData.successfulDelivered === null) e.successfulDelivered = "Required";
    else if (Number(formData.successfulDelivered) > Number(formData.assignedParcels)) e.successfulDelivered = "Exceeds assigned";
    if (formData.successfulRVP === "" || formData.successfulRVP === null) e.successfulRVP = "Required";
    if (formData.cashedDeposited === "" || formData.cashedDeposited === null) e.cashedDeposited = "Required";

    const td = Number(formData.successfulDelivered) || 0;
    const tr = Number(formData.successfulRVP) || 0;
    const ta = Number(formData.assignedParcels) || 0;
    if (td + tr > ta) e.general = "Delivered + RVP cannot exceed Assigned Parcels";

    setErrs(e);
    return !Object.keys(e).length;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errs[name]) setErrs((prev) => ({ ...prev, [name]: "" }));
    if (errs.general) setErrs((prev) => ({ ...prev, general: "" }));
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    setMsg(null);
    try {
      await axios.post(`${process.env.REACT_APP_BASE_URL}/api/rider-payment/delivery-payment-history`, {
        riderId: formData.riderId,
        assignedParcels: Number(formData.assignedParcels),
        successfulDelivered: Number(formData.successfulDelivered),
        successfulRVP: Number(formData.successfulRVP),
        canceledByCode: 0, // Hardcoded per reference AddRiderDeliveryHistory
        parcelsReturnInHub: computedReturnInHub,
        cashedDeposited: Number(formData.cashedDeposited),
        perParcelRate: Number(formData.perParcelRate),
        selectedDate: formData.selectedDate,
        dispatchId: dispatch._id,
      });
      setMsg({ text: "✅ Entry recorded successfully!", ok: true });
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      setMsg({ text: error.response?.data?.message || "Failed to add delivery history.", ok: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <style>{`
        .modalFadeUp { animation: fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .cool-scroll::-webkit-scrollbar { width: 6px; }
        .cool-scroll::-webkit-scrollbar-track { background: transparent; }
        .cool-scroll::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.3); border-radius: 10px; }
      `}</style>

      <div style={S.modal} className="modalFadeUp">
        {/* Header */}
        <div style={S.header}>
          <div>
            <h2 style={S.title}>🧾 Record Rider Entry</h2>
            <p style={S.sub}>Register this dispatch for a rider. Dispatch: <span style={{color:"#93c5fd", fontWeight:700, fontFamily:"monospace"}}>{dispatch.dispatchId}</span></p>
          </div>
          <button style={S.closeBtn} onClick={onClose} disabled={loading}>✕</button>
        </div>

        {/* Feedback Messages */}
        {msg && (
          <div style={{ ...S.feedbackBox, background: msg.ok ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", borderColor: msg.ok ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)", color: msg.ok ? "#10b981" : "#ef4444" }}>
            {msg.text}
          </div>
        )}
        {errs.general && (
          <div style={{ ...S.feedbackBox, background: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }}>
            ⚠️ {errs.general}
          </div>
        )}

        {/* Input Form Content */}
        <div style={S.scrollArea} className="cool-scroll">
          <div style={S.grid}>
            
            {/* Full Width Rider Dropdown */}
            <div style={{...S.formGroup, gridColumn: "1 / -1"}}>
              <label style={S.label}>Select Rider *</label>
              <div style={S.inputWrapper}>
                <select
                  name="riderId" value={formData.riderId} onChange={handleInputChange} disabled={loading}
                  style={{...S.input, appearance: "none", borderColor: errs.riderId ? "#ef4444" : "rgba(148,163,184,0.2)"}}
                >
                  <option value="" disabled>-- Choose a Rider --</option>
                  {riders.map((r) => (
                    <option key={r._id} value={r._id}>{r.name} {r.status === "Inactive" ? "(Inactive)" : ""}</option>
                  ))}
                </select>
                <div style={S.inputIcon}>🧑‍🚀</div>
              </div>
              {errs.riderId && <div style={S.err}>{errs.riderId}</div>}
            </div>

            {/* Autofill Grids */}
            {[
              { name: "assignedParcels", label: "Assigned Parcels *", icon: "📦", min: 1 },
              { name: "successfulDelivered", label: "Successful Delivered *", icon: "✅", min: 0 },
              { name: "successfulRVP", label: "Successful RVP *", icon: "🔄", min: 0 },
              { name: "cashedDeposited", label: "Cash Deposited (₹) *", icon: "💵", min: 0 },
            ].map((f) => (
              <div key={f.name} style={S.formGroup}>
                <label style={S.label}>{f.label}</label>
                <div style={S.inputWrapper}>
                  <input
                    type="number" name={f.name} value={formData[f.name]} onChange={handleInputChange}
                    style={{...S.input, borderColor: errs[f.name] ? "#ef4444" : "rgba(148,163,184,0.2)"}}
                    min={f.min} disabled={loading}
                  />
                  <div style={S.inputIcon}>{f.icon}</div>
                </div>
                {errs[f.name] && <div style={S.err}>{errs[f.name]}</div>}
              </div>
            ))}

            {/* Computed Return Hub */}
            <div style={S.formGroup}>
              <label style={S.label}>Return In Hub (Auto)</label>
              <div style={{ ...S.input, display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(15,23,42,0.4)", border: "1px solid rgba(148,163,184,0.1)", color: "#10b981", fontWeight: "700", fontSize: "16px", cursor: "default" }}>
                <span>🏢</span><span>{computedReturnInHub}</span>
              </div>
            </div>

            {/* Per Parcel Rate */}
            <div style={S.formGroup}>
              <label style={S.label}>Per Parcel Rate (₹) *</label>
              <div style={S.inputWrapper}>
                <select
                  name="perParcelRate" value={formData.perParcelRate} onChange={handleInputChange} disabled={loading}
                  style={{ ...S.input, appearance: "none" }}
                >
                  {[12, 13, 14, 15, 16].map(v => <option key={v} value={v}>₹{v}</option>)}
                </select>
                <div style={S.inputIcon}>💰</div>
              </div>
            </div>

            {/* Selected Date */}
            <div style={{...S.formGroup, gridColumn: "1 / -1"}}>
              <label style={S.label}>Select Date *</label>
              <div style={S.inputWrapper}>
                <input
                  ref={dateInputRef} type="date" name="selectedDate" value={formData.selectedDate} onChange={handleInputChange}
                  style={S.input} disabled={loading}
                />
                <div style={{ ...S.inputIcon, cursor: "pointer" }} onClick={() => dateInputRef.current?.showPicker()}>📅</div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div style={S.footer}>
          <button style={S.cancelBtn} onClick={onClose} disabled={loading}>Cancel</button>
          <button
            style={{ ...S.submitBtn, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
            onClick={submit} disabled={loading}
          >
            {loading ? (
              <span style={{display: "flex", alignItems: "center", gap: 8}}>
                <div style={{width:16, height:16, border:"2px solid rgba(255,255,255,0.3)", borderTop:"2px solid #fff", borderRadius:"50%"}} className="spin" />
                Saving...
              </span>
            ) : "💾 Submit Entry"}
          </button>
        </div>

      </div>
    </div>
  );
}

const S = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(2, 6, 23, 0.75)", backdropFilter: "blur(8px)",
    zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
    padding: 16
  },
  modal: {
    background: "linear-gradient(145deg, #1e293b, #0f172a)",
    border: "1px solid rgba(148,163,184,0.15)", borderRadius: 20,
    width: "100%", maxWidth: 640, maxHeight: "90vh",
    display: "flex", flexDirection: "column",
    boxShadow: "0 24px 64px rgba(0,0,0,0.5)", overflow: "hidden"
  },
  header: {
    padding: "24px 28px", borderBottom: "1px solid rgba(148,163,184,0.1)",
    display: "flex", justifyContent: "space-between", alignItems: "flex-start"
  },
  title: { fontSize: 22, fontWeight: 800, color: "#f8fafc", margin: 0, marginBottom: 4 },
  sub: { fontSize: 13, color: "#94a3b8", margin: 0 },
  closeBtn: {
    background: "rgba(148,163,184,0.1)", border: "1px solid rgba(148,163,184,0.15)",
    borderRadius: 8, color: "#94a3b8", width: 32, height: 32,
    cursor: "pointer", fontSize: 14, fontWeight: 700,
    display: "flex", alignItems: "center", justifyContent: "center"
  },
  feedbackBox: {
    margin: "16px 28px 0", padding: "12px 16px",
    border: "1px solid", borderRadius: 10,
    fontSize: 14, fontWeight: 600
  },
  scrollArea: {
    padding: "24px 28px", overflowY: "auto", flex: 1
  },
  grid: {
    display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20
  },
  formGroup: { display: "flex", flexDirection: "column" },
  label: {
    fontSize: 12, fontWeight: 700, color: "#94a3b8",
    textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8
  },
  inputWrapper: { position: "relative" },
  input: {
    width: "100%", boxSizing: "border-box", padding: "14px 16px", paddingRight: 40,
    fontSize: 15, fontWeight: 500, color: "#f1f5f9",
    background: "rgba(15,23,42,0.6)", border: "1px solid rgba(148,163,184,0.2)",
    borderRadius: 10, outline: "none", fontFamily: "inherit",
    transition: "border 0.2s, box-shadow 0.2s"
  },
  inputIcon: {
    position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
    color: "#64748b", fontSize: 16, pointerEvents: "none"
  },
  err: { color: "#ef4444", fontSize: 12, marginTop: 6, fontWeight: 500 },
  footer: {
    padding: "20px 28px", borderTop: "1px solid rgba(148,163,184,0.1)",
    background: "rgba(15,23,42,0.4)",
    display: "flex", justifyContent: "flex-end", gap: 12
  },
  cancelBtn: {
    padding: "12px 24px", background: "transparent", color: "#94a3b8",
    border: "1px solid rgba(148,163,184,0.3)", borderRadius: 10,
    fontWeight: 600, fontSize: 14, cursor: "pointer", transition: "all 0.15s"
  },
  submitBtn: {
    padding: "12px 24px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#fff", border: "none", borderRadius: 10,
    fontWeight: 700, fontSize: 14, boxShadow: "0 4px 16px rgba(16,185,129,0.3)"
  }
};
