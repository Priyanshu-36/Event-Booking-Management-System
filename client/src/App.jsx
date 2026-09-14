import React, { useContext } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

import AuthContext from "./context/authContext.js";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer/Footer.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import EventDetails from "./pages/EventDetails.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import PaymentSucess from "./pages/PaymentSucess.jsx";
import PaymentFailed from "./pages/PaymentFailed.jsx";

/*
  Protects routes that require login.
  If the user is not logged in,
  redirect them to /login.
*/
function ProtectedRoute() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

/*
  Only admin users can access these routes.
*/
function AdminRoute() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

/*
  If an already logged-in user opens /login,
  send them to the appropriate page.
*/
function PublicRoute() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/"} replace />;
  }

  return <Outlet />;
}

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <Routes>

          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>


          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />

            {/* Dynamic event details */}
            <Route path="/events/:id" element={<EventDetails />} />

            {/* User dashboard */}
            <Route path="/dashboard" element={<UserDashboard />} />

            {/* Payment result pages */}
            <Route path="/payment/success" element={<PaymentSucess />} />

            <Route path="/payment/failed" element={<PaymentFailed />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
