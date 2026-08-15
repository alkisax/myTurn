// frontend\src\layout\layout.tsx
import { Outlet } from 'react-router-dom'
import Navbar from '../components/layoutComponents/Navbar'

const Layout = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% auto',
        backgroundColor: 'var(--app-background)',
      }}
    >
      <Navbar />

      {/* εδώ θα μπαίνουν όλες οι σελίδες */}
      <Outlet />
    </div>
  )
}

export default Layout
