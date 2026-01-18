import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Users,
  LogOut,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Search,
  ChevronDown,
  ChevronUp,
  Trash2,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Shuffle,
  Settings,
  UserCheck,
  Lock,
  Unlock,
} from "lucide-react";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("abstracts");
  const [abstracts, setAbstracts] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("score");
  const [sortOrder, setSortOrder] = useState("desc");
  const [expandedAbstract, setExpandedAbstract] = useState(null);
  const [adminInfo, setAdminInfo] = useState(null);
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewerToDelete, setReviewerToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  
  // Assignment management states
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedReviewers, setSelectedReviewers] = useState([]);
  const [abstractsPerReviewer, setAbstractsPerReviewer] = useState(18);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [assignmentResult, setAssignmentResult] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const info = localStorage.getItem("adminInfo");

    if (!token) {
      navigate("/admin");
      return;
    }

    if (info) setAdminInfo(JSON.parse(info));
    fetchData(token);
  }, [navigate]);

  const fetchData = async (token) => {
    setLoading(true);
    try {
      const [abstractsRes, statsRes, reviewersRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/admin/abstracts`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/admin/reviewers`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const [abstractsData, statsData, reviewersData] = await Promise.all([
        abstractsRes.json(),
        statsRes.json(),
        reviewersRes.json(),
      ]);

      if (abstractsData.success) setAbstracts(abstractsData.data);
      if (statsData.success) setStats(statsData.data);
      if (reviewersData.success) setReviewers(reviewersData.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    navigate("/admin");
  };

  const handleAccept = async (abstractId) => {
    setActionLoading(abstractId);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/accept/${abstractId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.success) {
        setAbstracts(abstracts.map(a => 
          a.id === abstractId ? { ...a, status: "accepted", acceptedAt: new Date() } : a
        ));
        setStats(prev => ({
          ...prev,
          accepted: (prev?.accepted || 0) + 1,
          pending: Math.max(0, (prev?.pending || 0) - 1),
          underReview: abstracts.find(a => a.id === abstractId)?.status === "under_review" 
            ? Math.max(0, (prev?.underReview || 0) - 1) 
            : prev?.underReview
        }));
      }
    } catch (error) {
      console.error("Error accepting abstract:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (abstractId) => {
    setActionLoading(abstractId);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/reject/${abstractId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.success) {
        setAbstracts(abstracts.map(a => 
          a.id === abstractId ? { ...a, status: "rejected" } : a
        ));
        setStats(prev => ({
          ...prev,
          rejected: (prev?.rejected || 0) + 1,
          pending: Math.max(0, (prev?.pending || 0) - 1),
          underReview: abstracts.find(a => a.id === abstractId)?.status === "under_review" 
            ? Math.max(0, (prev?.underReview || 0) - 1) 
            : prev?.underReview
        }));
      }
    } catch (error) {
      console.error("Error rejecting abstract:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteReviewer = async () => {
    if (!reviewerToDelete) return;
    
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/reviewers/${reviewerToDelete.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.success) {
        setReviewers(reviewers.filter(r => r.id !== reviewerToDelete.id));
        fetchData(token);
      }
    } catch (error) {
      console.error("Error deleting reviewer:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setReviewerToDelete(null);
    }
  };

  // Toggle reviewer assignment type (all <-> limited)
  const handleToggleAssignmentType = async (reviewerId, currentType) => {
    const token = localStorage.getItem("adminToken");
    const newType = currentType === 'all' ? 'limited' : 'all';
    
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/reviewers/${reviewerId}/assignment`,
        {
          method: "PUT",
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ assignmentType: newType }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setReviewers(reviewers.map(r => 
          r.id === reviewerId 
            ? { ...r, assignmentType: newType, assignedAbstracts: newType === 'all' ? 0 : r.assignedAbstracts }
            : r
        ));
      }
    } catch (error) {
      console.error("Error updating assignment type:", error);
    }
  };

  // Clear specific reviewer's assignments
  const handleClearAssignments = async (reviewerId) => {
    const token = localStorage.getItem("adminToken");
    
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/reviewers/${reviewerId}/assignments`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.success) {
        setReviewers(reviewers.map(r => 
          r.id === reviewerId 
            ? { ...r, assignmentType: 'all', assignedAbstracts: 0, assignedLimit: 0 }
            : r
        ));
      }
    } catch (error) {
      console.error("Error clearing assignments:", error);
    }
  };

  // Randomize assignments for selected reviewers
  const handleRandomizeAssignments = async () => {
    if (selectedReviewers.length === 0) return;
    
    setIsRandomizing(true);
    setAssignmentResult(null);
    
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/reviewers/randomize-assignments`,
        {
          method: "POST",
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ 
            reviewerIds: selectedReviewers,
            abstractsPerReviewer 
          }),
        }
      );
      const data = await res.json();
      
      if (data.success) {
        setAssignmentResult({
          success: true,
          message: data.message,
          data: data.data
        });
        // Refresh reviewer data
        fetchData(token);
        setSelectedReviewers([]);
      } else {
        setAssignmentResult({
          success: false,
          message: data.message
        });
      }
    } catch (error) {
      console.error("Error randomizing assignments:", error);
      setAssignmentResult({
        success: false,
        message: error.message || "Failed to randomize assignments"
      });
    } finally {
      setIsRandomizing(false);
    }
  };

  const toggleReviewerSelection = (reviewerId) => {
    if (selectedReviewers.includes(reviewerId)) {
      setSelectedReviewers(selectedReviewers.filter(id => id !== reviewerId));
    } else {
      setSelectedReviewers([...selectedReviewers, reviewerId]);
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { icon: Clock, label: "Pending", class: "bg-slate-700 text-slate-300" },
      under_review: { icon: Eye, label: "Under Review", class: "bg-slate-600 text-slate-200" },
      accepted: { icon: CheckCircle, label: "Accepted", class: "bg-slate-800 text-white border border-slate-600" },
      rejected: { icon: XCircle, label: "Rejected", class: "bg-slate-800/50 text-slate-400" },
    };
    return configs[status] || configs.pending;
  };

  // Filter and sort abstracts
  const filteredAbstracts = abstracts
    .filter((a) => {
      const matchesStatus = statusFilter === "all" || a.status === statusFilter;
      const matchesSearch =
        searchTerm === "" ||
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.authors.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === "score") comparison = (a.averageScore || 0) - (b.averageScore || 0);
      else if (sortBy === "reviews") comparison = a.reviewCount - b.reviewCount;
      else if (sortBy === "date") comparison = new Date(a.submittedAt) - new Date(b.submittedAt);
      return sortOrder === "desc" ? -comparison : comparison;
    });

  // Get pending abstracts count for assignment validation
  const pendingAbstractsCount = abstracts.filter(a => 
    a.status === "pending" || a.status === "under_review"
  ).length;

  const SortButton = ({ field, label }) => (
    <button
      onClick={() => toggleSort(field)}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        sortBy === field 
          ? "bg-slate-700 text-white" 
          : "text-slate-400 hover:text-white hover:bg-slate-800"
      }`}
    >
      {label}
      {sortBy === field ? (
        sortOrder === "desc" ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUp className="w-3.5 h-3.5" />
      ) : (
        <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
      )}
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-slate-600 border-t-slate-300 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-white">Admin</span>
              <span className="text-slate-600">·</span>
              <span className="text-sm text-slate-500">{adminInfo?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 text-slate-500 hover:text-white transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {[
            { label: "Total", value: stats?.totalAbstracts || 0 },
            { label: "Pending", value: stats?.pending || 0 },
            { label: "Under Review", value: stats?.underReview || 0 },
            { label: "Accepted", value: stats?.accepted || 0 },
            { label: "Avg Score", value: stats?.averageScore || "—", suffix: "/5" },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-800/50 border border-slate-800 rounded-xl p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{stat.label}</p>
              <p className="text-2xl font-semibold text-white">
                {stat.value}
                {stat.suffix && <span className="text-sm text-slate-500 ml-1">{stat.suffix}</span>}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6">
          {[
            { id: "abstracts", label: "Abstracts", count: abstracts.length, icon: FileText },
            { id: "reviewers", label: "Reviewers", count: reviewers.length, icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-slate-800 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded text-xs ${
                activeTab === tab.id ? "bg-slate-700 text-slate-300" : "bg-slate-800 text-slate-500"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="bg-slate-800/30 border border-slate-800 rounded-xl overflow-hidden">
          {/* Abstracts Tab */}
          {activeTab === "abstracts" && (
            <>
              {/* Filters */}
              <div className="p-4 border-b border-slate-800 flex flex-wrap gap-3">
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
                  />
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-slate-600"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>

                <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
                  <SortButton field="score" label="Score" />
                  <SortButton field="reviews" label="Reviews" />
                  <SortButton field="date" label="Date" />
                </div>
              </div>

              {/* List */}
              <div className="divide-y divide-slate-800">
                {filteredAbstracts.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-slate-500 text-sm">No abstracts found</p>
                  </div>
                ) : (
                  filteredAbstracts.map((abstract) => {
                    const statusConfig = getStatusConfig(abstract.status);
                    const StatusIcon = statusConfig.icon;
                    const isExpanded = expandedAbstract === abstract.id;

                    return (
                      <div key={abstract.id}>
                        <div 
                          className="p-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
                          onClick={() => setExpandedAbstract(isExpanded ? null : abstract.id)}
                        >
                          <div className="flex items-start gap-4">
                            {/* Score */}
                            <div className="w-14 h-14 bg-slate-800 rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                              <span className="text-xl font-semibold text-white">
                                {abstract.averageScore?.toFixed(1) || "—"}
                              </span>
                              <span className="text-[10px] text-slate-500 uppercase">Score</span>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${statusConfig.class}`}>
                                  <StatusIcon className="w-3 h-3" />
                                  {statusConfig.label}
                                </span>
                                <span className="text-xs text-slate-600">
                                  {abstract.reviewCount} review{abstract.reviewCount !== 1 ? "s" : ""}
                                </span>
                              </div>
                              <h3 className="font-medium text-white mb-0.5 line-clamp-1">
                                {abstract.title}
                              </h3>
                              <p className="text-sm text-slate-500 line-clamp-1">
                                {abstract.authors}
                              </p>
                            </div>

                            {/* Expand Icon */}
                            <div className="flex-shrink-0">
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-slate-600" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-slate-600" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expanded */}
                        {isExpanded && (
                          <div className="px-4 pb-4 border-t border-slate-800 bg-slate-800/20">
                            <div className="pt-4 grid lg:grid-cols-2 gap-6">
                              {/* Abstract */}
                              <div>
                                <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Abstract</h4>
                                {abstract.abstractContent ? (
                                  <div className="space-y-3 text-sm text-slate-300">
                                    {["background", "methods", "results", "conclusion"].map((section) => (
                                      <div key={section}>
                                        <span className="text-slate-500 capitalize">{section}: </span>
                                        {abstract.abstractContent[section]}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-slate-300">{abstract.abstract}</p>
                                )}
                              </div>

                              {/* Reviews */}
                              <div>
                                <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">
                                  Reviews ({abstract.reviews?.length || 0})
                                </h4>
                                
                                {abstract.reviews && abstract.reviews.length > 0 ? (
                                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                                    {abstract.reviews.map((review, idx) => (
                                      <div key={idx} className="bg-slate-800 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-xs text-slate-500">Reviewer {idx + 1}</span>
                                          <span className="text-sm font-medium text-white">
                                            {review.totalScore?.toFixed(1)}/5
                                          </span>
                                        </div>
                                        {review.scores && (
                                          <div className="grid grid-cols-5 gap-2 mb-2">
                                            {[
                                              { key: "background", label: "BG" },
                                              { key: "methods", label: "MT" },
                                              { key: "results", label: "RS" },
                                              { key: "conclusions", label: "CN" },
                                              { key: "originality", label: "OR" },
                                            ].map(({ key, label }) => (
                                              <div key={key} className="text-center">
                                                <div className="text-[10px] text-slate-600 uppercase">{label}</div>
                                                <div className="text-sm text-slate-300">{review.scores[key]}</div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                        {review.comments && (
                                          <p className="text-xs text-slate-500 italic mt-2 border-t border-slate-700 pt-2">
                                            "{review.comments}"
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-slate-600 italic">No reviews yet</p>
                                )}

                                {/* Actions */}
                                {abstract.status !== "accepted" && abstract.status !== "rejected" && (
                                  <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAccept(abstract.id);
                                      }}
                                      disabled={actionLoading === abstract.id}
                                      className="flex-1 px-4 py-2.5 bg-white text-slate-900 text-sm font-medium rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                      Accept
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleReject(abstract.id);
                                      }}
                                      disabled={actionLoading === abstract.id}
                                      className="flex-1 px-4 py-2.5 bg-slate-700 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                      <XCircle className="w-4 h-4" />
                                      Reject
                                    </button>
                                  </div>
                                )}

                                {/* Status Badge for decided */}
                                {(abstract.status === "accepted" || abstract.status === "rejected") && (
                                  <div className={`mt-4 p-3 rounded-lg text-center ${
                                    abstract.status === "accepted" 
                                      ? "bg-slate-800 border border-slate-600" 
                                      : "bg-slate-800/50"
                                  }`}>
                                    <p className={`text-sm font-medium ${
                                      abstract.status === "accepted" ? "text-white" : "text-slate-500"
                                    }`}>
                                      {abstract.status === "accepted" ? "✓ Accepted for presentation" : "Not selected"}
                                    </p>
                                    {abstract.acceptedAt && (
                                      <p className="text-xs text-slate-500 mt-1">
                                        {new Date(abstract.acceptedAt).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}

          {/* Reviewers Tab */}
          {activeTab === "reviewers" && (
            <>
              {/* Assignment Controls */}
              <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-400">
                    {selectedReviewers.length} selected
                  </span>
                  {selectedReviewers.length > 0 && (
                    <button
                      onClick={() => setSelectedReviewers([])}
                      className="text-xs text-slate-500 hover:text-slate-300"
                    >
                      Clear selection
                    </button>
                  )}
                </div>
                
                <button
                  onClick={() => setShowAssignmentModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Shuffle className="w-4 h-4" />
                  Randomize Assignments
                </button>
              </div>

              {reviewers.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-slate-500 text-sm">No reviewers found</p>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-slate-800 grid grid-cols-12 gap-4 text-xs font-medium text-slate-500 uppercase tracking-wide">
                    <div className="col-span-1">Select</div>
                    <div className="col-span-3">Reviewer</div>
                    <div className="col-span-3">Email</div>
                    <div className="col-span-2 text-center">Assignment</div>
                    <div className="col-span-1 text-center">Reviews</div>
                    <div className="col-span-2 text-right">Actions</div>
                  </div>

                  <div className="divide-y divide-slate-800">
                    {reviewers.map((reviewer) => (
                      <div key={reviewer.id} className="px-4 py-3 grid grid-cols-12 gap-4 items-center hover:bg-slate-800/30 transition-colors">
                        {/* Checkbox */}
                        <div className="col-span-1">
                          <input
                            type="checkbox"
                            checked={selectedReviewers.includes(reviewer.id)}
                            onChange={() => toggleReviewerSelection(reviewer.id)}
                            className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                          />
                        </div>

                        {/* Name */}
                        <div className="col-span-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-slate-700 rounded-lg flex items-center justify-center text-white text-sm font-medium">
                              {reviewer.name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <span className="text-sm text-white font-medium">{reviewer.name}</span>
                          </div>
                        </div>

                        {/* Email */}
                        <div className="col-span-3">
                          <span className="text-sm text-slate-400">{reviewer.email}</span>
                        </div>

                        {/* Assignment Type */}
                        <div className="col-span-2 text-center">
                          <button
                            onClick={() => handleToggleAssignmentType(reviewer.id, reviewer.assignmentType)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              reviewer.assignmentType === 'limited'
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : "bg-green-500/20 text-green-400 border border-green-500/30"
                            }`}
                            title={reviewer.assignmentType === 'all' ? "Click to set limited access" : "Click to give full access"}
                          >
                            {reviewer.assignmentType === 'limited' ? (
                              <>
                                <Lock className="w-3 h-3" />
                                Limited ({reviewer.assignedAbstracts || 0})
                              </>
                            ) : (
                              <>
                                <Unlock className="w-3 h-3" />
                                All Access
                              </>
                            )}
                          </button>
                        </div>

                        {/* Reviews Completed */}
                        <div className="col-span-1 text-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-medium ${
                            reviewer.totalReviewsCompleted > 0 
                              ? "bg-slate-700 text-white" 
                              : "bg-slate-800 text-slate-500"
                          }`}>
                            {reviewer.totalReviewsCompleted}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="col-span-2 flex justify-end gap-2">
                          {reviewer.assignmentType === 'limited' && reviewer.assignedAbstracts > 0 && (
                            <button
                              onClick={() => handleClearAssignments(reviewer.id)}
                              className="p-2 text-slate-500 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                              title="Clear assignments (reset to All Access)"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setReviewerToDelete(reviewer);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 text-slate-600 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="px-4 py-3 border-t border-slate-800 flex justify-between text-sm text-slate-500">
                    <span>
                      {reviewers.length} reviewers • 
                      {reviewers.filter(r => r.assignmentType === 'all').length} full access • 
                      {reviewers.filter(r => r.assignmentType === 'limited').length} limited
                    </span>
                    <span>{reviewers.reduce((sum, r) => sum + r.totalReviewsCompleted, 0)} total reviews</span>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Reviewer Modal */}
      {showDeleteModal && reviewerToDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">Remove Reviewer</h3>
                <p className="text-sm text-slate-500">This cannot be undone</p>
              </div>
            </div>

            <p className="text-sm text-slate-400 mb-6">
              Removing <span className="text-white font-medium">{reviewerToDelete.name}</span> will 
              delete all {reviewerToDelete.totalReviewsCompleted} of their reviews. Abstract scores 
              will be recalculated.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setReviewerToDelete(null);
                }}
                className="flex-1 px-4 py-2.5 bg-slate-700 text-white text-sm font-medium rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteReviewer}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Removing...
                  </>
                ) : (
                  "Remove"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Randomize Assignments Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Shuffle className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">Randomize Abstract Assignments</h3>
                <p className="text-sm text-slate-500">Non-overlapping distribution</p>
              </div>
            </div>

            {assignmentResult && (
              <div className={`mb-4 p-4 rounded-lg ${
                assignmentResult.success 
                  ? "bg-green-500/10 border border-green-500/30" 
                  : "bg-red-500/10 border border-red-500/30"
              }`}>
                <p className={`text-sm ${assignmentResult.success ? "text-green-400" : "text-red-400"}`}>
                  {assignmentResult.message}
                </p>
              </div>
            )}

            <div className="space-y-4 mb-6">
              {/* Abstracts per reviewer input */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Abstracts per Reviewer
                </label>
                <input
                  type="number"
                  value={abstractsPerReviewer}
                  onChange={(e) => setAbstractsPerReviewer(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  max={pendingAbstractsCount}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {pendingAbstractsCount} abstracts available for review
                </p>
              </div>

              {/* Select reviewers */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Select Reviewers to Assign
                </label>
                <div className="max-h-48 overflow-y-auto border border-slate-700 rounded-lg divide-y divide-slate-700">
                  {reviewers.map((reviewer) => (
                    <label
                      key={reviewer.id}
                      className="flex items-center gap-3 p-3 hover:bg-slate-700/50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedReviewers.includes(reviewer.id)}
                        onChange={() => toggleReviewerSelection(reviewer.id)}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-600"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-white">{reviewer.name}</p>
                        <p className="text-xs text-slate-500">{reviewer.email}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        reviewer.assignmentType === 'limited' 
                          ? "bg-amber-500/20 text-amber-400" 
                          : "bg-green-500/20 text-green-400"
                      }`}>
                        {reviewer.assignmentType === 'limited' 
                          ? `Limited (${reviewer.assignedAbstracts})` 
                          : "All"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Validation info */}
              {selectedReviewers.length > 0 && (
                <div className={`p-3 rounded-lg ${
                  selectedReviewers.length * abstractsPerReviewer <= pendingAbstractsCount
                    ? "bg-blue-500/10 border border-blue-500/30"
                    : "bg-red-500/10 border border-red-500/30"
                }`}>
                  <p className={`text-sm ${
                    selectedReviewers.length * abstractsPerReviewer <= pendingAbstractsCount
                      ? "text-blue-400"
                      : "text-red-400"
                  }`}>
                    {selectedReviewers.length} reviewers × {abstractsPerReviewer} abstracts = {selectedReviewers.length * abstractsPerReviewer} total needed
                    {selectedReviewers.length * abstractsPerReviewer > pendingAbstractsCount && (
                      <span className="block mt-1">
                        ⚠️ Not enough abstracts! Reduce reviewers or abstracts per reviewer.
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAssignmentModal(false);
                  setAssignmentResult(null);
                }}
                className="flex-1 px-4 py-2.5 bg-slate-700 text-white text-sm font-medium rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRandomizeAssignments}
                disabled={
                  isRandomizing || 
                  selectedReviewers.length === 0 || 
                  selectedReviewers.length * abstractsPerReviewer > pendingAbstractsCount
                }
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isRandomizing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <Shuffle className="w-4 h-4" />
                    Assign Randomly
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}