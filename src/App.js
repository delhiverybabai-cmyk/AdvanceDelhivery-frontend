import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardLayout from "./components/layouts/DashboardLayout";
import RiderManagement from "./components/RiderManagement/RiderManagment";
import AddNewRider from "./components/RiderManagement/AddNewRider";
import LiveDispatch from "./components/LiveDispatch/livedispatch";
import DispatchDetail from "./components/LiveDispatch/DispatchDetail";
import DispatchHistory from "./components/DispatchHistory/DispatchHistory";
import TokenManagement from "./components/TokenManagement/TokenManagement";
import OverViewManagment from "./components/overview/OverViewManagment";
import BulkGenricIncoming from "./components/BulkManagment/BulkGenricIncoming";
import RTConnection from "./components/FlowManagment/RTConnection";
import CSEscalation from "./components/FlowManagment/CSEscalation";
import WaybillForamater from "./components/FlowManagment/WaybillForamater";
import PickupStatusPage from "./components/LiveDispatch/PickupStatusPage";

import RiderDetails from "./components/RiderManagement/RiderDetails";
import UpdateRider from "./components/RiderManagement/UpdateRider";
import RiderDeliveryHistoryList from "./components/RiderManagement/RiderDeliveryHistoryList";
import AddRiderDeliveryHistory from "./components/RiderManagement/AddRiderDeliveryHistory";
import UpdateDeliveryHistory from "./components/RiderManagement/UpdateDeliveryHistory";
import RiderDebtManagement from "./components/RiderManagement/RiderDebtManagement";
import RiderPaidHistory from "./components/RiderManagement/RiderPaidHistory";
import ExpenseProfitList from "./components/Expense/ExpenseProfitList";
import AddExpenseProfit from "./components/Expense/AddExpenseProfit";

function App() {
  return (
    <Router basename="/admin">
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route path="/" element={<OverViewManagment />} />
          <Route path="rider-management" element={<RiderManagement />} />
          <Route path="rider-management/record" element={<RiderManagement />} />
          <Route path="add-rider" element={<AddNewRider />} />
          
          {/* New Rider Management Routes */}
          <Route path="rider-details/:id" element={<RiderDetails />} />
          <Route path="update-rider/:id" element={<UpdateRider />} />
          <Route path="rider-delivery-history/:riderId" element={<RiderDeliveryHistoryList />} />
          <Route path="rider-delivery-history/:riderId/record" element={<RiderDeliveryHistoryList />} />
          <Route path="add-rider-delivery-history/:riderId" element={<AddRiderDeliveryHistory />} />
          <Route path="update-rider-delivery-history/:historyId/:riderId" element={<UpdateDeliveryHistory />} />
          <Route path="rider-debt/:riderId" element={<RiderDebtManagement />} />
          <Route path="rider-paid-history/:riderId" element={<RiderPaidHistory />} />
          <Route path="rider-paid-history/:riderId/record" element={<RiderPaidHistory />} />

          {/* New Expense Routes */}
          <Route path="expence-profit" element={<ExpenseProfitList />} />
          <Route path="add-expence-profit" element={<AddExpenseProfit />} />

          <Route path="live-dispatch" element={<LiveDispatch />} />
          <Route path="live-dispatch/record" element={<LiveDispatch />} />
          <Route path="dispatch-history" element={<DispatchHistory />} />
          <Route path="dispatch-history/record" element={<DispatchHistory />} />
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
