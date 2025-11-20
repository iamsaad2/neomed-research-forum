import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Star,
  CheckCircle,
  Clock,
  LogOut,
  Eye,
  Award,
  Filter,
} from "lucide-react";

export default function ReviewerDashboardPage() {
  const navigate = useNavigate();
  const [abstracts, setAbstracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, reviewed
  const [reviewerInfo, setReviewerInfo] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("reviewerToken");
    const info = localStorage.getItem("reviewerInfo");

    if (!token) {
      navigate("/review");
      return;
    }

    setReviewerInfo(JSON.parse(info));
    fetchAbstracts(token);
  }, [navigate]);

  const fetchAbstracts = async (token) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reviewers/abstracts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setAbstracts(data.data);
      }
    } catch (error) {
      console.error("Error fetching abstracts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("reviewerToken");
    localStorage.removeItem("reviewerInfo");
    navigate("/review");
  };

  const filteredAbstracts = abstracts.filter((abstract) => {
    if (filter === "pending") return !abstract.hasReviewed;
    if (filter === "reviewed") return abstract.hasReviewed;
    return true;
  });

  const pendingCount = abstracts.filter((a) => !a.hasReviewed).length;
  const reviewedCount = abstracts.filter((a) => a.hasReviewed).length;

  const getDepartmentLabel = (dept) => {
    const map = {
      cardiology: "Cardiology",
      neurology: "Neurology",
      oncology: "Oncology",
      pediatrics: "Pediatrics",
      internal: "Internal Medicine",
      surgery: "Surgery",
      psychiatry: "Psychiatry",
      radiology: "Radiology",
      pathology: "Pathology",
      emergency: "Emergency Medicine",
      anesthesiology: "Anesthesiology",
      dermatology: "Dermatology",
    };
    return map[dept] || dept;
  };

  const getCategoryLabel = (cat) => {
    const map = {
      clinical: "Clinical Research",
      education: "Medical Education",
      basic: "Basic Science",
      public: "Public Health",
    };
    return map[cat] || cat;
  };

  if (loading) {
    return (
      <div className="min-h-screen py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600">Loading abstracts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Reviewer Dashboard
            </h1>
            <p className="text-slate-600">
              Welcome back, {reviewerInfo?.name}!
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">
                Total Abstracts
              </h3>
              <FileText className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {abstracts.length}
            </p>
          </div>

          <div className="bg-white border border-orange-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-orange-600">
                Pending Review
              </h3>
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-orange-600">{pendingCount}</p>
          </div>

          <div className="bg-white border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-green-600">
                Reviewed by You
              </h3>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-600">{reviewedCount}</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-3 mb-6">
          <Filter className="w-5 h-5 text-slate-400" />
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
              }`}
            >
              All ({abstracts.length})
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "pending"
                  ? "bg-orange-600 text-white"
                  : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilter("reviewed")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "reviewed"
                  ? "bg-green-600 text-white"
                  : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
              }`}
            >
              Reviewed ({reviewedCount})
            </button>
          </div>
        </div>

        {/* Abstracts List */}
        {filteredAbstracts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-2">No abstracts to show</p>
            <p className="text-sm text-slate-500">
              {filter === "pending"
                ? "You've reviewed all abstracts!"
                : filter === "reviewed"
                ? "You haven't reviewed any abstracts yet"
                : "Check back later for new submissions"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAbstracts.map((abstract) => (
              <div
                key={abstract.id}
                className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <h3 className="text-lg font-bold text-slate-900 flex-1">
                        {abstract.title}
                      </h3>
                      {abstract.hasReviewed ? (
                        <span className="flex items-center px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Reviewed
                        </span>
                      ) : (
                        <span className="flex items-center px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
                          <Clock className="w-4 h-4 mr-1" />
                          Pending
                        </span>
                      )}
                    </div>

                    <p className="text-slate-600 mb-3">{abstract.authors}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full">
                        {getDepartmentLabel(abstract.department)}
                      </span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                        {getCategoryLabel(abstract.category)}
                      </span>
                      {abstract.hasPDF && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                          PDF Attached
                        </span>
                      )}
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full flex items-center">
                        <Star className="w-3 h-3 mr-1" />
                        {abstract.reviewCount} review{abstract.reviewCount !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <p className="text-slate-700 line-clamp-2 mb-4">
                      {abstract.abstract}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => navigate(`/reviewer/abstract/${abstract.id}`)}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center font-medium"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {abstract.hasReviewed ? "View Review" : "Review Abstract"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* My Stats Footer */}
        <div className="mt-8 bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-bold text-purple-900">Your Impact</h3>
          </div>
          <p className="text-purple-700">
            You've completed <strong>{reviewerInfo?.totalReviews || reviewedCount}</strong> review
            {(reviewerInfo?.totalReviews || reviewedCount) !== 1 ? "s" : ""} total. Thank you for
            contributing to NEOMED Research Forum 2025!
          </p>
        </div>
      </div>
    </div>
  );
}