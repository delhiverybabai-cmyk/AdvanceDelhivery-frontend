import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const BASE = process.env.REACT_APP_BASE_URL;

export default function CompleteCashModal({ isOpen, onClose, dispatch }) {
  const [createSortCOD, setCreateSortCOD] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !dispatch) return null;

  const expected = dispatch.expected_cod_amount || 0;
  const receivedCash = dispatch.receivedCash || 0;
  const receivedOnline = dispatch.receivedOnline || 0;
  const totalReceived = receivedCash + receivedOnline;
  const diff = totalReceived - expected;
  const isShortage = diff < 0;
  const shortageAmount = isShortage ? Math.abs(diff) : 0;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await axios.post(`${BASE}/api/rider-history/cash-complete/${dispatch._id}`, {
        sortCOD: createSortCOD ? shortageAmount : 0,
      });
      if (res.data.success) {
        toast.success("✅ Cash Finalized & Dispatch Completed", { autoClose: 2500 });
        onClose();
      } else {
        toast.error("Failed to complete cash");
      }
    } catch (e) {
      console.error(e);
      toast.error("Server error completing cash");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modal}>
        <div style={S.header}>
          <div>
            <h2 style={S.title}>✅ Complete Cash Management</h2>
            <p style={S.sub}>{dispatch.feName} — Dispatch #{dispatch.dispatchId}</p>
          </div>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={S.summaryBox}>
          <div style={S.row}>
            <span style={S.lbl}>Expected COD</span>
            <span style={S.val}>₹{expected}</span>
          </div>
          <div style={S.divider} />
          <div style={S.row}>
            <span style={S.lbl}>Received Cash</span>
            <span style={{...S.val, color: "#34d399"}}>₹{receivedCash}</span>
          </div>
          <div style={S.row}>
            <span style={S.lbl}>Received Online</span>
            <span style={{...S.val, color: "#60a5fa"}}>₹{receivedOnline}</span>
          </div>
          <div style={S.divider} />
          <div style={S.row}>
            <span style={S.lbl}>Total Received</span>
            <span style={S.val}>₹{totalReceived}</span>
          </div>
        </div>

        {diff !== 0 && (
          <div style={{...S.diffBox, background: isShortage ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)" }}>
            <span style={{ color: isShortage ? "#fca5a5" : "#6ee7b7", fontWeight: 700 }}>
              {isShortage ? "⚠️ Shortage:" : "ℹ️ Excess:"}
            </span>
            <span style={{ color: isShortage ? "#f87171" : "#34d399", fontSize: "18px", fontWeight: 800 }}>
              ₹{Math.abs(diff)}
            </span>
          </div>
        )}

        {isShortage && (
          <div style={S.sortBlock}>
            <label style={S.checkboxLabel}>
              <input
                type="checkbox"
                style={S.checkbox}
                checked={createSortCOD}
                onChange={e => setCreateSortCOD(e.target.checked)}
              />
              <span style={S.checkboxText}>Create SORT COD Record for ₹{shortageAmount}</span>
            </label>
            <p style={S.helpText}>
              Check this box to inform the accounting team about the exact cash shortage amount.
            </p>
          </div>
        )}

        <div style={S.footer}>
          <button style={S.cancelBtn} onClick={onClose}>Cancel</button>
          <button
            style={{ ...S.submitBtn, opacity: submitting ? 0.7 : 1 }}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Completing…" : "Confirm & Complete"}
          </button>
        </div>
      </div>
    </div>
  );
}

const S = {
  overlay: {
    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
    background: "rgba(15,23,42,0.85)", backdropFilter: "blur(6px)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
  },
  modal: {
    background: "linear-gradient(145deg, rgba(22,32,52,0.99) 0%, rgba(15,23,42,0.99) 100%)",
    border: "1px solid rgba(148,163,184,0.16)", borderRadius: "20px",
    padding: "24px", width: "420px", maxWidth: "90vw",
    display: "flex", flexDirection: "column", gap: "18px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.5)", fontFamily: "'Inter','Segoe UI',sans-serif",
  },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  title:  { margin: 0, fontSize: "19px", fontWeight: 800, color: "#fff" },
  sub:    { margin: "4px 0 0", fontSize: "13px", color: "#94a3b8" },
  closeBtn: {
    background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
    color: "#fca5a5", borderRadius: "8px", padding: "6px 10px",
    fontSize: "14px", cursor: "pointer", fontWeight: 700,
  },
  summaryBox: {
    background: "rgba(30,41,59,0.4)", borderRadius: "12px", padding: "16px",
    border: "1px solid rgba(148,163,184,0.1)", display: "flex", flexDirection: "column", gap: "10px"
  },
  row: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  lbl: { color: "#94a3b8", fontSize: "14px", fontWeight: 600 },
  val: { color: "#f8fafc", fontSize: "15px", fontWeight: 700, fontFamily: "monospace" },
  divider: { height: "1px", background: "rgba(148,163,184,0.1)", margin: "4px 0" },
  
  diffBox: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "12px 16px", borderRadius: "10px", border: "1px solid rgba(148,163,184,0.1)"
  },
  sortBlock: {
    background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)",
    borderRadius: "10px", padding: "16px"
  },
  checkboxLabel: { display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" },
  checkbox: { width: "18px", height: "18px", accentColor: "#f59e0b" },
  checkboxText: { color: "#fbbf24", fontWeight: 700, fontSize: "14px" },
  helpText: { margin: "8px 0 0 28px", fontSize: "12px", color: "#94a3b8", lineHeight: "1.4" },

  footer: { display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "4px" },
  cancelBtn: { padding: "10px 18px", background: "rgba(100,116,139,0.15)", border: "1px solid rgba(100,116,139,0.3)", color: "#94a3b8", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer" },
  submitBtn: { padding: "10px 20px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", border: "none", color: "#fff", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(16,185,129,0.3)" },
};
