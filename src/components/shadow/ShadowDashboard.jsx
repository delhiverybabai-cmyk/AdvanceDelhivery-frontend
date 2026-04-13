import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE = process.env.REACT_APP_BASE_URL;

// --- Components ---

const LoadingSkeleton = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="skeleton-row" style={{
        height: "80px",
        background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
        borderRadius: "12px",
      }} />
    ))}
    <style>{`
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `}</style>
  </div>
);

const TokenModal = ({ isOpen, onClose, onSave, loading }) => {
  const [token, setToken] = useState("");

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
      animation: "fadeIn 0.3s ease-out"
    }}>
      <div style={{
        background: "#fff", width: "90%", maxWidth: "500px", padding: "32px", borderRadius: "20px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.2)", animation: "scaleUp 0.3s ease-out",
      }}>
        <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "8px", color: "#111" }}>Update Token</h2>
        <p style={{ color: "#666", fontSize: "14px", marginBottom: "24px" }}>Configure your Shadowfax authorization security layer.</p>
        
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#111", textTransform: "uppercase", marginBottom: "8px" }}>JWT Token</label>
          <textarea
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste token here..."
            style={{
              width: "100%", height: "120px", padding: "12px", borderRadius: "12px", border: "1.5px solid #eee",
              outline: "none", fontSize: "14px", fontFamily: "monospace", transition: "border-color 0.2s"
            }}
            onFocus={(e) => e.target.style.borderColor = "#6C5CE7"}
            onBlur={(e) => e.target.style.borderColor = "#eee"}
          />
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button 
            onClick={() => onSave(token)} 
            disabled={loading}
            style={{
              flex: 1, padding: "14px", background: "linear-gradient(135deg, #6C5CE7, #a29bfe)",
              color: "#fff", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer",
              boxShadow: "0 4px 12px rgba(108, 92, 231, 0.3)"
            }}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button 
            onClick={onClose}
            style={{
              flex: 1, padding: "14px", background: "#f5f5f5", color: "#111", border: "none", 
              borderRadius: "12px", fontWeight: "700", cursor: "pointer"
            }}
          >
            Cancel
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

// --- Main Page ---

const ShadowDashboard = () => {
  const [riders, setRiders] = useState([]);
  const [dispatchData, setDispatchData] = useState([]);
  const [view, setView] = useState("riders"); // "riders" or "dispatch"
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (view === "riders") {
        const resp = await axios.get(`${BASE}/shadow/rider`);
        const data = resp.data?.rider_details || resp.data?.data || resp.data || [];
        setRiders(Array.isArray(data) ? data : []);
      } else {
        const isoDate = new Date(`${selectedDate}T12:00:00Z`).toISOString();
        const resp = await axios.get(`${BASE}/shadow/dispatch-summary?request_date=${isoDate}`);
        setDispatchData(resp.data?.data || []);
      }
    } catch (err) {
      toast.error(`Failed to Sync ${view === "riders" ? "Riders" : "Metrics"}`);
    } finally {
      setLoading(false);
    }
  }, [view, selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveToken = async (token) => {
    if (!token.trim()) return toast.warning("Token cannot be empty");
    setModalLoading(true);
    try {
      await axios.post(`${BASE}/shadow/token`, { token });
      toast.success("Token Updated Successfully");
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error("Failed to Save Token");
    } finally {
      setModalLoading(false);
    }
  };

  const filteredRiders = riders.filter(r => 
    r.name?.toLowerCase().includes(search.toLowerCase()) || 
    r.rider_id?.toString().includes(search)
  );

  const filteredDispatch = dispatchData.filter(d => 
    d.runsheet__rider__name?.toLowerCase().includes(search.toLowerCase()) || 
    d.runsheet__rider__rider_id?.toString().includes(search)
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F8F9FD", fontFamily: "'Inter', sans-serif" }}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Navbar */}
      <nav style={{
        background: "#fff", padding: "16px 40px", display: "flex", justifyContent: "space-between",
        alignItems: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.03)", position: "sticky", top: 0, zIndex: 100
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px", 
            background: "linear-gradient(135deg, #6C5CE7, #00CEC9)",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "900"
          }}>S</div>
          <span style={{ fontWeight: "800", fontSize: "18px", color: "#111", letterSpacing: "-0.5px" }}>Shadow Logistics</span>
        </div>
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <button 
            onClick={() => setView(view === "riders" ? "dispatch" : "riders")}
            style={{ background: "none", border: "none", color: view === "dispatch" ? "#6C5CE7" : "#666", fontWeight: "700", cursor: "pointer", fontSize: "14px" }}
          >
            {view === "dispatch" ? "← Back to Riders" : "Live Dispatch"}
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            style={{
              background: "linear-gradient(135deg, #6C5CE7, #00CEC9)", color: "#fff", border: "none",
              padding: "10px 20px", borderRadius: "10px", fontWeight: "700", cursor: "pointer", fontSize: "14px"
            }}
          >
            Token Update
          </button>
        </div>
      </nav>

      {/* Content */}
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#111", margin: "0 0 4px 0" }}>
              {view === "riders" ? "Rider Management" : "Live Dispatch Counts"}
            </h1>
            <p style={{ color: "#888", fontSize: "14px" }}>
              {view === "riders" ? "Monitor and manage active delivery agents." : "Real-time and historical delivery metrics."}
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            {view === "dispatch" && (
              <div style={{ position: "relative" }}>
                 <input 
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{
                    padding: "12px 16px", borderRadius: "12px", border: "1px solid #eee",
                    background: "#fff", outline: "none", fontSize: "14px", color: "#111", fontWeight: "600",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
                  }}
                />
              </div>
            )}
            <div style={{ position: "relative" }}>
              <input 
                type="text" 
                placeholder={`Search ${view === "riders" ? "rider" : "metric"}...`} 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "280px", padding: "12px 16px 12px 40px", borderRadius: "12px", border: "1px solid #eee",
                  background: "#fff", outline: "none", fontSize: "14px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
                }}
              />
              <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#ccc" }}>🔍</span>
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : (view === "riders" ? (
          filteredRiders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px", background: "#fff", borderRadius: "20px", border: "1px dashed #eee" }}>
              <p style={{ color: "#888" }}>No riders connected.</p>
            </div>
          ) : (
            <div className="rider-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "24px" }}>
              {filteredRiders.map((rider, idx) => (
                <div key={rider.id || idx} style={{
                  background: "#fff", padding: "24px", borderRadius: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                  border: "1px solid #f9f9f9", transition: "all 0.3s ease", cursor: "pointer"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.08)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.04)"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                    <div style={{
                      width: "50px", height: "50px", borderRadius: "14px", background: "#F5F3FF",
                      display: "flex", alignItems: "center", justifyContent: "center", 
                      color: "#6C5CE7", fontSize: "20px", fontWeight: "700"
                    }}>
                      {rider.name?.charAt(0) || "R"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#111" }}>{rider.name}</h3>
                      <span style={{ fontSize: "12px", color: "#10b981", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={{ width: "6px", height: "6px", background: "#10b981", borderRadius: "50%" }}></span> Verified Rider
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#999", fontSize: "13px" }}>Contact Number</span>
                      <span style={{ color: "#111", fontSize: "13px", fontWeight: "600" }}>{rider.contact_number || rider.mobileNumber}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#999", fontSize: "13px" }}>Rider ID</span>
                      <span style={{ color: "#111", fontSize: "13px", fontWeight: "600", fontFamily: "monospace" }}>#{rider.rider_id || rider.id}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div style={{ background: "#fff", borderRadius: "20px", overflow: "hidden", border: "1px solid #eee" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#F9FAFB" }}>
                    <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: "700", color: "#666", textTransform: "uppercase" }}>Rider Name</th>
                    <th style={{ padding: "16px", fontSize: "12px", fontWeight: "700", color: "#666", textAlign: "center" }}>OFD</th>
                    <th style={{ padding: "16px", fontSize: "12px", fontWeight: "700", color: "#666", textAlign: "center" }}>DELIVERED</th>
                    <th style={{ padding: "16px", fontSize: "12px", fontWeight: "700", color: "#666", textAlign: "center" }}>NC</th>
                    <th style={{ padding: "16px", fontSize: "12px", fontWeight: "700", color: "#666", textAlign: "center" }}>HOLD</th>
                    <th style={{ padding: "16px", fontSize: "12px", fontWeight: "700", color: "#666", textAlign: "center" }}>COD</th>
                    <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: "700", color: "#666", textAlign: "center" }}>STRIKE RATE</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDispatch.map((item, idx) => (
                    <tr key={idx} style={{ borderTop: "1px solid #f1f1f1" }}>
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ fontWeight: "700", color: "#111" }}>{item.runsheet__rider__name}</div>
                        <div style={{ fontSize: "12px", color: "#999", fontFamily: "monospace" }}>ID: {item.runsheet__rider__rider_id}</div>
                      </td>
                      <td style={{ padding: "16px", textAlign: "center", fontWeight: "700", color: "#6C5CE7" }}>{item.ofd_count}</td>
                      <td style={{ padding: "16px", textAlign: "center", fontWeight: "700", color: "#10b981" }}>{item.delivered_count}</td>
                      <td style={{ padding: "16px", textAlign: "center", fontWeight: "700", color: "#ef4444" }}>{item.nc_count}</td>
                      <td style={{ padding: "16px", textAlign: "center", fontWeight: "700", color: "#f59e0b" }}>{item.on_hold_count}</td>
                      <td style={{ padding: "16px", textAlign: "center", fontWeight: "800", color: "#111" }}>
                         ₹{item.cash_collected?.toLocaleString("en-IN") || 0}
                      </td>
                      <td style={{ padding: "16px 24px", textAlign: "center" }}>
                        <div style={{ 
                          padding: "6px 12px", borderRadius: "8px", background: item.strike_rate > 70 ? "#DCFCE7" : "#FEF3C7", 
                          color: item.strike_rate > 70 ? "#166534" : "#92400e", fontWeight: "800", display: "inline-block" 
                        }}>
                          {item.strike_rate}%
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredDispatch.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ padding: "40px", textAlign: "center", color: "#999" }}>No dispatch data available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </main>

      {/* Modal */}
      <TokenModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveToken}
        loading={modalLoading}
      />

      <style>{`
        @media (max-width: 600px) {
          .rider-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default ShadowDashboard;
