import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#0f172a 0%,#1e293b 100%)",
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    padding: "48px 32px",
    color: "#fff",
    maxWidth: "900px",
    margin: "0 auto",
    borderRadius: "16px",
  },
  section: {
    background: "rgba(15, 23, 42, 0.8)",
    marginBottom: "24px",
    borderRadius: "14px",
    padding: "24px",
    boxShadow: "0 1px 11px rgba(20, 40, 60, 0.25)",
  },
  sectionTitle: {
    fontSize: "22px",
    fontWeight: "700",
    marginBottom: "16px",
    borderBottom: "2px solid #3ba231",
    paddingBottom: "6px",
  },
  list: {
    maxHeight: "160px",
    overflowY: "auto",
    backgroundColor: "#112233",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "15px",
    color: "#acd4b2",
    lineHeight: "1.5em",
  },
  inputGroup: {
    display: "flex",
    alignItems: "center",
    marginBottom: "24px",
    gap: "14px",
  },
  label: {
    minWidth: "120px",
    fontWeight: "600",
    fontSize: "16px",
  },
  input: {
    flexGrow: 1,
    padding: "10px 14px",
    fontSize: "16px",
    borderRadius: "10px",
    border: "1.5px solid #4caf50",
    outline: "none",
    backgroundColor: "#123322",
    color: "#e1f3d1",
  },
  button: {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    padding: "14px 36px",
    fontWeight: "700",
    fontSize: "16px",
    borderRadius: "12px",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 10px 30px rgba(16, 185, 129, 0.3)",
    marginRight: "20px",
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
    boxShadow: "none",
  },
  buttonsRow: {
    display: "flex",
    justifyContent: "flex-end",
  },
};

const DispatchDetail = () => {
  const location = useLocation();
  const dispatchData = location.state?.dispatchData || {};

  const [amount, setAmount] = useState("");
  const [scanDone, setScanDone] = useState(false);
  const [scanning, setScanning] = useState(false);

  const undeliveredWaybills =
    [
      ...dispatchData.responses?.undelivered,
      ...dispatchData.responses?.pickup,
    ] || [];

  const handleCopy = async (dispatch_id) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/dispatch/dispatch-details/${dispatch_id}`,
        {},
        { headers: { "Content-Type": "application/json" } }
      );
      await navigator.clipboard.writeText(
        JSON.stringify(response.data, null, 2)
      );
      toast.success("Dispatch details copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy dispatch details.");
      console.error("Failed to copy dispatch details.", error);
    }
  };

  const scanUndelivered = async () => {
    if (undeliveredWaybills.length === 0) {
      toast.info("No undelivered waybills to scan.");
      return;
    }
    setScanning(true);
    try {
      handleCopy(dispatchData.dispatch_id);
      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/api/dispatch/scan-undelivered/${dispatchData.dispatch_id}`,
        { waybills: undeliveredWaybills },
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.data.success) {
        toast.success("Undelivered packages scanned successfully!");
        setScanDone(true);
      } else {
        toast.error("Failed to scan undelivered packages.");
      }
    } catch (error) {
      toast.error("Error contacting server for undelivered scan.");
      console.error(error);
    } finally {
      setScanning(false);
    }
  };

  const createRecord = () => {
    if (!amount.trim()) {
      toast.error("Please enter an amount.");
      return;
    }
    // Implement create record logic here
    toast.success(`Record created with amount ₹${amount}`);
  };

  return (
    <div style={styles.container}>
      <ToastContainer position="top-right" autoClose={4000} />
      <h1 style={{ ...styles.mainTitle, marginBottom: "26px" }}>
        Dispatch Details - {dispatchData.dispatch_id ?? "N/A"}
      </h1>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Response Summary</div>
        <div>
          <b>Total Packages:</b> {dispatchData.totalPackages ?? "-"}
          <br />
          <b>Delivered: </b> {dispatchData.count?.deliveredCount ?? "-"}
          <br />
          <b>Undelivered: </b> {dispatchData.count?.undeliveredCount ?? "-"}
          <br />
          <b>Pickup: </b> {dispatchData.count?.pickupCount ?? "-"}
          <br />
          <b>Pickup Not Completed: </b>{" "}
          {dispatchData.count?.pickupNotCompletedCount ?? "-"}
          <br />
          <b>Other: </b> {dispatchData.count?.otherCount ?? "-"}
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Undelivered Waybills</div>
        <div style={styles.list}>
          {undeliveredWaybills.length === 0
            ? "No undelivered waybills."
            : undeliveredWaybills.map((wb, i) => <div key={i}>{wb}</div>)}
        </div>
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label} htmlFor="amountInput">
          Enter Amount (₹):
        </label>
        <input
          id="amountInput"
          type="number"
          min="0"
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={styles.input}
          placeholder="Amount"
        />
      </div>

      <div style={styles.buttonsRow}>
        <button
          style={{
            ...styles.button,
            ...(scanning ? styles.buttonDisabled : {}),
          }}
          onClick={scanUndelivered}
          disabled={scanning || undeliveredWaybills.length === 0}
        >
          {scanning ? "Scanning..." : "Scan Undelivered"}
        </button>

        <button
          style={{
            ...styles.button,
            ...(!(scanDone && amount.trim() !== "")
              ? styles.buttonDisabled
              : {}),
          }}
          disabled={!scanDone || amount.trim() === ""}
          onClick={createRecord}
        >
          Create Record
        </button>
      </div>
    </div>
  );
};

export default DispatchDetail;
