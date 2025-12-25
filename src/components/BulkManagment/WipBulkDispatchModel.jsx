import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const styles = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(15,23,42,0.9)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    backdropFilter: "blur(4px)",
  },
  modal: {
    background: "linear-gradient(145deg, rgba(17,24,39,0.98) 0%, rgba(30,41,59,0.95) 100%)",
    borderRadius: "16px",
    border: "1px solid rgba(148,163,184,0.2)",
    padding: "28px",
    width: "90%",
    maxWidth: "450px",
    boxShadow: "0 20px 40px rgba(15,23,42,0.9)",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalHeader: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#e2e8f0",
    marginBottom: "20px",
    textAlign: "center",
  },
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    color: "#94a3b8",
    fontWeight: "600",
    marginBottom: "8px",
    fontSize: "15px",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1.5px solid rgba(148,163,184,0.3)",
    background: "rgba(15,23,42,0.7)",
    color: "#fff",
    fontSize: "16px",
    outline: "none",
    transition: "border 0.2s",
  },
  inputFocus: {
    borderColor: "#10b981",
    boxShadow: "0 0 0 3px rgba(16,185,129,0.1)",
  },
  textarea: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1.5px solid rgba(148,163,184,0.3)",
    background: "rgba(15,23,42,0.7)",
    color: "#fff",
    fontSize: "16px",
    outline: "none",
    resize: "vertical",
    minHeight: "120px",
    fontFamily: "monospace",
    transition: "border 0.2s",
  },
  buttons: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
    marginTop: "24px",
  },
  btn: {
    padding: "12px 24px",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "15px",
    cursor: "pointer",
    border: "none",
    transition: "all 0.2s",
  },
  btnCancel: {
    background: "rgba(148,163,184,0.2)",
    color: "#94a3b8",
    border: "1px solid rgba(148,163,184,0.3)",
  },
  btnSubmit: {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#fff",
    boxShadow: "0 4px 14px rgba(16,185,129,0.4)",
  },
  btnDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  exampleText: {
    fontSize: "13px",
    color: "#94a3b8",
    fontFamily: "monospace",
    marginTop: "6px",
    padding: "8px 4px",
    background: "rgba(148,163,184,0.1)",
    borderRadius: "6px",
  }
};

const WipBulkDispatchModel = ({ isOpen, onClose, dispatch,fetchDispatchesByTab }) => {
  const [dispatchDetail, setDispatchDetail] = useState("");
  const [dispatchId, setDispatchId] = useState("");
  const [waybillsArray, setWaybillsArray] = useState(""); // JSON array string
  const [loading, setLoading] = useState(false);
  const [focusInput, setFocusInput] = useState("");

  useEffect(() => {
    if (dispatch?.id || dispatch?._id) {
      setDispatchId(dispatch.id || dispatch._id);
      setDispatchDetail(dispatch);
    }
  }, [dispatch]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    let wbnsArray;
    try {
            if (!dispatchId) {
              toast.error("Dispatch ID is required.");
              return;
            }
      // Parse JSON array
      wbnsArray = JSON.parse(waybillsArray);
      
      // Validate it's an array of strings
      if (!Array.isArray(wbnsArray)) {
        toast.error("Waybills must be a valid JSON array.");
        return;
      }
      if (wbnsArray.length === 0) {
        toast.error("Array cannot be empty.");
        return;
      }
      if (!wbnsArray.every(wb => typeof wb === 'string' && wb.trim())) {
        toast.error("All waybills must be non-empty strings.");
        return;
      }
    } catch (error) {
      toast.error("Invalid JSON format. Use: [\"waybill1\",\"waybill2\"]");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/dispatch/bulk-dispatch",
        {
          dispatch_id: parseInt(dispatchId),
          action: "add_packages",
          wbns: wbnsArray,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.success) {
        fetchDispatchesByTab("wip");
        toast.success(
          `✅ Success! ${wbnsArray.length} packages added to dispatch ${dispatchId}.`
        );
        onClose();
        setWaybillsArray("");
      } else {
        toast.error("Failed to add packages.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to add packages to dispatch."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.formGroup}>
          <label style={styles.label}>`Dispatch ID Of {dispatchDetail?.dispatch_fe?.name}`</label>
          <input
            style={{
              ...styles.input,
              ...(focusInput === "dispatchId" ? styles.inputFocus : {}),
            }}
            type="number"
            placeholder="Enter dispatch ID (e.g. 235519679)"
            value={dispatchId}
            onChange={(e) => setDispatchId(e.target.value)}
            onFocus={() => setFocusInput("dispatchId")}
            onBlur={() => setFocusInput("")}
            disabled={true}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Waybill Numbers (JSON Array)</label>
          <textarea
            style={{
              ...styles.textarea,
              ...(focusInput === "waybills" ? styles.inputFocus : {}),
            }}
            placeholder='["1490823859095373","1490823859095371"]'
            value={waybillsArray}
            onChange={(e) => setWaybillsArray(e.target.value)}
            onFocus={() => setFocusInput("waybills")}
            onBlur={() => setFocusInput("")}
            disabled={loading}
          />
          <div style={styles.exampleText}>
            Example: <code>["1490823859095373","1490823859095371"]</code>
          </div>
        </div>

        <div style={styles.buttons}>
          <button
            style={{ ...styles.btn, ...styles.btnCancel }}
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            style={{
              ...styles.btn,
              ...styles.btnSubmit,
              ...(loading ? styles.btnDisabled : {}),
            }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Adding..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WipBulkDispatchModel;
