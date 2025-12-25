import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#0f172a 0%,#1e293b 100%)",
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  main: {
    maxWidth: "1300px",
    margin: "0 auto",
    padding: "48px 32px",
  },
  headerSection: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: "25px",
    gap: "24px",
    flexWrap: "wrap",
  },
  mainTitle: {
    fontSize: "44px",
    color: "#ffffff",
    fontWeight: "800",
    marginBottom: "8px",
    letterSpacing: "-0.03em",
  },
  subtitle: {
    fontSize: "18px",
    color: "#94a3b8",
    fontWeight: 500,
    marginBottom: "2px",
  },
  inputSection: {
    background:
      "linear-gradient(145deg, rgba(30,41,59,0.88) 0%, rgba(15,23,42,0.97) 100%)",
    border: "1.5px solid rgba(148,163,184,0.14)",
    borderRadius: "18px",
    padding: "24px",
    marginBottom: "24px",
  },
  textarea: {
    width: "100%",
    minHeight: "200px",
    padding: "16px",
    background: "rgba(15,23,42,0.8)",
    border: "1px solid rgba(148,163,184,0.2)",
    borderRadius: "12px",
    color: "#eaf4ff",
    fontSize: "14px",
    fontFamily: "monospace",
    resize: "vertical",
  },
  submitBtn: {
    background: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 97%)",
    color: "#fff",
    padding: "12px 32px",
    border: "none",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "16px",
    boxShadow: "0 4px 14px #3b82f658",
    transition: "all 0.2s",
  },
  clearBtn: {
    background: "linear-gradient(90deg, #ef4444 0%, #dc2626 98%)",
    color: "#fff",
    padding: "12px 24px",
    border: "none",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "16px",
    cursor: "pointer",
    marginLeft: "12px",
    marginTop: "16px",
  },
  // Progress Bar Styles
  progressSection: {
    marginTop: "20px",
    padding: "20px",
    background: "rgba(15,23,42,0.6)",
    borderRadius: "12px",
    border: "1px solid rgba(148,163,184,0.2)",
  },
  progressBarContainer: {
    width: "100%",
    height: "12px",
    background: "rgba(15,23,42,0.8)",
    borderRadius: "10px",
    overflow: "hidden",
    border: "1px solid rgba(148,163,184,0.2)",
  },
  progressBarFill: {
    height: "100%",
    background: "linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%)",
    transition: "width 0.3s ease",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(59, 130, 246, 0.5)",
  },
  progressText: {
    marginTop: "12px",
    fontSize: "16px",
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "700",
  },
  progressSubtext: {
    marginTop: "8px",
    fontSize: "14px",
    color: "#94a3b8",
    textAlign: "center",
    fontWeight: "500",
  },
  // Loading Overlay Styles
  loadingOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(15, 23, 42, 0.95)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  spinner: {
    width: "80px",
    height: "80px",
    border: "8px solid rgba(59, 130, 246, 0.2)",
    borderTop: "8px solid #3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    marginTop: "24px",
    fontSize: "24px",
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: "0.05em",
  },
  loadingSubtext: {
    marginTop: "12px",
    fontSize: "16px",
    color: "#94a3b8",
    fontWeight: "500",
  },
  statsRow: {
    display: "flex",
    gap: "16px",
    marginTop: "16px",
    flexWrap: "wrap",
  },
  statCard: {
    flex: 1,
    minWidth: "150px",
    padding: "16px",
    background: "rgba(15,23,42,0.6)",
    borderRadius: "10px",
    border: "1px solid rgba(148,163,184,0.1)",
  },
  statLabel: {
    fontSize: "13px",
    color: "#94a3b8",
    marginBottom: "6px",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#ffffff",
  },
  tableContainer: {
    background:
      "linear-gradient(145deg, rgba(30,41,59,0.88) 0%, rgba(15,23,42,0.97) 100%)",
    border: "1.5px solid rgba(148,163,184,0.14)",
    borderRadius: "18px",
    boxShadow: "0 3px 14px rgba(51,84,124,0.07)",
    overflowX: "auto",
    padding: "18px",
    marginTop: "24px",
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: "0",
    fontSize: "15px",
  },
  th: {
    padding: "18px 12px",
    background: "rgba(23,31,42,0.96)",
    color: "#a7e0ff",
    fontWeight: "700",
    fontSize: "14px",
    borderBottom: "2px solid #213553",
    textAlign: "left",
    letterSpacing: "0.04em",
  },
  td: {
    padding: "16px 12px",
    color: "#eaf4ff",
    borderBottom: "1px solid #203559",
    fontWeight: "500",
    background: "rgba(24,28,44,0.93)",
  },
  successBadge: {
    background: "#22c55e33",
    color: "#22c55e",
    borderRadius: "7px",
    padding: "6px 16px",
    fontWeight: "700",
    fontSize: "14px",
    display: "inline-block",
  },
  failedBadge: {
    background: "#ef444433",
    color: "#ef4444",
    borderRadius: "7px",
    padding: "6px 16px",
    fontWeight: "700",
    fontSize: "14px",
    display: "inline-block",
  },
};

// Add keyframe animation for spinner
const spinnerKeyframes = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

function BulkGIGenerator() {
  const [waybills, setWaybills] = useState("");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentProcessing, setCurrentProcessing] = useState("");
  const [results, setResults] = useState(null);
  const [detailedResults, setDetailedResults] = useState([]);

  const handleSubmit = async () => {
    // Try to parse as JSON array
    let waybillArray = [];

    try {
      // First, try to parse as JSON
      const parsed = JSON.parse(waybills);
      if (Array.isArray(parsed)) {
        waybillArray = parsed
          .map((w) => String(w).trim())
          .filter((w) => w.length > 0);
      } else {
        throw new Error("Not an array");
      }
    } catch (e) {
      // If JSON parsing fails, treat as newline-separated
      waybillArray = waybills
        .split("\n")
        .map((w) => w.trim())
        .filter((w) => w.length > 0);
    }

    if (waybillArray.length === 0) {
      toast.error("Please enter at least one waybill number");
      return;
    }

    setProcessing(true);
    setProgress(0);
    setResults(null);
    setDetailedResults([]);

    const totalCount = waybillArray.length;
    let successCount = 0;
    let failedCount = 0;
    const successResults = [];
    const failedResults = [];

    try {
      // Process each waybill one by one using single-gi API
      for (let i = 0; i < waybillArray.length; i++) {
        const refId = waybillArray[i];
        setCurrentProcessing(refId);

        try {
          const response = await axios.post(
            "http://localhost:5000/api/flow/single-gi",
            { ref_ids: refId },
            {
              headers: { "Content-Type": "application/json" },
            }
          );

          // Success case
          successCount++;
          successResults.push({
            ref_id: refId,
            status: response.status,
            message: response.data.message || "Success",
            data: response.data,
            resultType: "success",
          });

          toast.success(`✅ ${refId} - GI generated successfully`, {
            autoClose: 2000,
          });
        } catch (error) {
          // Failed case
          failedCount++;
          failedResults.push({
            ref_id: refId,
            status: error.response?.status || 500,
            error:
              error.response?.data?.message ||
              error.response?.data?.error ||
              error.message,
            resultType: "failed",
          });

          toast.error(`❌ ${refId} - Failed: ${error.message}`, {
            autoClose: 2000,
          });
        }

        // Update progress
        const progressPercent = Math.round(((i + 1) / totalCount) * 100);
        setProgress(progressPercent);
      }

      // Set final results
      const finalResults = {
        summary: {
          totalCount,
          successCount,
          failedCount,
          successRate: `${((successCount / totalCount) * 100).toFixed(1)}%`,
        },
        results: {
          success: successResults,
          failed: failedResults,
        },
      };

      setResults(finalResults);

      // Combine success and failed results for table display
      const allResults = [...successResults, ...failedResults];
      setDetailedResults(allResults);

      toast.success(
        `🎉 Processing Complete! Success: ${successCount}/${totalCount}`,
        { autoClose: 8000 }
      );
    } catch (error) {
      toast.error("Unexpected error during processing: " + error.message);
      console.error("Bulk GI Error:", error);
    } finally {
      setProcessing(false);
      setCurrentProcessing("");
    }
  };

  const handleClear = () => {
    setWaybills("");
    setResults(null);
    setDetailedResults([]);
    setProgress(0);
    setCurrentProcessing("");
  };

  return (
    <div style={styles.container}>
      <style>{spinnerKeyframes}</style>
      <ToastContainer position="top-right" autoClose={5000} />

      {/* Loading Overlay */}
      {processing && (
        <div style={styles.loadingOverlay}>
          <div style={styles.spinner}></div>
          <div style={styles.loadingText}>Processing Bulk GI...</div>
          <div style={styles.loadingSubtext}>
            Currently processing: {currentProcessing}
          </div>
          <div style={styles.loadingSubtext}>Progress: {progress}%</div>
        </div>
      )}

      <main style={styles.main}>
        <div style={styles.headerSection}>
          <div>
            <h2 style={styles.mainTitle}>Bulk GI Generator</h2>
            <div style={styles.subtitle}>
              Process multiple waybills for Gate In (GI) generation using Single
              GI API
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div style={styles.inputSection}>
          <label
            style={{
              color: "#94a3b8",
              fontSize: "14px",
              fontWeight: "600",
              display: "block",
              marginBottom: "12px",
            }}
          >
            Paste Waybill Array (JSON format or newline-separated):
          </label>
          <textarea
            style={styles.textarea}
            placeholder='["1490822684288383", "37355828075864", "1490822618605563"] or paste one per line'
            value={waybills}
            onChange={(e) => setWaybills(e.target.value)}
            disabled={processing}
          />

          {/* Progress Bar */}
          {processing && (
            <div style={styles.progressSection}>
              <div style={styles.progressBarContainer}>
                <div
                  style={{
                    ...styles.progressBarFill,
                    width: `${progress}%`,
                  }}
                ></div>
              </div>
              <div style={styles.progressText}>{progress}% Complete</div>
              <div style={styles.progressSubtext}>
                Processing: {currentProcessing}
              </div>
            </div>
          )}

          <div>
            <button
              style={{
                ...styles.submitBtn,
                opacity: processing ? 0.6 : 1,
                cursor: processing ? "not-allowed" : "pointer",
              }}
              onClick={handleSubmit}
              disabled={processing}
            >
              {processing ? "Processing..." : "Generate Bulk GI"}
            </button>
            <button
              style={{
                ...styles.clearBtn,
                opacity: processing ? 0.6 : 1,
                cursor: processing ? "not-allowed" : "pointer",
              }}
              onClick={handleClear}
              disabled={processing}
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Results Summary */}
        {results && (
          <div style={styles.inputSection}>
            <div
              style={{
                color: "#fff",
                fontSize: "20px",
                fontWeight: "700",
                marginBottom: "16px",
              }}
            >
              ✅ Processing Complete
            </div>
            <div style={styles.statsRow}>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Total Processed</div>
                <div style={styles.statValue}>{results.summary.totalCount}</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Successful</div>
                <div style={{ ...styles.statValue, color: "#22c55e" }}>
                  {results.summary.successCount}
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Failed</div>
                <div style={{ ...styles.statValue, color: "#ef4444" }}>
                  {results.summary.failedCount}
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Success Rate</div>
                <div style={styles.statValue}>
                  {results.summary.successRate}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Table */}
        {detailedResults.length > 0 && (
          <div style={styles.tableContainer}>
            <div
              style={{
                color: "#fff",
                fontSize: "18px",
                fontWeight: "700",
                marginBottom: "16px",
              }}
            >
              Detailed Results ({detailedResults.length} waybills)
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>Reference ID</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Message/Error</th>
                  <th style={styles.th}>HTTP Status</th>
                </tr>
              </thead>
              <tbody>
                {detailedResults.map((result, i) => (
                  <tr key={i}>
                    <td style={styles.td}>{i + 1}</td>
                    <td style={styles.td}>{result.ref_id}</td>
                    <td style={styles.td}>
                      <span
                        style={
                          result.resultType === "success"
                            ? styles.successBadge
                            : styles.failedBadge
                        }
                      >
                        {result.resultType === "success"
                          ? "✓ Success"
                          : "✗ Failed"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {result.message || result.error || "N/A"}
                    </td>
                    <td style={styles.td}>{result.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default BulkGIGenerator;
