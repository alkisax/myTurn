import { Route, Routes } from "react-router-dom";

import { backendUrl } from "./constants/constants";
import Layout from "./layout/layout";
import Login from "./authLogin/Login";
import PrivateRoute from "./authLogin/service/PrivateRoute";
import RegisterPageBackend from "./authLogin/loginBackend/RegisterPageBackend";
import Info from "./pages/Info";
import Home from "./pages/Home"
import Private from "./pages/Private";
import SuperAdminPrivateRoute from "./authLogin/service/SuperAdminPrivateRoute";
import SuperAdmin from "./pages/SuperAdmin";
import AdminPrivateRoute from "./authLogin/service/AdminPrivateRoute";
import Admin from "./pages/Admin";
import CompanyWizard from "./pages/CompanyWizard";
import StaffPrivateRoute from "./authLogin/service/StaffPrivateRoute";
import Staff from "./pages/Staff";
import PublicTablet from "./pages/PublicTablet";
import PublicTabletIssueTicket from "./pages/PublicTabletIssueTicket";
import PublicTabletTicketResult from "./pages/PublicTabletTicketResult";


function App() {

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/info" element={<Info />} />
        <Route path="/login" element={<Login url={backendUrl} />} />
        <Route path="/register" element={<RegisterPageBackend url={backendUrl} />} />

        <Route element={<PrivateRoute />}>
          <Route path="/private" element={<Private />} />
        </Route>

        <Route element={<SuperAdminPrivateRoute />}>
          <Route path="/super-admin" element={<SuperAdmin />} />
        </Route>

        <Route element={<AdminPrivateRoute />}>
          <Route path="/admin" element={<Admin />} />
        </Route>

        <Route element={<StaffPrivateRoute />}>
          <Route path="/staff" element={<Staff />} />
          <Route path="/staff/public-tablet" element={<PublicTablet />} />
          <Route
            path="/staff/public-tablet/issue"
            element={<PublicTabletIssueTicket />}
          />
          <Route
            path="/staff/public-tablet/ticket"
            element={<PublicTabletTicketResult />}
          />
        </Route>

        <Route element={<PrivateRoute />}>
          <Route path="/private" element={<Private />} />
        </Route>

        <Route path="/company-wizard" element={<CompanyWizard />} />
      </Route>
    </Routes>
  );
}

export default App;
