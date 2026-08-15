// frontend\src\authLogin\service\SuperAdminPrivateRoute.tsx
import { useContext } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { UserAuthContext } from "../context/UserAuthContext";

const AdminPrivateRoute = () => {
  const { user, isLoading } = useContext(UserAuthContext);

  if (isLoading) {
    return <div>Loading auth...</div>;
  }

  // Only allow access if user exists and has 'ADMIN' ή 'SUPERADMIN' role
  if (user && user.roles.includes('SUPERADMIN')) {
    return <Outlet />
  } else {
    // Redirect non-super-admins to login or home
    return <Navigate to="/" />;
  }
};

export default AdminPrivateRoute;
