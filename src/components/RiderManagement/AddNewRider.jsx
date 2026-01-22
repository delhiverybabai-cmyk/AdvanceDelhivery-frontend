import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddNewRider = () => {
  const [formData, setFormData] = useState({
    name: "",
    mobileNumbers: [""], // Array to store multiple numbers
    feEmployeeId: "",
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
    mobileNumberRow: {
      display: "flex",
      gap: "12px",
      alignItems: "center",
      marginBottom: "12px",
    },
    mobileInput: {
      flex: 1,
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
    addButton: {
      padding: "14px 20px",
      fontSize: "14px",
      fontWeight: "600",
      color: "#baed4dff",
      background: "rgba(186,237,77,0.1)",
      border: "1px solid rgba(186,237,77,0.3)",
      borderRadius: "10px",
      cursor: "pointer",
      whiteSpace: "nowrap",
    },
    removeButton: {
      padding: "14px 20px",
      fontSize: "14px",
      fontWeight: "600",
      color: "#ef4444",
      background: "rgba(239,68,68,0.1)",
      border: "1px solid rgba(239,68,68,0.3)",
      borderRadius: "10px",
      cursor: "pointer",
      whiteSpace: "nowrap",
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
    helperText: {
      fontSize: "12px",
      color: "#94a3b8",
      marginTop: "6px",
      fontStyle: "italic",
    },
  };

  function validateInputs() {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return false;
    }
    if (formData.name.trim().length < 2) {
      toast.error("Name must be at least 2 characters long");
      return false;
    }

    // Validate at least one mobile number
    const validNumbers = formData.mobileNumbers.filter(
      (num) => num.trim() !== ""
    );
    if (validNumbers.length === 0) {
      toast.error("At least one mobile number is required");
      return false;
    }

    // Validate each mobile number format
    for (let i = 0; i < validNumbers.length; i++) {
      if (!/^\+91\d{10}$/.test(validNumbers[i].trim())) {
        toast.error(
          `Mobile number ${i + 1} is invalid. Use format: +91xxxxxxxxxx`
        );
        return false;
      }
    }

    // Check for duplicate mobile numbers
    const uniqueNumbers = new Set(validNumbers.map((n) => n.trim()));
    if (uniqueNumbers.size !== validNumbers.length) {
      toast.error("Duplicate mobile numbers are not allowed");
      return false;
    }

    // FE Employee ID is optional but validate format if provided
    if (
      formData.feEmployeeId.trim() &&
      formData.feEmployeeId.trim().length < 3
    ) {
      toast.error("FE Employee ID must be at least 3 characters");
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

  const handleMobileNumberChange = (index, value) => {
    const updatedNumbers = [...formData.mobileNumbers];
    updatedNumbers[index] = value;
    setFormData((prev) => ({
      ...prev,
      mobileNumbers: updatedNumbers,
    }));
    if (success) setSuccess(false);
  };

  const addMobileNumber = () => {
    if (formData.mobileNumbers.length >= 5) {
      toast.warning("Maximum 5 mobile numbers allowed");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      mobileNumbers: [...prev.mobileNumbers, ""],
    }));
  };

  const removeMobileNumber = (index) => {
    if (formData.mobileNumbers.length === 1) {
      toast.warning("At least one mobile number field is required");
      return;
    }
    const updatedNumbers = formData.mobileNumbers.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      mobileNumbers: updatedNumbers,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;
    setLoading(true);

    try {
      // Filter out empty mobile numbers and trim
      const validMobileNumbers = formData.mobileNumbers
        .filter((num) => num.trim() !== "")
        .map((num) => num.trim());

      const payload = {
        name: formData.name.trim(),
        mobileNumber: validMobileNumbers, // Send as array
      };

      // Only include feEmployeeId if provided
      if (formData.feEmployeeId.trim()) {
        payload.feEmployeeId = formData.feEmployeeId.trim();
      }

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/rider/create-rider`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setLoading(false);
      setSuccess(true);
      setFormData({ name: "", mobileNumbers: [""], feEmployeeId: "" });
      toast.success("Rider added successfully!");
    } catch (error) {
      setLoading(false);
      if (error.response?.status === 409) {
        toast.error(
          "A rider with this mobile number or FE Employee ID already exists"
        );
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Failed to add rider. Please try again.");
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", mobileNumbers: [""], feEmployeeId: "" });
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
              <label style={styles.label}>Mobile Numbers *</label>
              {formData.mobileNumbers.map((number, index) => (
                <div key={index} style={styles.mobileNumberRow}>
                  <input
                    type="text"
                    value={number}
                    onChange={(e) =>
                      handleMobileNumberChange(index, e.target.value)
                    }
                    style={styles.mobileInput}
                    placeholder="+91xxxxxxxxxx"
                    maxLength="13"
                    disabled={loading}
                  />
                  {formData.mobileNumbers.length > 1 && (
                    <button
                      type="button"
                      style={styles.removeButton}
                      onClick={() => removeMobileNumber(index)}
                      disabled={loading}
                    >
                      Remove
                    </button>
                  )}
                  {index === formData.mobileNumbers.length - 1 &&
                    formData.mobileNumbers.length < 5 && (
                      <button
                        type="button"
                        style={styles.addButton}
                        onClick={addMobileNumber}
                        disabled={loading}
                      >
                        + Add
                      </button>
                    )}
                </div>
              ))}
              <div style={styles.helperText}>
                Add up to 5 mobile numbers for this rider
              </div>
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="feEmployeeId" style={styles.label}>
                FE Employee ID
              </label>
              <input
                type="text"
                id="feEmployeeId"
                name="feEmployeeId"
                value={formData.feEmployeeId}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="Enter employee ID (optional)"
                disabled={loading}
              />
              <div style={styles.helperText}>
                Optional: Unique Field Executive employee identifier
              </div>
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
                style={{
                  ...styles.submitButton,
                  ...(loading ? styles.submitButtonDisabled : {}),
                }}
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Rider"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddNewRider;
