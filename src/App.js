import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardLayout from "./components/layouts/DashboardLayout";
import RiderManagement from "./components/RiderManagement/RiderManagment";
import AddNewRider from "./components/RiderManagement/AddNewRider";
import LiveDispatch from "./components/LiveDispatch/livedispatch";
import DispatchDetail from "./components/LiveDispatch/DispatchDetail";
import TokenManagement from "./components/TokenManagement/TokenManagement";
import OverViewManagment from "./components/overview/OverViewManagment";
import BulkGenricIncoming from "./components/BulkManagment/BulkGenricIncoming";
import RTConnection from "./components/FlowManagment/RTConnection";
import CSEscalation from "./components/FlowManagment/CSEscalation";
import WaybillForamater from "./components/FlowManagment/WaybillForamater";
import PickupStatusPage from "./components/LiveDispatch/PickupStatusPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route path="/" element={<OverViewManagment />} />
          <Route path="rider-management" element={<RiderManagement />} />
          <Route path="add-rider" element={<AddNewRider />} />
          <Route path="live-dispatch" element={<LiveDispatch />} />
          <Route path="dispatch-details" element={<DispatchDetail />} />
          <Route path="token-management" element={<TokenManagement />} />
          <Route path="bulk-gi" element={<BulkGenricIncoming />} />
          <Route path="rt-connection" element={<RTConnection />} />
          <Route path="cs-escalation" element={<CSEscalation />} />
          <Route path="waybill-formater" element={<WaybillForamater />} />
          <Route path="pickup-qc-status" element={<PickupStatusPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
