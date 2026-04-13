import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";

const BASE = process.env.REACT_APP_BASE_URL;

const styles = {
  root: {
    minHeight: "100vh",
    width: "100vw",
    background: "#0a0a0a", // Pure dark black
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: '"Inter", -apple-system, system-ui, sans-serif',
  },
  nav: {
    width: "100%",
    padding: "1.25rem 2.5rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "rgba(0,0,0,0.8)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid #262626",
    zIndex: 10,
  },
  card: {
    background: "#111", // Slightly lighter black for the card
    borderRadius: "12px",
    border: "1px solid #262626",
    padding: "48px",
    width: "100%",
    maxWidth: "540px",
    marginTop: "80px",
    display: "flex",
    flexDirection: "column",
    gap: "32px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#fff",
    margin: "0 0 8px 0",
    letterSpacing: "-0.03em",
  },
  subtitle: {
    color: "#737373",
    fontSize: "14px",
    margin: 0,
    lineHeight: "1.5",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  label: {
    color: "#a3a3a3",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  textarea: {
    width: "100%",
    background: "#000",
    border: "1px solid #262626",
    borderRadius: "8px",
    padding: "16px",
    color: "#fff",
    fontSize: "14px",
    fontFamily: '"Fira Code", monospace',
    minHeight: "160px",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    resize: "none",
  },
  textareaFocused: {
    borderColor: "#525252",
    boxShadow: "0 0 0 2px rgba(255,255,255,0.05)",
  },
  button: {
    background: "#fff",
    color: "#000",
    border: "none",
    borderRadius: "8px",
    padding: "14px",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
    transition: "background 0.2s, transform 0.1s",
    textTransform: "uppercase",
    letterSpacing: "0.02em",
  },
  buttonHover: {
    background: "#e5e5e5",
  },
  backLink: {
    color: "#fff",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    opacity: 0.7,
    transition: "opacity 0.2s",
  },
  helpBox: {
    padding: "16px",
    background: "#171717",
    borderRadius: "8px",
    border: "1px solid #262626",
  }
};

const ShadowTokenManagement = () => {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await axios.get(`${BASE}/shadow/token`);
        if (response.data.token) {
          setToken(response.data.token);
        }
      } catch (err) {
        console.error("Error fetching shadow token:", err);
      }
    };
    fetchToken();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!token.trim()) {
      toast.warning("Token input is empty");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${BASE}/shadow/token`, { token });
      toast.success("Configuration Updated");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      toast.error("Update Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      <ToastContainer position="bottom-center" theme="dark" />
      
      <nav style={styles.nav}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: 8, height: 8, background: "#fff", borderRadius: "50%" }}></div>
          <span style={{ color: "#fff", fontWeight: "700", fontSize: "14px", letterSpacing: "0.05em", textTransform: "uppercase" }}>Auth Engine</span>
        </div>
        <Link 
          to="/" 
          style={styles.backLink}
          onMouseOver={e => e.currentTarget.style.opacity = 1}
          onMouseOut={e => e.currentTarget.style.opacity = 0.7}
        >
          ← Dashboard
        </Link>
      </nav>

      <div style={styles.card}>
        <header>
          <h1 style={styles.title}>Access Configuration</h1>
          <p style={styles.subtitle}>Modify the scraping authorization parameters for Shadowfax Integration.</p>
        </header>

        <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={styles.formGroup}>
            <label style={styles.label}>JWT Token (Authorization)</label>
            <textarea
              style={{
                ...styles.textarea,
                ...(isFocused ? styles.textareaFocused : {}),
              }}
              placeholder="Paste JWT here..."
              value={token}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => setToken(e.target.value)}
              disabled={loading}
              spellCheck="false"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseDown={e => e.currentTarget.style.transform = "scale(0.98)"}
            onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
            style={{
              ...styles.button,
              ...(isHovered ? styles.buttonHover : {}),
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Synchronizing..." : "Update Secrets"}
          </button>
        </form>

        <div style={styles.helpBox}>
          <p style={{ color: "#737373", fontSize: "12px", margin: 0, fontWeight: "500" }}>
            <span style={{ color: "#fff", marginRight: "6px" }}>INFO:</span>
            Ensure the token is properly prefixed with its required scheme if applicable.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShadowTokenManagement;
