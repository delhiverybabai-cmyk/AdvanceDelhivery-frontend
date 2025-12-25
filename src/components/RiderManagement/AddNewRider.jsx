import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddNewRider = () => {
  const [formData, setFormData] = useState({
    name: "",
    mobileNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      fontFamily:
        '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
    main: {
      maxWidth: "700px",
      margin: "0 auto",
      padding: "48px 24px",
    },
    headerSection: {
      textAlign: "center",
      marginBottom: "38px",
    },
    mainTitle: {
      fontSize: "42px",
      fontWeight: "800",
      background: "linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)",
      backgroundClip: "text",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      marginBottom: "13px",
      letterSpacing: "-0.02em",
    },
    subtitle: {
      fontSize: "18px",
      color: "#94a3b8",
      lineHeight: "1.6",
    },
    formContainer: {
      background:
        "linear-gradient(145deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.96) 100%)",
      border: "1px solid rgba(148, 163, 184, 0.13)",
      borderRadius: "20px",
      padding: "34px 28px",
      boxShadow: "0 2px 22px 0 rgba(71, 89, 42, 0.05)",
    },
    formGroup: {
      marginBottom: "22px",
    },
    label: {
      display: "block",
      fontSize: "14px",
      fontWeight: "700",
      color: "#e2e8f0",
      marginBottom: "8px",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
    },
    input: {
      width: "100%",
      padding: "14px 18px",
      fontSize: "16px",
      fontWeight: "500",
      color: "#fff",
      backgroundColor: "rgba(15,23,42,0.6)",
      border: "1px solid rgba(148,163,184,0.22)",
      borderRadius: "10px",
      outline: "none",
      boxSizing: "border-box",
    },
    buttonGroup: {
      display: "flex",
      gap: "16px",
      justifyContent: "flex-end",
      marginTop: "28px",
    },
    submitButton: {
      padding: "15px 32px",
      fontSize: "16px",
      fontWeight: "700",
      color: "#202611",
      background: "linear-gradient(135deg, #baed4dff 0%, #e6f51dff 100%)",
      border: "none",
      borderRadius: "12px",
      cursor: "pointer",
      boxShadow: "0 8px 24px #cddc3970",
      minWidth: "140px",
      letterSpacing: "0.025em",
    },
    submitButtonDisabled: {
      background: "rgba(148, 163, 184, 0.3)",
      cursor: "not-allowed",
      color: "#7e8963",
      boxShadow: "none",
    },
    cancelButton: {
      padding: "15px 32px",
      fontSize: "16px",
      fontWeight: "600",
      color: "#94a3b8",
      background: "transparent",
      border: "1px solid rgba(148,163,184,0.3)",
      borderRadius: "12px",
      cursor: "pointer",
    },
    successMessage: {
      background: "rgba(186,237,77,0.08)",
      border: "1px solid #baed4dff",
      borderRadius: "12px",
      padding: "14px 18px",
      marginBottom: "22px",
      color: "#6e800f",
      fontSize: "14px",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
  };

  function validateInputs() {
    // Manual validation with toast feedback
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return false;
    }
    if (formData.name.trim().length < 2) {
      toast.error("Name must be at least 2 characters long");
      return false;
    }
    if (!formData.mobileNumber.trim()) {
      toast.error("Mobile number is required");
      return false;
    }
    if (!/^\+91\d{10}$/.test(formData.mobileNumber.trim())) {
      toast.error("Enter a valid mobile number with +91 prefix");
      return false;
    }
    return true;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (success) setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/rider/create-rider`,
        {
          name: formData.name.trim(),
          mobileNumber: formData.mobileNumber.trim(),
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setLoading(false);
      setSuccess(true);
      setFormData({ name: "", mobileNumber: "" });
      toast.success("Rider added successfully!");
    } catch (error) {
      setLoading(false);
      if (error.response?.status === 409) {
        toast.error("A rider with this mobile number already exists");
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to add rider. Please try again.");
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", mobileNumber: "" });
    setSuccess(false);
  };

  return (
    <div style={styles.container}>
      <ToastContainer position="top-right" autoClose={5000} />
      <main style={styles.main}>
        <div style={styles.headerSection}>
          <h1 style={styles.mainTitle}>Add New Rider</h1>
          <p style={styles.subtitle}>
            Register a new delivery rider to your team
          </p>
        </div>
        <div style={styles.formContainer}>
          {success && (
            <div style={styles.successMessage}>
              <span>✅</span>
              <span>
                Rider added successfully! You can add another rider or return to
                the list.
              </span>
            </div>
          )}
          <form onSubmit={handleSubmit} autoComplete="off">
            <div style={styles.formGroup}>
              <label htmlFor="name" style={styles.label}>
                Rider Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="Enter rider's full name"
                disabled={loading}
              />
            </div>
            <div style={styles.formGroup}>
              <label htmlFor="mobileNumber" style={styles.label}>
                Mobile Number *
              </label>
              <input
                type="text"
                id="mobileNumber"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="+91xxxxxxxxxx"
                maxLength="13"
                disabled={loading}
              />
            </div>
            <div style={styles.buttonGroup}>
              <button
                type="button"
                style={styles.cancelButton}
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={styles.submitButton}
                disabled={loading}
              >
                Add Rider
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddNewRider;