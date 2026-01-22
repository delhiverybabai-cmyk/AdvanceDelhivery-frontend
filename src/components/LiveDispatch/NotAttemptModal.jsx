import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const NotAttemptModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    waybill: [],
    status: "Pending",
    status_type: "UD",
    current_nsl: "EOD-86",
    scan_remark: "Not attempted",
    sync: true,
    src: "dashboard",
  });

  const [waybillInput, setWaybillInput] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        waybill: [],
        status: "Pending",
        status_type: "UD",
        current_nsl: "EOD-86",
        scan_remark: "Not attempted",
        sync: true,
        src: "dashboard",
      });
      setWaybillInput("");
      setErrors({});
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle waybill input (comma or newline separated)
  const handleWaybillInput = (e) => {
    const value = e.target.value;
    setWaybillInput(value);

    // Parse waybills (comma or newline separated)
    const waybills = value
      .split(/[\n,]+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 0);

    setFormData((prev) => ({
      ...prev,
      waybill: waybills,
    }));

    if (errors.waybill) {
      setErrors((prev) => ({
        ...prev,
        waybill: "",
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.waybill.length === 0) {
      newErrors.waybill = "At least one waybill is required";
    }

    if (!formData.scan_remark.trim()) {
      newErrors.scan_remark = "Scan remark is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_BASE_URL}/api/dispatch/update-package-status`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success(
          response.data.message ||
            `Updated ${formData.waybill.length} package(s) successfully!`
        );
        setTimeout(() => onClose(), 1000);
      }
    } catch (error) {
      console.error("Error updating package status:", error);
      toast.error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to update package status. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div
        style={styles.container}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Mark as Not Attempted</h2>
          <button style={styles.closeBtn} onClick={onClose} disabled={loading}>
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div style={styles.body}>
            {/* Waybill Numbers */}
            <div style={styles.formField}>
              <label htmlFor="waybill" style={styles.label}>
                Waybill Numbers <span style={styles.required}>*</span>
              </label>
              <textarea
                id="waybill"
                name="waybill"
                value={waybillInput}
                onChange={handleWaybillInput}
                placeholder="Enter waybill numbers (comma or line separated)&#10;Example:&#10;1490824701872446,&#10;1490824682996154"
                rows={6}
                style={{
                  ...styles.textarea,
                  ...(errors.waybill ? styles.inputError : {}),
                }}
                disabled={loading}
              />
              {errors.waybill && (
                <span style={styles.errorText}>{errors.waybill}</span>
              )}
              {formData.waybill.length > 0 && (
                <small style={styles.successText}>
                  ✓ {formData.waybill.length} waybill(s) detected
                </small>
              )}
            </div>

            {/* Scan Remark */}
            <div style={styles.formField}>
              <label htmlFor="scan_remark" style={styles.label}>
                Scan Remark <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="scan_remark"
                name="scan_remark"
                value={formData.scan_remark}
                onChange={handleChange}
                placeholder="Not attempted"
                style={{
                  ...styles.input,
                  ...(errors.scan_remark ? styles.inputError : {}),
                }}
                disabled={loading}
              />
              {errors.scan_remark && (
                <span style={styles.errorText}>{errors.scan_remark}</span>
              )}
            </div>

            {/* Current NSL */}
            <div style={styles.formField}>
              <label htmlFor="current_nsl" style={styles.label}>
                Current NSL
              </label>
              <input
                type="text"
                id="current_nsl"
                name="current_nsl"
                value={formData.current_nsl}
                onChange={handleChange}
                placeholder="EOD-86"
                style={styles.input}
                disabled={loading}
              />
            </div>

            {/* Status Type (Read-only display) */}
            <div style={styles.formField}>
              <label style={styles.label}>Status Type</label>
              <div style={styles.statusBadge}>
                <span style={styles.statusDot}></span>
                UD (Undelivered)
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <button
              type="button"
              style={styles.btnSecondary}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" style={styles.btnPrimary} disabled={loading}>
              {loading ? (
                <>
                  <span style={styles.spinner}></span>
                  Updating...
                </>
              ) : (
                "Mark Not Attempted"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ✅ Dark Theme Styles with Orange accent
const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "20px",
  },
  container: {
    background:
      "linear-gradient(145deg, rgba(17,24,39,0.98) 0%, rgba(30,41,59,0.95) 100%)",
    borderRadius: "16px",
    border: "1px solid rgba(148,163,184,0.2)",
    width: "100%",
    maxWidth: "550px",
    maxHeight: "90vh",
    overflow: "hidden",
    boxShadow: "0 20px 40px rgba(15,23,42,0.9)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 24px",
    borderBottom: "1px solid rgba(148,163,184,0.2)",
  },
  title: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#e2e8f0",
    margin: 0,
  },
  closeBtn: {
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    border: "none",
    borderRadius: "6px",
    fontSize: "20px",
    color: "#94a3b8",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  body: {
    padding: "24px",
    maxHeight: "calc(90vh - 160px)",
    overflowY: "auto",
  },
  formField: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "15px",
    fontWeight: "600",
    color: "#94a3b8",
    marginBottom: "8px",
  },
  required: {
    color: "#ef4444",
    marginLeft: "2px",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "16px",
    color: "#fff",
    background: "rgba(15,23,42,0.7)",
    border: "1.5px solid rgba(148,163,184,0.3)",
    borderRadius: "10px",
    transition: "all 0.2s",
    outline: "none",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "15px",
    color: "#fff",
    background: "rgba(15,23,42,0.7)",
    border: "1.5px solid rgba(148,163,184,0.3)",
    borderRadius: "10px",
    transition: "all 0.2s",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "monospace",
    resize: "vertical",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  errorText: {
    display: "block",
    marginTop: "6px",
    fontSize: "13px",
    color: "#ef4444",
    fontWeight: "500",
  },
  successText: {
    display: "block",
    marginTop: "6px",
    fontSize: "13px",
    color: "#10b981",
    fontWeight: "500",
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    background: "rgba(255, 131, 43, 0.15)",
    border: "1px solid rgba(255, 131, 43, 0.3)",
    borderRadius: "8px",
    color: "#FF9D52",
    fontSize: "14px",
    fontWeight: "600",
  },
  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#FF832B",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "12px",
    padding: "16px 24px",
    borderTop: "1px solid rgba(148,163,184,0.2)",
  },
  btnSecondary: {
    padding: "12px 24px",
    fontSize: "15px",
    fontWeight: "600",
    borderRadius: "10px",
    border: "1px solid rgba(148,163,184,0.3)",
    cursor: "pointer",
    transition: "all 0.2s",
    background: "rgba(148,163,184,0.2)",
    color: "#94a3b8",
  },
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 24px",
    fontSize: "15px",
    fontWeight: "600",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s",
    background: "linear-gradient(135deg, #FF832B 0%, #FF9D52 100%)",
    color: "#fff",
    boxShadow: "0 4px 14px rgba(255, 131, 43, 0.4)",
  },
  spinner: {
    display: "inline-block",
    width: "14px",
    height: "14px",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderTopColor: "#ffffff",
    borderRadius: "50%",
    animation: "spin 0.6s linear infinite",
  },
};

// CSS Animations
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default NotAttemptModal;
