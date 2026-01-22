import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AddVehicleModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    vehicle_number: "",
    driver_name: "Ram", // ✅ Default driver name
    opening_kms: "0",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState("");

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        vehicle_number: "",
        driver_name: "Ram",
        opening_kms: "0",
      });
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

  // Validation
  const validateField = (name, value) => {
    if (name === "vehicle_number") {
      const vehicleRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/;
      if (!value.trim()) return "Vehicle number is required";
      if (!vehicleRegex.test(value.replace(/\s/g, "").toUpperCase())) {
        return "Invalid format. Example: MP05R3516";
      }
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const processedValue =
      name === "vehicle_number" ? value.toUpperCase() : value;

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    if (error) {
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const error = validateField("vehicle_number", formData.vehicle_number);
    if (error) newErrors.vehicle_number = error;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/flow/add-vehicle-info`,
        {
          driver_name: formData.driver_name.trim(),
          vehicle_number: formData.vehicle_number.replace(/\s/g, ""),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message || "Vehicle added successfully!");
        if (onSuccess) onSuccess(response.data);
        setTimeout(() => onClose(), 1000);
      }
    } catch (error) {
      console.error("Error adding vehicle:", error);

      if (error.response?.status === 207) {
        toast.warning(
          error.response.data.message || "Vehicle added with partial success"
        );
        if (onSuccess) onSuccess(error.response.data);
        setTimeout(() => onClose(), 1500);
      } else {
        toast.error(
          error.response?.data?.error ||
            error.response?.data?.message ||
            "Failed to add vehicle. Please try again."
        );
      }
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
          <h2 style={styles.title}>Add New Vehicle</h2>
          <button style={styles.closeBtn} onClick={onClose} disabled={loading}>
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div style={styles.body}>
            {/* Vehicle Number */}
            <div style={styles.formField}>
              <label htmlFor="vehicle_number" style={styles.label}>
                Vehicle Number <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="vehicle_number"
                name="vehicle_number"
                value={formData.vehicle_number}
                onChange={handleChange}
                onBlur={handleBlur}
                onFocus={() => setFocusedField("vehicle_number")}
                placeholder="MP05R3629"
                maxLength={10}
                style={{
                  ...styles.input,
                  ...(errors.vehicle_number ? styles.inputError : {}),
                  ...(focusedField === "vehicle_number"
                    ? styles.inputFocus
                    : {}),
                }}
                disabled={loading}
                autoComplete="off"
              />
              {errors.vehicle_number && (
                <span style={styles.errorText}>{errors.vehicle_number}</span>
              )}
              <small style={styles.hint}>
                Format: 2 letters + 2 digits + 1-2 letters + 4 digits
              </small>
            </div>

            {/* Hidden Driver Name */}
            <input
              type="hidden"
              name="driver_name"
              value={formData.driver_name}
            />
            <input
              type="hidden"
              name="opening_kms"
              value={formData.opening_kms}
            />
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
                  Adding...
                </>
              ) : (
                "Add Vehicle"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ✅ Dark Theme Styles matching your dashboard
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
    maxWidth: "500px",
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
  inputFocus: {
    borderColor: "#10b981",
    boxShadow: "0 0 0 3px rgba(16,185,129,0.1)",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  hint: {
    display: "block",
    marginTop: "6px",
    fontSize: "13px",
    color: "#64748b",
  },
  errorText: {
    display: "block",
    marginTop: "6px",
    fontSize: "13px",
    color: "#ef4444",
    fontWeight: "500",
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
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#fff",
    boxShadow: "0 4px 14px rgba(16,185,129,0.4)",
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

export default AddVehicleModal;
