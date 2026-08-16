import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import { StaffProvider } from "./context/StaffContext";
import { UserProvider } from "./authLogin/context/UserAuthContext";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <UserProvider>
        <StaffProvider>
          <App />
        </StaffProvider>
      </UserProvider>
    </BrowserRouter>
  </StrictMode>,
)
