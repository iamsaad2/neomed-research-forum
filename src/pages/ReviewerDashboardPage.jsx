import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  CheckCircle,
  Clock,
  LogOut,
  ChevronRight,
  Search,
  Filter,
} from "lucide-react";

export default function ReviewerDashboardPage() {
  const navigate = useNavigate();
  const [abstracts, setAbstracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [reviewerInfo, setReviewerInfo] = useState(null);

  useEffect(() => {
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
    const matchesFilter = 
      filter === "all" ? true :
      filter === "pending" ? !abstract.hasReviewed :
      filter === "reviewed" ? abstract.hasReviewed : true;
    
    const matchesSearch = 
      searchTerm === "" ? true :
      abstract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      abstract.authors.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-3 border-[#0099CC] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500">Loading abstracts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                Reviewer Dashboard
              </h1>
              <p className="text-sm text-slate-500">
                Welcome, {reviewerInfo?.name}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Total Abstracts</p>
                <p className="text-3xl font-semibold text-slate-900">{abstracts.length}</p>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Pending Review</p>
                <p className="text-3xl font-semibold text-amber-600">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Reviewed</p>
                <p className="text-3xl font-semibold text-green-600">{reviewedCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or author..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#0099CC] focus:ring-1 focus:ring-[#0099CC] focus:outline-none text-sm"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  filter === "all"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({abstracts.length})
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  filter === "pending"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setFilter("reviewed")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  filter === "reviewed"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Reviewed ({reviewedCount})
              </button>
            </div>
          </div>
        </div>

        {/* Abstracts List */}
        {filteredAbstracts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No abstracts found</h3>
            <p className="text-sm text-slate-500">
              {filter === "pending"
                ? "You've reviewed all available abstracts!"
                : filter === "reviewed"
                ? "You haven't reviewed any abstracts yet."
                : searchTerm
                ? "Try a different search term."
                : "Check back later for new submissions."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAbstracts.map((abstract) => (
              <div
                key={abstract.id}
                onClick={() => navigate(`/reviewer/abstract/${abstract.id}`)}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:border-[#0099CC] hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Status & Category Tags */}
                    <div className="flex items-center gap-2 mb-2">
                      {abstract.hasReviewed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Reviewed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                        {getCategoryLabel(abstract.category)}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                        {getDepartmentLabel(abstract.department)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-medium text-slate-900 mb-1 group-hover:text-[#0077AA] transition-colors line-clamp-2">
                      {abstract.title}
                    </h3>

                    {/* Authors */}
                    <p className="text-sm text-slate-600 mb-3">{abstract.authors}</p>

                    {/* Abstract Preview */}
                    <p className="text-sm text-slate-500 line-clamp-2">
                      {abstract.abstractContent?.background || abstract.abstract}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0 w-10 h-10 bg-slate-100 group-hover:bg-[#0099CC] rounded-full flex items-center justify-center transition-colors">
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-500">
                    {abstract.reviewCount} review{abstract.reviewCount !== 1 ? "s" : ""}
                  </span>
                  {abstract.hasPDF && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      PDF attached
                    </span>
                  )}
                  <span className="text-xs text-slate-500 ml-auto">
                    Submitted {new Date(abstract.submittedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Stats */}
        {reviewedCount > 0 && (
          <div className="mt-8 bg-gradient-to-r from-[#0077AA] to-[#0099CC] rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Your Contribution</h3>
                <p className="text-white/80 text-sm">
                  You've completed {reviewedCount} review{reviewedCount !== 1 ? "s" : ""}. Thank you for helping evaluate submissions for NEOMED Research Forum 2026!
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold">{reviewedCount}</p>
                <p className="text-white/60 text-sm">Reviews</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}