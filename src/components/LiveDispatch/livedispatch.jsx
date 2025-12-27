import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import WipBulkDispatchModel from "../BulkManagment/WipBulkDispatchModel";
import AddVehicleModal from "./AddVehicleModal";

const styles = {
  // ... (keep all your existing styles)
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
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    marginBottom: "8px",
    letterSpacing: "-0.03em",
  },
  subtitle: {
    fontSize: "18px",
    color: "#94a3b8",
    fontWeight: 500,
    marginBottom: "2px",
  },
  tabContainer: {
    display: "flex",
    gap: "8px",
    marginBottom: "20px",
  },
  tabButton: {
    padding: "12px 24px",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    background: "rgba(30,41,59,0.6)",
    color: "#94a3b8",
  },
  activeTab: {
    background: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
    color: "#ffffff",
    boxShadow: "0 4px 12px rgba(59,130,246,0.4)",
  },
  tableContainer: {
    background:
      "linear-gradient(145deg, rgba(30,41,59,0.88) 0%, rgba(15,23,42,0.97) 100%)",
    border: "1.5px solid rgba(148,163,184,0.14)",
    borderRadius: "18px",
    boxShadow: "0 3px 14px rgba(51,84,124,0.07)",
    overflowX: "auto",
    marginTop: "10px",
    padding: "18px",
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: "0",
    background: "transparent",
    fontSize: "15px",
  },
  th: {
    padding: "18px 12px",
    background: "rgba(23,31,42,0.96)",
    color: "#a7e0ff",
    fontWeight: "700",
    fontSize: "14px",
    borderBottom: "2px solid #213553",
    borderRight: "1px solid #22293b",
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
  actionBtn: {
    background: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 97%)",
    color: "#fff",
    padding: "8px 20px",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    transition: "box-shadow 0.15s",
    boxShadow: "0 2px 10px #3b82f658",
  },
  copyBtn: {
    background: "linear-gradient(90deg, #fed656 0%, #ffd600 98%)",
    color: "#222",
    padding: "8px 16px",
    border: "none",
    borderRadius: "8px",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    marginRight: "8px",
    boxShadow: "0 2px 8px #e6f51d48",
  },
  status: {
    background: "#22c55e33",
    color: "#22c55e",
    borderRadius: "7px",
    padding: "6px 16px",
    fontWeight: "700",
    fontSize: "15px",
    textTransform: "capitalize",
    display: "inline-block",
  },
  wipStatus: {
    background: "#f59e0b33",
    color: "#f59e0b",
    borderRadius: "7px",
    padding: "6px 16px",
    fontWeight: "700",
    fontSize: "15px",
    textTransform: "capitalize",
    display: "inline-block",
  },
  vehicleType: {
    fontWeight: "600",
    fontSize: "14px",
    padding: "4px 10px",
    borderRadius: "8px",
    background: "#f6fa9c33",
    color: "#b4b117",
    display: "inline-block",
  },
  tableRow: {
    transition: "background 0.14s",
    cursor: "pointer",
  },
  evenRow: { backgroundColor: "rgba(15,23,42,0.12)" },
  oddRow: { backgroundColor: "rgba(30,41,59,0.05)" },
  copiedMsg: {
    color: "#10b981",
    fontWeight: "600",
    marginLeft: "8px",
    fontSize: "13px",
  },
};

function LiveDispatch() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
   const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState(null);

  const [activeTab, setActiveTab] = useState("open");
  const [openDispatches, setOpenDispatches] = useState([]);
  const [wipDispatches, setWipDispatches] = useState([]);
  const [loading, setLoading] = useState(false); // Changed to false initially
  const [copiedId, setCopiedId] = useState(null);

  // ✅ Fetch ONLY on tab switch
  const fetchDispatchesByTab = async (tab) => {
    setLoading(true);
    try {
      if (tab === "open") {
        const openResponse = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/dispatch/open-dispatches`,
          { headers: { "Content-Type": "application/json" } }
        );
        setOpenDispatches(
          Array.isArray(openResponse.data)
            ? openResponse.data
            : openResponse.data?.data || []
        );
      } else if (tab === "wip") {
        const wipResponse = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/dispatch/open-wip-dispatches`,
          { headers: { "Content-Type": "application/json" } }
        );
        console.log(wipResponse.data);
        setWipDispatches(
          Array.isArray(wipResponse.data)
            ? wipResponse.data
            : wipResponse.data?.data?.dispatches || wipResponse.data?.data || []
        );
      }
    } catch (error) {
      console.error(`Error fetching ${tab} dispatches:`, error);
      toast.error(`Failed to fetch ${tab} dispatches`);
      if (tab === "open") setOpenDispatches([]);
      else setWipDispatches([]);
    } finally {
      setLoading(false);
    }
  };

  //   const scanUndelivered = async () => {
  //   if (undeliveredWaybills.length === 0) {
  //     toast.info("No undelivered waybills to scan.");
  //     return;
  //   }
  //   try {
  //     handleCopy(dispatchData.dispatch_id);
  //     const response = await axios.put(
  //       `http://localhost:5000/api/dispatch/scan-undelivered/${dispatchData.dispatch_id}`,
  //       { waybills: undeliveredWaybills },
  //       { headers: { "Content-Type": "application/json" } }
  //     );
  //     if (response.data.success) {
  //       toast.success("Undelivered packages scanned successfully!");
  //       setScanDone(true);
  //     } else {
  //       toast.error("Failed to scan undelivered packages.");
  //     }
  //   } catch (error) {
  //     toast.error("Error contacting server for undelivered scan.");
  //     console.error(error);
  //   } finally {
  //     setScanning(false);
  //   }
  // };

  const ScanAndCopyHanler = async (disp)=>{
    try {
      undeliverScan(disp);
      console.log(disp,"Scan displying")
      // scanUndelivered(disp);
    } catch (error) {
      console.log(error)
    }
  }

  // ✅ Handle tab switch with fetch
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    fetchDispatchesByTab(tab);
  };

  // ✅ Initial load - only open dispatches
  useEffect(() => {
    fetchDispatchesByTab("open");
    fetchDispatchesByTab("wip");
  }, []);

  

  const currentDispatches =
    activeTab === "open" ? openDispatches : wipDispatches;

     const undeliverScan = async (disp) => {
       try {
         const dispatchId = disp.id ?? disp._id;
         const response = await axios.get(
           `${process.env.REACT_APP_BASE_URL}/api/dispatch/dispatch-details/${dispatchId}`,
           { headers: { "Content-Type": "application/json" } }
         );
         await navigator.clipboard.writeText(
           JSON.stringify(response.data, null, 2)
         );
        
         toast.success("Dispatch details copied to clipboard!");
        // await setTimeout(() => setCopiedId(null), 500);
console.log(response.data.responses);
        const UndeliverResponse = await axios.put(
          `http://localhost:5000/api/dispatch/scan-undelivered/${dispatchId}`,
          {
            waybills: [
              ...response.data.responses.undelivered,
              ...response.data.responses.pickup,
            ],
          },
          { headers: { "Content-Type": "application/json" } }
        );
              if (response.data.success) {
                toast.success("Undelivered packages scanned successfully!");
              } else {
                toast.error("Failed to scan undelivered packages.");
              }
       } catch (error) {
         toast.error("Failed to copy dispatch details.");
         console.error("Failed to copy dispatch details.", error);
       }
     };

  const handleCopy = async (disp) => {
    try {
      const dispatchId = disp.id ?? disp._id;
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/dispatch/dispatch-details/${dispatchId}`,
        { headers: { "Content-Type": "application/json" } }
      );
      await navigator.clipboard.writeText(
        JSON.stringify(response.data, null, 2)
      );
      setCopiedId(dispatchId);
      toast.success("Dispatch details copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast.error("Failed to copy dispatch details.");
      console.error("Failed to copy dispatch details.", error);
    }
  };

  const handleView = async (disp) => {
    try {
      const dispatchId = disp.id ?? disp._id;
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/dispatch/dispatch-details/${dispatchId}`,
        { headers: { "Content-Type": "application/json" } }
      );
      navigate("/dispatch-details", { state: { dispatchData: response.data } });
    } catch (error) {
      toast.error("Failed to load dispatch details");
      console.error("Error loading dispatch details:", error);
    }
  };

  const handleBulkDispatch = (disp) => {
    setSelectedDispatch(disp);
    setShowModal(true);
  };

  const getStatusStyle = (status) => {
    if (status?.toLowerCase() === "wip") {
      return styles.wipStatus;
    }
    return styles.status;
  };

  return (
    <div style={styles.container}>
      <ToastContainer position="top-right" autoClose={5000} />
      <main style={styles.main}>
        <div style={styles.headerSection}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div style={styles.subtitle}>
              <h2 style={styles.mainTitle}>Live Dispatches</h2>
              Current {activeTab === "open" ? "open" : "WIP"} dispatch trips and
              their details.
            </div>
            <button
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "linear-gradient(135deg, #ee1c25 0%, #c41e3a 100%)",
                color: "#ffffff",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 12px rgba(238, 28, 37, 0.3)",
                letterSpacing: "0.3px",
                height:'50px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(238, 28, 37, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(238, 28, 37, 0.3)";
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
              onClick={()=>{
                setIsVehicleModalOpen(true);
              }}
            >
              <span style={{ fontSize: "18px", fontWeight: 700 }}>+</span>
              Add Vehicle
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={styles.tabContainer}>
          <button
            style={{
              ...styles.tabButton,
              ...(activeTab === "open" ? styles.activeTab : {}),
            }}
            onClick={() => handleTabSwitch("open")}
            disabled={loading}
          >
            Open Dispatches ({openDispatches.length})
          </button>
          <button
            style={{
              ...styles.tabButton,
              ...(activeTab === "wip" ? styles.activeTab : {}),
            }}
            onClick={() => handleTabSwitch("wip")}
            disabled={loading}
          >
            WIP Dispatches ({wipDispatches.length})
          </button>
        </div>

        <div style={styles.tableContainer}>
          {loading ? (
            <div
              style={{
                color: "#b7d5fd",
                fontSize: "18px",
                textAlign: "center",
                margin: "46px 0",
              }}
            >
              Loading {activeTab.toUpperCase()} dispatches...
            </div>
          ) : currentDispatches.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                color: "#94a3b8",
                fontSize: "17px",
                padding: "40px",
              }}
            >
              🚚 No {activeTab} dispatches found.
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>FE Name</th>
                  <th style={styles.th}>Dispatch ID</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Employee ID</th>
                  <th style={styles.th}>FE Phone</th>
                  <th style={styles.th}>Vehicle Type</th>
                  {activeTab !== "wip" ? (
                    <>
                      <th style={styles.th}>Copy Detail</th>
                      <th style={styles.th}>View Detail</th>
                      <th style={styles.th}>Scan Undelivered</th>
                      <th style={styles.th}>EOD</th>
                    </>
                  ) : (
                    <>
                      <th style={styles.th}>Packages</th>
                      <th style={styles.th}>Action</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {currentDispatches.map((disp, i) => (
                  <tr
                    key={disp.id ?? disp._id ?? i}
                    style={{
                      ...styles.tableRow,
                      ...(i % 2 === 0 ? styles.evenRow : styles.oddRow),
                    }}
                  >
                    <td style={styles.td}>{disp.dispatch_fe?.name ?? "-"}</td>
                    <td style={styles.td}>{disp.id ?? disp._id}</td>
                    <td style={styles.td}>
                      <span style={getStatusStyle(disp.status)}>
                        {disp.status ?? "Unknown"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {disp.dispatch_fe?.employee_id ?? "-"}
                    </td>
                    <td style={styles.td}>
                      {disp.dispatch_fe?.phone_no ?? "-"}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.vehicleType}>
                        {disp.dispatch_vehicle?.vehicle_type ?? "-"}
                      </span>
                    </td>
                    {activeTab !== "wip" ? (
                      <>
                        <td style={styles.td}>
                          <button
                            style={styles.copyBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(disp);
                            }}
                          >
                            Copy
                          </button>
                          {copiedId === (disp.id ?? disp._id) && (
                            <span style={styles.copiedMsg}>Copied!</span>
                          )}
                        </td>
                        <td style={styles.td}>
                          <button
                            style={styles.actionBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleView(disp);
                            }}
                          >
                            View
                          </button>
                        </td>
                        <td style={styles.td}>
                          <button
                            style={{
                              ...styles.actionBtn,
                              background:
                                "linear-gradient(135deg, #1dd47fff 0%, #059669 100%)",
                            }}
                            onClick={(e) => {
                              ScanAndCopyHanler(disp);
                            }}
                          >
                            Scan & Copy
                          </button>
                        </td>
                        <td style={styles.td}>
                          <button
                            style={styles.copyBtn}
                            onClick={() =>
                              window.open(
                                `https://last-mile.delhivery.com/#/lm/dispatch/${
                                  disp.id ?? disp._id
                                }/eod`,
                                "_blank",
                                "noopener,noreferrer"
                              )
                            }
                          >
                            Redirect EOD
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={styles.td}>{disp.no_of_packages ?? "-"}</td>
                        <td style={styles.td}>
                          <button
                            style={{
                              ...styles.actionBtn,
                              background:
                                "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBulkDispatch(disp);
                            }}
                          >
                            Bulk Dispatch
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
      <WipBulkDispatchModel
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        dispatch={selectedDispatch}
        fetchDispatchesByTab={fetchDispatchesByTab}
      />

      <AddVehicleModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
      />
    </div>
  );
}

export default LiveDispatch;
