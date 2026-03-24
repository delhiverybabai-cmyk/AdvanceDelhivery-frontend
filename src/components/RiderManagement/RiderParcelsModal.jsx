import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const BASE = process.env.REACT_APP_BASE_URL;

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");
const today = () => new Date().toISOString().split("T")[0];

export default function RiderParcelsModal({ rider, onClose }) {
  const [selectedDate, setSelectedDate] = useState(today());
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  // Scan Session Modal
  const [scanSession, setScanSession] = useState(null); // the active dispatch doc
  const [scanInput, setScanInput] = useState("");
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState("");
  const [scanSuccessMsg, setScanSuccessMsg] = useState("");
  const [missingParcels, setMissingParcels] = useState(null);

  // Cash Modal
  const [cashDispatch, setCashDispatch] = useState(null);
  const [cashForm, setCashForm] = useState({ receivedCash: "", receivedOnline: "", sortCOD: "", handedOverTo: "" });
  const [denomForm, setDenomForm] = useState({ "2000": "", "500": "", "200": "", "100": "", "50": "", "20": "", "10": "" });
  const [cashLoading, setCashLoading] = useState(false);

  const fetchDispatches = useCallback(async () => {
    if (!rider) return;
    setLoading(true);
    try {
      const res = await axios.get(`${BASE}/api/rider-history/register-dispatch-history`, {
        params: { date: selectedDate, limit: 100 },
      });
      // Filter for this specific rider
      const list = (res.data?.dispatches || []).filter((d) => d.riderId === rider._id);
      setDispatches(list);
    } catch (err) {
      console.error(err);
      setDispatches([]);
    }
    setLoading(false);
  }, [rider, selectedDate]);

  useEffect(() => {
    if (rider) {
      fetchDispatches();
    }
  }, [rider, selectedDate, fetchDispatches]);

  // 1. Sync from Delhivery API
  const handleSyncDispatches = async () => {
    setSyncLoading(true);
    try {
      await axios.put(`${BASE}/api/rider-history/register-dispatch-history`, { date: selectedDate });
      await fetchDispatches();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
    setSyncLoading(false);
  };

  // 2. Scan Session Start
  const openScanSession = async (dispatch) => {
    try {
      const res = await axios.post(`${BASE}/api/rider-history/scan-session/start/${dispatch._id}`);
      setScanSession({ ...dispatch, scanData: res.data });
      setScanInput("");
      setMissingParcels(null);
    } catch (err) { alert(err.response?.data?.error || err.message); }
  };

  // 3. Scan a Parcel
  const handleScan = async (e) => {
    e.preventDefault();
    if (!scanInput.trim() || !scanSession) return;
    setScanLoading(true); setScanError(""); setScanSuccessMsg("");
    try {
      const res = await axios.put(`${BASE}/api/rider-history/scan-session/scan/${scanSession._id}`, { waybillId: scanInput.trim() });
      if (res.data.success) {
        setScanSuccessMsg(`✅ Scanned: ${scanInput}`);
        setScanSession({ ...scanSession, scanData: { ...scanSession.scanData, undeliveredScanned: res.data.undeliveredScanned, scannedCount: res.data.scannedCount } });
        setScanInput("");
      }
    } catch (err) { setScanError(err.response?.data?.error || err.message); }
    setScanLoading(false);
  };

  // 4. Submit Scan Session
  const submitScanSession = async () => {
    if (!scanSession) return;
    setScanLoading(true);
    try {
      const res = await axios.post(`${BASE}/api/rider-history/scan-session/submit/${scanSession._id}`);
      if (res.data.isAllParcelReceived === 1) {
        alert("Session submitted successfully. All parcels received.");
        setScanSession(null);
        fetchDispatches();
      } else {
        setMissingParcels(res.data.missing);
        alert(`Missing ${res.data.missingCount} parcels. Complete scan before finishing.`);
      }
    } catch (err) { alert(err.response?.data?.error || err.message); }
    setScanLoading(false);
  };

  // 5. Open Cash Modal
  const openCashManage = (dispatch) => {
    setCashDispatch(dispatch);
    setCashForm({
      receivedCash: dispatch.receivedCash ?? "",
      receivedOnline: dispatch.receivedOnline ?? "",
      sortCOD: dispatch.sortCOD ?? "",
      handedOverTo: "",
    });
    setDenomForm(dispatch.cashDenominations || { "2000": "", "500": "", "200": "", "100": "", "50": "", "20": "", "10": "" });
  };

  // 6. Complete Cash Management
  const handleCashSubmit = async (e) => {
    e.preventDefault();
    if (!cashDispatch) return;
    setCashLoading(true);
    try {
      // Step A: Save cash breakdown (status 5)
      await axios.put(`${BASE}/api/rider-history/cash-manage/${cashDispatch._id}`, {
        receivedCash: cashForm.receivedCash,
        receivedOnline: cashForm.receivedOnline,
        cashDenominations: denomForm,
        sortCOD: cashForm.sortCOD
      });
      // Step B: Finalize cash (status 6)
      await axios.post(`${BASE}/api/rider-history/cash-complete/${cashDispatch._id}`, {
        sortCOD: cashForm.sortCOD,
        handedOverTo: cashForm.handedOverTo
      });
      setCashDispatch(null);
      fetchDispatches();
    } catch (err) { alert(err.response?.data?.error || err.message); }
    setCashLoading(false);
  };


  if (!rider) return null;

  return (
    <div style={s.overlay} onClick={onClose}>
      {/* ─── MAIN MODAL ─── */}
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <div style={s.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={s.avatar}>{rider.name?.charAt(0) || "R"}</div>
            <div>
              <h2 style={s.title}>{rider.name}</h2>
              <p style={s.subtitle}>Parcels & Cash Flow</p>
            </div>
          </div>
          <button style={s.closeTopBtn} onClick={onClose}>✕</button>
        </div>

        <div style={s.toolbar}>
          <div style={s.dateGroup}>
            <label style={s.dateLabel}>Date</label>
            <input style={s.input} type="date" value={selectedDate} max={today()} onChange={(e) => setSelectedDate(e.target.value)} />
          </div>
          <button style={s.syncBtn} onClick={handleSyncDispatches} disabled={syncLoading}>
            {syncLoading ? "🔄 Syncing…" : "🔄 Sync Dispatches"}
          </button>
        </div>

        {loading ? (
          <div style={s.empty}>Loading records…</div>
        ) : dispatches.length === 0 ? (
          <div style={s.empty}>No dispatches found for this date.</div>
        ) : (
          <div style={s.grid}>
            {dispatches.map((disp) => {
              const totalExpectedScan = (disp.undelivered?.length || 0) + (disp.pickupNotCompleted?.length || 0);
              const scannedSoFar = disp.undeliveredScanned?.length || 0;
              return (
                <div key={disp._id} style={s.card}>
                  <div style={s.cardHead}>
                    <span style={s.dispatchId}>#{disp.dispatchId}</span>
                    <span style={s.statusBadge}>Status: {disp.status}</span>
                  </div>
                  <div style={s.cardBody}>
                    <div style={s.statRow}><span>Total Packages:</span> <strong>{disp.totalPackages}</strong></div>
                    <div style={s.statRow}><span>Delivered:</span> <strong>{disp.deliveredCount}</strong></div>
                    <div style={s.statRow}><span>To Scan (RTO/PU):</span> <strong>{totalExpectedScan}</strong></div>
                    <div style={s.statRow}><span>Expected COD:</span> <strong>₹{disp.expected_cod_amount}</strong></div>
                    <div style={s.statRow}><span>Shortage/Sort:</span> <strong>₹{disp.sortCOD || 0}</strong></div>
                  </div>
                  <div style={s.actions}>
                    <button style={s.actionBtn} onClick={() => openScanSession(disp)}>
                      📦 Scan Parcels {scannedSoFar > 0 ? `(${scannedSoFar}/${totalExpectedScan})` : ""}
                    </button>
                    <button style={{ ...s.actionBtn, background: "rgba(16,185,129,0.15)", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)" }}
                      onClick={() => openCashManage(disp)}>
                      💵 Manage Cash
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── SCAN SESSION MODAL ─── */}
      {scanSession && (
        <div style={s.subOverlay}>
          <div style={s.subModal} onClick={(e) => e.stopPropagation()}>
            <div style={s.subHeader}>
              <h3 style={s.subTitle}>Scan Parcels (#{scanSession.dispatchId})</h3>
              <button style={s.closeSubBtn} onClick={() => setScanSession(null)}>✕</button>
            </div>
            
            <div style={s.scanProgress}>
              Scanned: <strong>{scanSession.scanData?.scannedCount || 0}</strong> / {scanSession.scanData?.totalParcels || 0}
            </div>

            <form onSubmit={handleScan} style={s.scanForm}>
              <input style={s.scanInput} type="text" placeholder="Scan or type Waybill ID..." 
                value={scanInput} onChange={(e) => setScanInput(e.target.value)} autoFocus />
              <button style={s.saveBtn} type="submit" disabled={scanLoading}>Scan</button>
            </form>

            {scanSuccessMsg && <div style={{ color: "#34d399", fontSize: 13, marginBottom: 12 }}>{scanSuccessMsg}</div>}
            {scanError && <div style={{ color: "#f87171", fontSize: 13, marginBottom: 12 }}>{scanError}</div>}

            {missingParcels && missingParcels.length > 0 && (
              <div style={s.missingBox}>
                <div style={{ fontWeight: 700, color: "#fca5a5", marginBottom: 6 }}>Missing Parcels:</div>
                <div style={{ fontSize: 12, color: "#e2e8f0" }}>{missingParcels.join(", ")}</div>
              </div>
            )}

            <div style={s.modalActions}>
              <button style={{ ...s.saveBtn, width: "100%", padding: 12 }} onClick={submitScanSession} disabled={scanLoading}>
                Finish Scan Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── CASH MANAGE MODAL ─── */}
      {cashDispatch && (
        <div style={s.subOverlay}>
          <div style={{ ...s.subModal, maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
            <div style={s.subHeader}>
              <h3 style={s.subTitle}>Manage Cash (#{cashDispatch.dispatchId})</h3>
              <button style={s.closeSubBtn} onClick={() => setCashDispatch(null)}>✕</button>
            </div>

            <div style={s.cashSummary}>
              <div style={s.cashRow}><span>Expected COD:</span> <strong>₹{cashDispatch.expected_cod_amount}</strong></div>
            </div>

            <form onSubmit={handleCashSubmit}>
              <div style={s.formGrid}>
                <div style={s.formRow}>
                  <label style={s.label}>Cash Received (₹)</label>
                  <input style={s.input} type="number" required
                    value={cashForm.receivedCash} onChange={(e) => setCashForm({...cashForm, receivedCash: e.target.value})} />
                </div>
                <div style={s.formRow}>
                  <label style={s.label}>Online Received (₹)</label>
                  <input style={s.input} type="number" required
                    value={cashForm.receivedOnline} onChange={(e) => setCashForm({...cashForm, receivedOnline: e.target.value})} />
                </div>
                <div style={s.formRow}>
                  <label style={s.label}>Shortage / Sort Amount (₹)</label>
                  <input style={s.input} type="number" required
                    value={cashForm.sortCOD} onChange={(e) => setCashForm({...cashForm, sortCOD: e.target.value})} />
                </div>
                <div style={s.formRow}>
                  <label style={s.label}>Handed Over To</label>
                  <input style={s.input} type="text"
                    value={cashForm.handedOverTo} onChange={(e) => setCashForm({...cashForm, handedOverTo: e.target.value})} />
                </div>
              </div>

              <div style={{ marginTop: 24, marginBottom: 16, borderTop: "1px solid rgba(148,163,184,0.1)", paddingTop: 16 }}>
                <label style={s.label}>Cash Denominations (Optional)</label>
                <div style={s.denomGrid}>
                  {["2000", "500", "200", "100", "50", "20", "10"].map(d => (
                    <div key={d} style={s.denomRow}>
                      <span style={s.denomLabel}>₹{d} ×</span>
                      <input style={s.denomInput} type="number" min="0" placeholder="0"
                        value={denomForm[d] || ""} onChange={(e) => setDenomForm({...denomForm, [d]: e.target.value})} />
                    </div>
                  ))}
                </div>
              </div>

              <div style={s.modalActions}>
                <button type="button" style={s.cancelBtn} onClick={() => setCashDispatch(null)}>Cancel</button>
                <button type="submit" style={s.saveBtn} disabled={cashLoading}>{cashLoading ? "Saving…" : "Complete Cash"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24,
  },
  modal: {
    background: "linear-gradient(145deg,#0f172a,#1e293b)", border: "1px solid rgba(148,163,184,0.15)",
    borderRadius: 20, width: "100%", maxWidth: 1000, height: "85vh",
    display: "flex", flexDirection: "column", boxShadow: "0 24px 50px rgba(0,0,0,0.5)",
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "24px 32px", borderBottom: "1px solid rgba(148,163,184,0.1)",
  },
  avatar: {
    width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
    color: "#fff", fontWeight: 800, fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center",
  },
  title: { fontSize: 22, fontWeight: 800, color: "#f1f5f9", marginBottom: 4 },
  subtitle: { fontSize: 13, color: "#94a3b8" },
  closeTopBtn: { background: "rgba(255,255,255,0.05)", border: "none", width: 36, height: 36, borderRadius: "50%", color: "#94a3b8", cursor: "pointer", fontSize: 16 },
  toolbar: { display: "flex", alignItems: "flex-end", gap: 16, padding: "20px 32px" },
  dateGroup: { display: "flex", flexDirection: "column", gap: 6 },
  dateLabel: { fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" },
  input: { padding: "10px 14px", background: "rgba(15,23,42,0.6)", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 8, color: "#f1f5f9", outline: "none", fontSize: 14, width: "100%", boxSizing: "border-box" },
  syncBtn: { padding: "10px 20px", background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 8, color: "#60a5fa", fontWeight: 700, cursor: "pointer" },
  empty: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: 15 },
  grid: { flex: 1, padding: "0 32px 32px", overflowY: "auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20, alignContent: "start" },
  card: { background: "rgba(30,41,59,0.5)", border: "1px solid rgba(148,163,184,0.1)", borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", gap: 16 },
  cardHead: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  dispatchId: { fontSize: 16, fontWeight: 800, color: "#e2e8f0" },
  statusBadge: { padding: "4px 10px", background: "rgba(99,102,241,0.15)", color: "#a5b4fc", borderRadius: 20, fontSize: 11, fontWeight: 700 },
  cardBody: { display: "flex", flexDirection: "column", gap: 8, background: "rgba(15,23,42,0.4)", padding: 12, borderRadius: 10 },
  statRow: { display: "flex", justifyContent: "space-between", fontSize: 13, color: "#cbd5e1" },
  actions: { display: "flex", gap: 10 },
  actionBtn: { flex: 1, padding: "8px", background: "rgba(148,163,184,0.1)", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 8, color: "#e2e8f0", fontSize: 12, fontWeight: 700, cursor: "pointer" },
  // Sub modals
  subOverlay: { position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1001, padding: 20 },
  subModal: { background: "#1e293b", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 16, width: "100%", maxWidth: 420, padding: 28, boxShadow: "0 20px 40px rgba(0,0,0,0.4)" },
  subHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  subTitle: { fontSize: 18, fontWeight: 800, color: "#f1f5f9" },
  closeSubBtn: { background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: 18 },
  scanProgress: { background: "rgba(99,102,241,0.15)", padding: 12, borderRadius: 8, color: "#a5b4fc", fontSize: 14, textAlign: "center", marginBottom: 20 },
  scanForm: { display: "flex", gap: 10, marginBottom: 12 },
  scanInput: { flex: 1, padding: "10px 14px", background: "rgba(15,23,42,0.6)", border: "1px solid #3b82f6", borderRadius: 8, color: "#fff", outline: "none" },
  missingBox: { background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", padding: 12, borderRadius: 8, marginBottom: 20 },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 12px" },
  formRow: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" },
  denomGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 },
  denomRow: { display: "flex", alignItems: "center", gap: 8, background: "rgba(15,23,42,0.4)", padding: "6px 10px", borderRadius: 8 },
  denomLabel: { fontSize: 13, color: "#94a3b8", fontWeight: 700, width: 40 },
  denomInput: { flex: 1, background: "transparent", border: "none", color: "#fff", outline: "none", fontSize: 14, width: "100%" },
  cashSummary: { background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", padding: 14, borderRadius: 10, marginBottom: 20 },
  cashRow: { display: "flex", justifyContent: "space-between", color: "#34d399", fontSize: 15 },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 },
  cancelBtn: { padding: "10px 20px", background: "rgba(148,163,184,0.15)", border: "none", borderRadius: 8, color: "#cbd5e1", fontWeight: 600, cursor: "pointer" },
  saveBtn: { padding: "10px 24px", background: "linear-gradient(135deg,#6366f1,#4f46e5)", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, cursor: "pointer" }
};
