import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const BASE        = process.env.REACT_APP_BASE_URL;
const PARCEL_RATE = 15; // ₹15 per delivered parcel — must match backend constant

export default function CompleteCashModal({ isOpen, onClose, dispatch }) {
  const [createSortCOD, setCreateSortCOD] = useState(false);
  const [submitting,    setSubmitting]    = useState(false);

  if (!isOpen || !dispatch) return null;

  const expected       = dispatch.expected_cod_amount || 0;
  const receivedCash   = dispatch.receivedCash   || 0;
  const receivedOnline = dispatch.receivedOnline  || 0;
  const totalReceived  = receivedCash + receivedOnline;
  const diff           = totalReceived - expected;
  const isShortage     = diff < 0;
  const shortageAmount = isShortage ? Math.abs(diff) : 0;

  // ── Parcel earnings preview ──────────────────────────────────────────────────
  const deliveredCount = dispatch.deliveredCount || dispatch.delivered?.length || 0;
  const earnedAmount   = deliveredCount * PARCEL_RATE;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Step 1 — finalise cash (existing endpoint)
      const res = await axios.post(
        `${BASE}/api/rider-history/cash-complete/${dispatch._id}`,
        { sortCOD: createSortCOD ? shortageAmount : 0 }
      );

      if (!res.data.success) {
        toast.error("Failed to complete cash");
        return;
      }

      // Step 2 — record ₹15/parcel payment in PaymentHistory (non-blocking)
      try {
        const payRes = await axios.post(
          `${BASE}/api/payments/dispatch-complete/${dispatch._id}`
        );
        if (payRes.data.success && !payRes.data.alreadyExists) {
          toast.success(
            `✅ Cash Finalized & ₹${earnedAmount} (${deliveredCount} parcels × ₹${PARCEL_RATE}) credited`,
            { autoClose: 3500 }
          );
        } else {
          toast.success("✅ Cash Finalized & Dispatch Completed", { autoClose: 2500 });
        }
      } catch (payErr) {
        // Payment logging failed — cash is already done, just warn
        console.warn("[CompleteCashModal] payment record failed:", payErr.message);
        toast.success("✅ Cash Finalized & Dispatch Completed", { autoClose: 2500 });
        toast.warn("⚠️ Payment record could not be saved — contact admin", { autoClose: 4000 });
      }

      onClose();
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

        {/* ── COD Summary ───────────────────────────────────────────────────── */}
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

        {/* ── Shortage / Excess Banner ──────────────────────────────────────── */}
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

        {/* ── Sort COD Checkbox ─────────────────────────────────────────────── */}
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

        {/* ── Parcel Earnings Preview ───────────────────────────────────────── */}
        <div style={S.earningsBox}>
          <div style={S.row}>
            <span style={S.earningsLbl}>📦 Delivered Parcels</span>
            <span style={S.earningsVal}>{deliveredCount}</span>
          </div>
          <div style={S.row}>
            <span style={S.earningsLbl}>💰 Rate per Parcel</span>
            <span style={S.earningsVal}>₹{PARCEL_RATE}</span>
          </div>
          <div style={{...S.divider, margin: "6px 0"}} />
          <div style={S.row}>
            <span style={{...S.earningsLbl, color: "#34d399", fontWeight: 800}}>🏆 Rider Earnings</span>
            <span style={{...S.earningsVal, color: "#34d399", fontSize: "18px"}}>₹{earnedAmount}</span>
          </div>
        </div>

        <div style={S.footer}>
          <button style={S.cancelBtn} onClick={onClose}>Cancel</button>
          <button
            style={{
              ...S.submitBtn,
              opacity: (submitting || (isShortage && !createSortCOD)) ? 0.4 : 1,
              cursor:  (submitting || (isShortage && !createSortCOD)) ? "not-allowed" : "pointer",
            }}
            onClick={handleSubmit}
            disabled={submitting || (isShortage && !createSortCOD)}
          >
            {submitting ? "Completing…" : "Confirm & Complete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  overlay: {
    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
    background: "rgba(15,23,42,0.85)", backdropFilter: "blur(6px)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
  },
  modal: {
    background: "linear-gradient(145deg, rgba(22,32,52,0.99) 0%, rgba(15,23,42,0.99) 100%)",
    border: "1px solid rgba(148,163,184,0.16)", borderRadius: "20px",
    padding: "24px", width: "440px", maxWidth: "90vw",
    display: "flex", flexDirection: "column", gap: "18px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.5)", fontFamily: "'Inter','Segoe UI',sans-serif",
    overflowY: "auto", maxHeight: "90vh",
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
    border: "1px solid rgba(148,163,184,0.1)", display: "flex", flexDirection: "column", gap: "10px",
  },
  row:     { display: "flex", justifyContent: "space-between", alignItems: "center" },
  lbl:     { color: "#94a3b8", fontSize: "14px", fontWeight: 600 },
  val:     { color: "#f8fafc", fontSize: "15px", fontWeight: 700, fontFamily: "monospace" },
  divider: { height: "1px", background: "rgba(148,163,184,0.1)", margin: "4px 0" },
  diffBox: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "12px 16px", borderRadius: "10px", border: "1px solid rgba(148,163,184,0.1)",
  },
  sortBlock: {
    background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)",
    borderRadius: "10px", padding: "16px",
  },
  checkboxLabel: { display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" },
  checkbox:      { width: "18px", height: "18px", accentColor: "#f59e0b" },
  checkboxText:  { color: "#fbbf24", fontWeight: 700, fontSize: "14px" },
  helpText:      { margin: "8px 0 0 28px", fontSize: "12px", color: "#94a3b8", lineHeight: "1.4" },
  // Earnings preview
  earningsBox: {
    background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.25)",
    borderRadius: "12px", padding: "14px 16px",
    display: "flex", flexDirection: "column", gap: "8px",
  },
  earningsLbl: { color: "#94a3b8", fontSize: "13px", fontWeight: 600 },
  earningsVal: { color: "#e2e8f0", fontSize: "15px", fontWeight: 700, fontFamily: "monospace" },
  footer:    { display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "4px" },
  cancelBtn: {
    padding: "10px 18px", background: "rgba(100,116,139,0.15)",
    border: "1px solid rgba(100,116,139,0.3)", color: "#94a3b8",
    borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer",
  },
  submitBtn: {
    padding: "10px 20px",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    border: "none", color: "#fff", borderRadius: "8px",
    fontSize: "13px", fontWeight: 700, boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
  },
};
