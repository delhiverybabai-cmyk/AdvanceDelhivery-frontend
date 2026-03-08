import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const BASE = process.env.REACT_APP_BASE_URL;

const DENOMS = [500, 200, 100, 50, 20, 10, 5, 2, 1];

export default function CashManagementModal({ isOpen, onClose, dispatch }) {
  const [denominations, setDenominations] = useState({});
  const [online, setOnline] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && dispatch) {
      setDenominations(dispatch.cashDenominations || {});
      setOnline(dispatch.receivedOnline || "");
    }
  }, [isOpen, dispatch]);

  if (!isOpen || !dispatch) return null;

  const handleDenomChange = (d, val) => {
    const num = parseInt(val, 10);
    setDenominations(prev => ({
      ...prev,
      [d]: isNaN(num) ? "" : num
    }));
  };

  const calculatedCash = DENOMS.reduce((acc, d) => acc + (d * (denominations[d] || 0)), 0);
  const onlineNum = parseFloat(online) || 0;
  const totalReceived = calculatedCash + onlineNum;
  const expected = dispatch.expected_cod_amount || 0;
  const diff = totalReceived - expected;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await axios.put(`${BASE}/api/rider-history/cash-manage/${dispatch._id}`, {
        receivedCash: calculatedCash,
        cashDenominations: denominations,
        receivedOnline: onlineNum,
        sortCOD: diff < 0 ? Math.abs(diff) : 0,
      });
      if (res.data.success) {
        toast.success("✅ Cash Details Saved", { autoClose: 2500 });
        onClose();
      } else {
        toast.error("Failed to save cash details");
      }
    } catch (e) {
      console.error(e);
      toast.error("Server error saving cash");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modal}>
        <div style={S.header}>
          <div>
            <h2 style={S.title}>💰 Cash Management</h2>
            <p style={S.sub}>{dispatch.feName} — Dispatch #{dispatch.dispatchId}</p>
          </div>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={S.topStats}>
          <div style={S.statBox}>
            <div style={S.statLbl}>Expected COD</div>
            <div style={S.statVal}>₹{expected}</div>
          </div>
          <div style={S.statBox}>
            <div style={S.statLbl}>Total Received</div>
            <div style={{ ...S.statVal, color: "#34d399" }}>₹{totalReceived}</div>
          </div>
          <div style={{ ...S.statBox, background: diff < 0 ? "rgba(239,68,68,0.1)" : diff > 0 ? "rgba(16,185,129,0.1)" : "rgba(30,41,59,0.5)" }}>
            <div style={S.statLbl}>{diff < 0 ? "Shortage" : diff > 0 ? "Excess" : "Difference"}</div>
            <div style={{ ...S.statVal, color: diff < 0 ? "#f87171" : diff > 0 ? "#10b981" : "#94a3b8" }}>
              {diff > 0 ? "+" : ""}₹{diff}
            </div>
          </div>
        </div>

        <div style={S.bodyRow}>
          {/* Left col: Denominations */}
          <div style={S.leftCol}>
            <div style={S.sectionTitle}>💵 Cash Denominations</div>
            <div style={S.denomGrid}>
              {DENOMS.map(d => (
                <div key={d} style={S.denomRow}>
                  <div style={S.denomLbl}>₹{d}</div>
                  <div style={S.denomX}>×</div>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    style={S.denomInput}
                    value={denominations[d] === 0 ? "" : (denominations[d] || "")}
                    onChange={e => handleDenomChange(d, e.target.value)}
                  />
                  <div style={S.denomEq}>=</div>
                  <div style={S.denomVal}>₹{d * (denominations[d] || 0)}</div>
                </div>
              ))}
            </div>
            <div style={S.cashTotal}>
              Cash Total: <span style={{ color: "#34d399" }}>₹{calculatedCash}</span>
            </div>
          </div>

          {/* Right col: Online & Sort */}
          <div style={S.rightCol}>
            <div style={S.sectionTitle}>📱 Online Payment</div>
            <div style={S.inputRow}>
              <span style={S.inputPrefix}>₹</span>
              <input
                type="number"
                min="0"
                placeholder="0.00"
                style={S.largeInput}
                value={online}
                onChange={e => setOnline(e.target.value)}
              />
            </div>

            <div style={S.spacer}></div>
          </div>
        </div>

        <div style={S.footer}>
          <button style={S.cancelBtn} onClick={onClose}>Cancel</button>
          <button
            style={{ ...S.submitBtn, opacity: submitting ? 0.7 : 1 }}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Saving…" : "Save Cash"}
          </button>
        </div>
      </div>
    </div>
  );
}

const S = {
  overlay: {
    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
    background: "rgba(15,23,42,0.88)", backdropFilter: "blur(6px)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
  },
  modal: {
    background: "linear-gradient(145deg, rgba(22,32,52,0.99) 0%, rgba(15,23,42,0.99) 100%)",
    border: "1.5px solid rgba(148,163,184,0.16)", borderRadius: "22px",
    padding: "24px", width: "700px", maxWidth: "95vw", maxHeight: "90vh",
    display: "flex", flexDirection: "column", gap: "20px",
    boxShadow: "0 28px 70px rgba(0,0,0,0.55)", fontFamily: "'Inter','Segoe UI',sans-serif",
    overflowY: "auto",
  },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  title:  { margin: 0, fontSize: "21px", fontWeight: 800, color: "#fff" },
  sub:    { margin: "5px 0 0", fontSize: "13px", color: "#94a3b8" },
  closeBtn: {
    background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
    color: "#fca5a5", borderRadius: "8px", padding: "6px 13px",
    fontSize: "15px", cursor: "pointer", fontWeight: 700, flexShrink: 0,
  },
  
  topStats: {
    display: "flex", gap: "12px", background: "rgba(15,23,42,0.4)",
    padding: "14px", borderRadius: "14px", border: "1px solid rgba(148,163,184,0.1)"
  },
  statBox: { flex: 1, padding: "12px 16px", borderRadius: "10px", background: "rgba(30,41,59,0.5)", border: "1px solid rgba(148,163,184,0.08)" },
  statLbl: { fontSize: "12px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" },
  statVal: { fontSize: "20px", color: "#f8fafc", fontWeight: 800, fontFamily: "monospace" },

  bodyRow: { display: "flex", gap: "24px" },
  leftCol: { flex: 1.1 },
  rightCol: { flex: 0.9, display: "flex", flexDirection: "column" },

  sectionTitle: { fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "16px", letterSpacing: "0.3px" },

  denomGrid: { display: "flex", flexDirection: "column", gap: "8px" },
  denomRow: { display: "flex", alignItems: "center", background: "rgba(30,41,59,0.4)", padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(148,163,184,0.08)" },
  denomLbl: { width: "50px", color: "#94a3b8", fontWeight: 700, fontSize: "13px" },
  denomX: { width: "20px", color: "#475569", textAlign: "center", fontSize: "12px" },
  denomInput: { width: "70px", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(148,163,184,0.2)", borderRadius: "6px", color: "#fff", padding: "6px 10px", outline: "none", fontSize: "13px", fontWeight: 600, textAlign: "right" },
  denomEq: { width: "24px", color: "#475569", textAlign: "center", fontSize: "12px" },
  denomVal: { flex: 1, textAlign: "right", color: "#e2e8f0", fontWeight: 700, fontSize: "13px", fontFamily: "monospace" },

  cashTotal: { marginTop: "12px", padding: "12px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "10px", color: "#94a3b8", fontWeight: 700, fontSize: "14px", textAlign: "right" },

  inputRow: { display: "flex", alignItems: "center", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(148,163,184,0.2)", borderRadius: "10px", padding: "2px", overflow: "hidden" },
  inputPrefix: { padding: "0 16px", color: "#94a3b8", fontWeight: 700, fontSize: "18px" },
  largeInput: { flex: 1, background: "transparent", border: "none", color: "#fff", fontSize: "20px", fontWeight: 700, padding: "14px 14px 14px 0", outline: "none", fontFamily: "monospace" },

  spacer: { height: "32px" },

  checkboxLabel: { display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", background: "rgba(30,41,59,0.5)", padding: "14px", borderRadius: "10px", border: "1px solid rgba(148,163,184,0.1)" },
  checkbox: { width: "18px", height: "18px", accentColor: "#8b5cf6" },
  checkboxText: { color: "#e2e8f0", fontWeight: 600, fontSize: "14px" },
  helpText: { marginTop: "8px", fontSize: "12px", color: "#64748b", lineHeight: "1.4" },

  footer: { display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px", paddingTop: "20px", borderTop: "1px solid rgba(148,163,184,0.1)" },
  cancelBtn: { padding: "10px 20px", background: "rgba(100,116,139,0.15)", border: "1px solid rgba(100,116,139,0.3)", color: "#94a3b8", borderRadius: "10px", fontSize: "13px", fontWeight: 700, cursor: "pointer" },
  submitBtn: { padding: "10px 24px", background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)", border: "none", color: "#fff", borderRadius: "10px", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(139,92,246,0.3)" },
};
