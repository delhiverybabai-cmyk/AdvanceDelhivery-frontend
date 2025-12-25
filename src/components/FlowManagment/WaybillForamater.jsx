import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const styles = {
  root: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    padding: "48px 24px",
  },
  container: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  header: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#f4fae3",
    marginBottom: "12px",
    letterSpacing: "-0.03em",
  },
  subtitle: {
    fontSize: "16px",
    color: "#94a3b8",
    marginBottom: "32px",
  },
  card: {
    background: "rgba(30, 41, 59, 0.95)",
    borderRadius: "16px",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    padding: "32px",
    marginBottom: "24px",
  },
  label: {
    display: "block",
    color: "#e2e8f0",
    fontWeight: "600",
    fontSize: "15px",
    marginBottom: "10px",
  },
  textarea: {
    width: "100%",
    minHeight: "200px",
    padding: "16px",
    borderRadius: "10px",
    border: "1.5px solid rgba(148, 163, 184, 0.3)",
    background: "rgba(15, 23, 42, 0.7)",
    color: "#fff",
    fontSize: "15px",
    fontFamily: "monospace",
    outline: "none",
    resize: "vertical",
    transition: "border 0.2s",
  },
  textareaFocus: {
    borderColor: "#22d487",
    boxShadow: "0 0 0 3px rgba(34, 212, 135, 0.1)",
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
    marginTop: "20px",
  },
  button: {
    padding: "12px 28px",
    borderRadius: "10px",
    border: "none",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  primaryButton: {
    background: "linear-gradient(135deg, #22d487 0%, #10b981 100%)",
    color: "#fff",
    boxShadow: "0 4px 14px rgba(34, 212, 135, 0.4)",
  },
  secondaryButton: {
    background: "rgba(148, 163, 184, 0.2)",
    color: "#e2e8f0",
    border: "1px solid rgba(148, 163, 184, 0.3)",
  },
  copyButton: {
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "#fff",
    boxShadow: "0 4px 14px rgba(59, 130, 246, 0.4)",
  },
  resultSection: {
    marginTop: "20px",
  },
  resultLabel: {
    color: "#22d487",
    fontWeight: "700",
    fontSize: "16px",
    marginBottom: "10px",
    display: "block",
  },
  resultBox: {
    background: "rgba(15, 23, 42, 0.9)",
    border: "1.5px solid rgba(34, 212, 135, 0.3)",
    borderRadius: "10px",
    padding: "16px",
    color: "#e2e8f0",
    fontFamily: "monospace",
    fontSize: "14px",
    wordBreak: "break-all",
    maxHeight: "300px",
    overflowY: "auto",
  },
  exampleSection: {
    background: "rgba(59, 130, 246, 0.1)",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "24px",
  },
  exampleTitle: {
    color: "#60a5fa",
    fontWeight: "700",
    fontSize: "15px",
    marginBottom: "12px",
  },
  exampleItem: {
    color: "#cbd5e1",
    fontSize: "13px",
    marginBottom: "8px",
    fontFamily: "monospace",
    padding: "8px",
    background: "rgba(15, 23, 42, 0.5)",
    borderRadius: "6px",
  },
  stats: {
    display: "flex",
    gap: "16px",
    marginTop: "16px",
  },
  stat: {
    background: "rgba(34, 212, 135, 0.1)",
    border: "1px solid rgba(34, 212, 135, 0.3)",
    borderRadius: "8px",
    padding: "12px 16px",
    color: "#22d487",
    fontWeight: "600",
    fontSize: "14px",
  },
};

const WaybillForamater = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [focusInput, setFocusInput] = useState("");
  const [uniqueCount, setUniqueCount] = useState(0);

  // ✅ Extract waybills from various formats
  const extractWaybills = (text) => {
    if (!text.trim()) return [];

    // Remove markdown link format: [text](url) -> extract text
    let cleaned = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

    // Extract all alphanumeric sequences (waybills)
    const waybillPattern = /[a-zA-Z0-9]{10,}/g;
    const matches = cleaned.match(waybillPattern) || [];

    // Remove duplicates and return unique waybills
    return [...new Set(matches)];
  };

  const handleFormat = () => {
    if (!input.trim()) {
      toast.error("Please enter waybills to format");
      return;
    }

    const waybills = extractWaybills(input);

    if (waybills.length === 0) {
      toast.error("No valid waybills found");
      return;
    }

    const formattedOutput = JSON.stringify(waybills, null, 2);
    setOutput(formattedOutput);
    setUniqueCount(waybills.length);
    toast.success(`✅ Formatted ${waybills.length} unique waybills`);
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setUniqueCount(0);
    toast.info("Cleared all fields");
  };

  const handleCopy = () => {
    if (!output) {
      toast.error("Nothing to copy");
      return;
    }
    navigator.clipboard.writeText(output);
    toast.success("✅ Copied to clipboard!");
  };

  return (
    <div style={styles.root}>
      <ToastContainer position="top-right" autoClose={3000} />
      <div style={styles.container}>
        <h1 style={styles.header}>Waybill String Formatter</h1>
        <div style={styles.subtitle}>
          Extract and format waybills from various input formats into clean JSON
          array
        </div>

        {/* Examples Section */}
        <div style={styles.exampleSection}>
          <div style={styles.exampleTitle}>📋 Supported Formats:</div>
          <div style={styles.exampleItem}>
            Example 1:
            8962322640353,8962322640353,[18107785060241](https://hq.delhivery.com/p/18107785060241)
          </div>
          <div style={styles.exampleItem}>
            Example 2:
            [18107785060241](https://hq.delhivery.com/p/18107785060241)
            8962322640353
          </div>
          <div style={styles.exampleItem}>
            Example 3: [8962322640353 ,
            [18107785060241](https://hq.delhivery.com/p/18107785060241)]
          </div>
        </div>

        {/* Input Section */}
        <div style={styles.card}>
          <label style={styles.label}>Input Waybills (Any Format)</label>
          <textarea
            style={{
              ...styles.textarea,
              ...(focusInput === "input" ? styles.textareaFocus : {}),
            }}
            placeholder="Paste your waybills here in any format..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setFocusInput("input")}
            onBlur={() => setFocusInput("")}
          />
          <div style={styles.buttonGroup}>
            <button
              style={{ ...styles.button, ...styles.primaryButton }}
              onClick={handleFormat}
            >
              🔄 Format Waybills
            </button>
            <button
              style={{ ...styles.button, ...styles.secondaryButton }}
              onClick={handleClear}
            >
              🗑️ Clear
            </button>
          </div>
        </div>

        {/* Output Section */}
        {output && (
          <div style={styles.card}>
            <div style={styles.resultSection}>
              <label style={styles.resultLabel}>
                ✅ Formatted Output (JSON Array)
              </label>
              <div style={styles.resultBox}>{output}</div>
              <div style={styles.stats}>
                <div style={styles.stat}>📊 Unique Waybills: {uniqueCount}</div>
              </div>
              <div style={styles.buttonGroup}>
                <button
                  style={{ ...styles.button, ...styles.copyButton }}
                  onClick={handleCopy}
                >
                  📋 Copy to Clipboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaybillForamater;
