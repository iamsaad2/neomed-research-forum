import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import BackendDiagnostic from "./components/BackendDiagnostic";

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <Navbar
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

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
        </Routes>

        {/* Backend Diagnostic Tool - Remove in production */}
        <BackendDiagnostic />
      </div>
    </Router>
  );
}