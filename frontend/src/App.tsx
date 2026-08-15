import { Route, Routes } from "react-router-dom";

import { backendUrl } from "./constants/constants";
import Layout from "./layout/layout";
import Login from "./authLogin/Login";
import PrivateRoute from "./authLogin/service/PrivateRoute";
import RegisterPageBackend from "./authLogin/loginBackend/RegisterPageBackend";
import Info from "./pages/Info";
import Home from "./pages/Home"
import Private from "./pages/Private";


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
      </Route>
    </Routes>
  );
}

export default App;
