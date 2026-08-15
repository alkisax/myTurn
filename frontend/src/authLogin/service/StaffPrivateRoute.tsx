// frontend/src/authLogin/service/StaffPrivateRoute.tsx

import { useContext } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { UserAuthContext } from "../context/UserAuthContext";

const StaffPrivateRoute = () => {
  const { user, isLoading } = useContext(UserAuthContext);

  if (isLoading) {
    return <div>Loading auth...</div>;
  }

  if (user?.roles.includes("STAFF")) {
    return <Outlet />;
  }

  return <Navigate to="/" />;
};

export default StaffPrivateRoute;