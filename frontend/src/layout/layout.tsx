// frontend\src\layout\layout.tsx
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/layoutComponents/Navbar'
import { useContext, useEffect } from 'react'
import { UserAuthContext } from '../authLogin/context/UserAuthContext'
import { handleLogout } from '../authLogin/authFunctions'

const kioskRoutes = new Set([
  '/staff/public-tablet',
  '/staff/public-tablet/issue',
  '/staff/public-tablet/ticket',
]);

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useContext(UserAuthContext);
  const kioskMode = sessionStorage.getItem('myturn-kiosk-mode') === 'true';
  const isKioskRoute = kioskRoutes.has(location.pathname);

  useEffect(() => {
    if (kioskMode && !isKioskRoute) {
      sessionStorage.removeItem('myturn-kiosk-mode');
      void handleLogout(setUser, navigate, '/login');
    }
  }, [isKioskRoute, kioskMode, navigate, setUser]);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% auto',
        backgroundColor: 'var(--app-background)',
      }}
    >
      {!isKioskRoute && <Navbar />}

      {/* εδώ θα μπαίνουν όλες οι σελίδες */}
      <Outlet />
    </div>
  )
}

export default Layout
