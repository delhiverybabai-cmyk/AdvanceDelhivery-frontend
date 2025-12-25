import React from "react";
import { Outlet, Link } from "react-router-dom";
import HeaderNav from "../common/HeaderNav";

function DashboardLayout() {
  return (
    <div >
      <HeaderNav/>
      <Outlet />
    </div>
  );
}

export default DashboardLayout;
