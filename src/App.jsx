import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import MultiStepSubmitPage from "./pages/MultiStepSubmitPage";
import ShowcasePage from "./pages/ShowcasePage";
import ThankYouPage from "./pages/ThankYouPage";
import ViewAbstractPage from "./pages/ViewAbstractPage";
import ReviewerLoginPage from "./pages/ReviewerLoginPage";
import ReviewerDashboardPage from "./pages/ReviewerDashboardPage";
import ReviewAbstractPage from "./pages/ReviewAbstractPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";

function AppContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  // Hide navbar on admin routes
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className={`min-h-screen ${isAdminRoute ? "bg-slate-900" : "bg-gradient-to-b from-slate-50 to-white"}`}>
      {!isAdminRoute && (
        <Navbar
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
      )}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/submit" element={<MultiStepSubmitPage />} />
        <Route path="/showcase" element={<ShowcasePage />} />
        <Route path="/thank-you/:token" element={<ThankYouPage />} />
        <Route path="/view/:token" element={<ViewAbstractPage />} />
        
        {/* Reviewer Routes */}
        <Route path="/review" element={<ReviewerLoginPage />} />
        <Route path="/reviewer/dashboard" element={<ReviewerDashboardPage />} />
        <Route path="/reviewer/abstract/:abstractId" element={<ReviewAbstractPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}