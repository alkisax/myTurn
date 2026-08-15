// frontend\src\authLogin\service\PrivateRoute.tsx
import { useContext } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { UserAuthContext } from "../context/UserAuthContext";

const PrivateRoute = () => {
  const { user, isLoading } = useContext(UserAuthContext);

  if (isLoading) {
    return <div style={{ color: 'white' }}>Loading auth...</div>
  }

  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;