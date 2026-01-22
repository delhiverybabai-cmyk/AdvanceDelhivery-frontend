import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const styles = {
  root: {
    minHeight: "100vh",
    width: "100vw",
    background: "linear-gradient(135deg, #151d2b 0%, #232b40 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    background: "rgba(26,33,52,0.98)",
    borderRadius: "18px",
    boxShadow: "0 6px 28px rgba(23,32,54,0.16)",
    padding: "40px 34px",
    width: "100%",
    maxWidth: 500,
    minHeight: 480,
    display: "flex",
    flexDirection: "column",
    gap: "28px",
  },
  sectionTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#e9ff8b",
    marginBottom: "9px",
    background: "linear-gradient(90deg, #34d399 30%, #e9ff8b 100%)",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  formGroup: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    color: "#ecffcd",
    marginBottom: "6px",
    fontWeight: "600",
    fontSize: "15px",
    letterSpacing: "0.01em",
  },
  input: {
    width: "100%",
    fontSize: "15px",
    padding: "11px 12px",
    borderRadius: "8px",
    border: "1.5px solid #41597d",
    background: "#222c41",
    color: "#e0f7ff",
    fontWeight: "500",
    outline: "none",
    marginBottom: "2px",
    transition: "border 0.2s",
  },
  inputFocused: {
    border: "1.6px solid #95fb8a",
    background: "#172138",
  },
  button: {
    background: "linear-gradient(90deg, #39d161 0%, #1782f2 100%)",
    color: "#fff",
    fontWeight: "700",
    padding: "12px 28px",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    cursor: "pointer",
    marginRight: "10px",
    marginTop: "3px",
    boxShadow: "0 2px 12px #25a5e055",
    transition: "background 0.13s, box-shadow 0.13s",
  },
  buttonAlt: {
    background: "#364e69",
    color: "#fff",
  },
  orBar: {
    textAlign: "center",
    color: "#b5ebb2",
    fontWeight: "600",
    margin: "17px 0 3px 0",
    fontSize: "16px",
  },
};

export default function TokenManagement() {
  const [token, setToken] = useState("");
  const [cookieToken, setCookieToken] = useState(""); // ✅ Manual cookie token input
  const [number, setNumber] = useState("+916262613168");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusField, setFocusField] = useState("");

  const handleTokenUpdate = async (e) => {
    e.preventDefault();
    if (!token.trim()) {
      toast.error("Please enter a token value.");
      return;
    }
    setIsLoading(true);
    try {
      const resp = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/api/dispatch/token-update`,
        {
          token,
          cookieToken: cookieToken.trim() || undefined, // ✅ Send cookieToken if provided
        },
        { headers: { "Content-Type": "application/json" } }
      );
      if (resp.data?.success) {
        toast.success("Token updated successfully.");
        setToken("");
        setCookieToken("");
      } else {
        toast.error("Token update failed.");
      }
    } catch (err) {
      toast.error(
        "API Error: " +
          (err?.response?.data?.message || "Unable to update token.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!number.trim()) {
      toast.error("Mobile number required");
      return;
    }
    setIsLoading(true);
    try {
      const resp = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/auth/send-otp`,
        {
          number,
          cookieToken: cookieToken.trim() || undefined, // ✅ Send cookieToken if provided
        },
        { headers: { "Content-Type": "application/json" } }
      );
      if (
        resp.data?.success ||
        resp.data?.message?.toLowerCase().includes("sent")
      ) {
        toast.success("OTP sent to " + number);
      } else {
        toast.error("Failed to send OTP.");
      }
    } catch (err) {
      toast.error("API Error: Failed to send OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpLogin = async () => {
    if (!otp.trim()) {
      toast.error("OTP is required.");
      return;
    }
    setIsLoading(true);
    try {
      const resp = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/auth/auth-otp-login`,
        {
          number,
          otp,
          cookieToken: cookieToken.trim() || undefined, // ✅ Send cookieToken if provided
        },
        { headers: { "Content-Type": "application/json" } }
      );
      if (resp.data?.token || resp.data?.success) {
        toast.success("OTP verified! Token received.");
        setOtp("");
      } else {
        toast.error("OTP verification failed.");
      }
    } catch (err) {
      toast.error("API Error: OTP verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      <ToastContainer position="top-right" autoClose={4000} />
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Manual Token Update</h2>
        <form onSubmit={handleTokenUpdate} autoComplete="off">
          <div style={styles.formGroup}>
            <label style={styles.label}>Token</label>
            <input
              style={{
                ...styles.input,
                ...(focusField === "token" ? styles.inputFocused : {}),
              }}
              type="text"
              placeholder="Enter JWT token"
              value={token}
              onFocus={() => setFocusField("token")}
              onBlur={() => setFocusField("")}
              onChange={(e) => setToken(e.target.value)}
              spellCheck="false"
              disabled={isLoading}
            />
          </div>
          {/* ✅ NEW: Cookie Token Input */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Cookie Token (Optional)</label>
            <input
              style={{
                ...styles.input,
                ...(focusField === "cookieToken" ? styles.inputFocused : {}),
              }}
              type="text"
              placeholder="Enter cookie token (optional)"
              value={cookieToken}
              onFocus={() => setFocusField("cookieToken")}
              onBlur={() => setFocusField("")}
              onChange={(e) => setCookieToken(e.target.value)}
              spellCheck="false"
              disabled={isLoading}
            />
          </div>
          <button
            style={styles.button}
            disabled={isLoading || !token.trim()}
            type="submit"
          >
            {isLoading ? "Updating..." : "Update Token"}
          </button>
        </form>
        <div style={styles.orBar}>OR</div>
        <h2 style={styles.sectionTitle}>OTP Login</h2>
        <div style={styles.formGroup}>
          <label style={styles.label}>Mobile Number</label>
          <input
            style={{
              ...styles.input,
              ...(focusField === "number" ? styles.inputFocused : {}),
            }}
            type="text"
            placeholder="+91XXXXXXXXXX"
            value={number}
            onFocus={() => setFocusField("number")}
            onBlur={() => setFocusField("")}
            onChange={(e) => setNumber(e.target.value)}
            spellCheck="false"
            disabled={isLoading}
          />
        </div>
        <button
          style={{ ...styles.button, ...styles.buttonAlt }}
          onClick={handleSendOtp}
          disabled={isLoading}
          type="button"
        >
          {isLoading ? "Sending..." : "Send OTP"}
        </button>
        <div style={styles.formGroup}>
          <label style={styles.label}>Enter OTP</label>
          <input
            style={{
              ...styles.input,
              ...(focusField === "otp" ? styles.inputFocused : {}),
            }}
            type="text"
            placeholder="Enter OTP"
            maxLength={10}
            value={otp}
            onFocus={() => setFocusField("otp")}
            onBlur={() => setFocusField("")}
            onChange={(e) => setOtp(e.target.value)}
            spellCheck="false"
            disabled={isLoading}
          />
        </div>
        <button
          style={{ ...styles.button, ...styles.buttonAlt }}
          onClick={handleOtpLogin}
          disabled={isLoading}
          type="button"
        >
          {isLoading ? "Verifying..." : "Submit OTP"}
        </button>
      </div>
    </div>
  );
}
