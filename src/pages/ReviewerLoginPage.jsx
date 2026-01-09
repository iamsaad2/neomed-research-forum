import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, User, AlertCircle, ArrowRight } from "lucide-react";

export default function ReviewerLoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reviewers/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("reviewerToken", data.token);
        localStorage.setItem("reviewerInfo", JSON.stringify(data.reviewer));
        navigate("/reviewer/dashboard");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to connect to server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-slate-50 flex overflow-hidden">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#004963] to-[#0099CC] p-12 flex-col justify-center">
        <div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Reviewer Portal
          </h1>
          <p className="text-xl text-white/80 leading-relaxed mb-12">
            Help shape the future of medical research by evaluating abstract submissions for this year's forum.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold">1</span>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Review Abstracts</h3>
                <p className="text-white/70 text-sm">Score submissions using our 5-criteria rubric</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold">2</span>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Provide Feedback</h3>
                <p className="text-white/70 text-sm">Help authors improve their research presentation</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold">3</span>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Shape the Forum</h3>
                <p className="text-white/70 text-sm">Your scores help select presentations</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Reviewer Portal
            </h2>
          </div>

          <div className="text-center mb-8 hidden lg:block">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Sign In
            </h2>
            <p className="text-slate-500">
              Enter your details to access the review portal
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-[#0077AA] flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-700">
                <p className="font-medium text-slate-900 mb-1">First time?</p>
                <p>Use your name, email, and the shared password provided by the Research Forum Committee.</p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#0099CC] focus:ring-2 focus:ring-[#0099CC]/20 focus:outline-none transition-all"
                  placeholder="Dr. Jane Smith"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#0099CC] focus:ring-2 focus:ring-[#0099CC]/20 focus:outline-none transition-all"
                  placeholder="jsmith@neomed.edu"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Reviewer Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#0099CC] focus:ring-2 focus:ring-[#0099CC]/20 focus:outline-none transition-all"
                  placeholder="Enter reviewer password"
                  required
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Contact the committee if you don't have the password
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                isLoading
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-[#0077AA] text-white hover:bg-[#005F89] shadow-lg shadow-[#0077AA]/25"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Not a reviewer?{" "}
              <button
                onClick={() => navigate("/")}
                className="text-[#0077AA] hover:text-[#005F89] font-medium"
              >
                Return to Home
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}