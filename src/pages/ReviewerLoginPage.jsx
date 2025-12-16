import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserCheck, Lock, Mail, User, AlertCircle } from "lucide-react";

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
        // Store token and reviewer info
        localStorage.setItem("reviewerToken", data.token);
        localStorage.setItem("reviewerInfo", JSON.stringify(data.reviewer));

        // Redirect to reviewer dashboard
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
    <div className="min-h-screen py-16 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <UserCheck className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Reviewer Login
          </h1>
          <p className="text-slate-600">
            NEOMED Research Forum 2026
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 mr-3" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">First time reviewing?</p>
              <p>
                Enter your name and email, then use the shared password provided
                by the Research Forum Committee to create your reviewer account.
              </p>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-900 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="Dr. Jane Smith"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="reviewer@neomed.edu"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="Enter reviewer password"
                  required
                />
              </div>
              <p className="mt-2 text-sm text-slate-500">
                Contact the Research Forum Committee if you don't have the password
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                isLoading
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Signing In...
                </span>
              ) : (
                "Sign In as Reviewer"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-slate-600">
          Not a reviewer?{" "}
          <button
            onClick={() => navigate("/")}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}