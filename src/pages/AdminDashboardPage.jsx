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
  UserX,
  Lock,
  Unlock,
  Mail,
  Hourglass,
  Edit3,
  Plus,
  X,
  Save,
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
  const [authorResponseFilter, setAuthorResponseFilter] = useState("all");
  const [sortBy, setSortBy] = useState("score");
  const [sortOrder, setSortOrder] = useState("desc");
  const [expandedAbstract, setExpandedAbstract] = useState(null);
  const [adminInfo, setAdminInfo] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewerToDelete, setReviewerToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedReviewers, setSelectedReviewers] = useState([]);
  const [abstractsPerReviewer, setAbstractsPerReviewer] = useState(18);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [assignmentResult, setAssignmentResult] = useState(null);

  // Edit Abstract Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAbstract, setEditingAbstract] = useState(null);
  const [editFormData, setEditFormData] = useState({
    primaryAuthor: { firstName: "", lastName: "", degree: "", email: "" },
    additionalAuthors: [],
    department: "",
    departmentOther: "",
    category: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const degrees = ["BS", "BA", "MD", "DO", "PhD", "MD/PhD", "MS", "Other"];
  const departments = [
    { value: "cardiology", label: "Cardiology" },
    { value: "neurology", label: "Neurology" },
    { value: "oncology", label: "Oncology" },
    { value: "pediatrics", label: "Pediatrics" },
    { value: "internal", label: "Internal Medicine" },
    { value: "surgery", label: "Surgery" },
    { value: "psychiatry", label: "Psychiatry" },
    { value: "radiology", label: "Radiology" },
    { value: "pathology", label: "Pathology" },
    { value: "emergency", label: "Emergency Medicine" },
    { value: "anesthesiology", label: "Anesthesiology" },
    { value: "dermatology", label: "Dermatology" },
    { value: "other", label: "Other" },
  ];
  const categories = [
    { value: "clinical", label: "Clinical Research" },
    { value: "education", label: "Medical Education" },
    { value: "basic", label: "Basic Science" },
    { value: "public", label: "Public Health" },
  ];

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
      if (data.success) fetchData(token);
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
      if (data.success) fetchData(token);
    } catch (error) {
      console.error("Error rejecting abstract:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResendEmail = async (abstractId) => {
    setActionLoading(abstractId);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/resend-acceptance/${abstractId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.success) alert("Acceptance email resent successfully!");
      else alert(data.message || "Failed to resend email");
    } catch (error) {
      console.error("Error resending email:", error);
      alert("Failed to resend email");
    } finally {
      setActionLoading(null);
    }
  };

  // Edit Abstract Functions
  const openEditModal = (abstract) => {
    setEditingAbstract(abstract);
    setEditFormData({
      primaryAuthor: {
        firstName: abstract.primaryAuthor?.firstName || "",
        lastName: abstract.primaryAuthor?.lastName || "",
        degree: abstract.primaryAuthor?.degree || "",
        email: abstract.primaryAuthor?.email || "",
      },
      additionalAuthors: abstract.additionalAuthors || [],
      department: abstract.department || "",
      departmentOther: abstract.departmentOther || "",
      category: abstract.category || "",
    });
    setEditError("");
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingAbstract(null);
    setEditFormData({
      primaryAuthor: { firstName: "", lastName: "", degree: "", email: "" },
      additionalAuthors: [],
      department: "",
      departmentOther: "",
      category: "",
    });
    setEditError("");
  };

  const handleEditSave = async () => {
    setIsSaving(true);
    setEditError("");

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/abstracts/${editingAbstract.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editFormData),
        }
      );
      const data = await res.json();

      if (data.success) {
        // Update local state
        setAbstracts(
          abstracts.map((a) =>
            a.id === editingAbstract.id
              ? {
                  ...a,
                  primaryAuthor: data.data.primaryAuthor,
                  additionalAuthors: data.data.additionalAuthors,
                  authors: data.data.authors,
                  department: data.data.department,
                  departmentOther: data.data.departmentOther,
                  category: data.data.category,
                }
              : a
          )
        );
        closeEditModal();
      } else {
        setEditError(data.message || "Failed to update abstract");
      }
    } catch (error) {
      console.error("Error updating abstract:", error);
      setEditError("Failed to update abstract. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const addAdditionalAuthor = () => {
    setEditFormData({
      ...editFormData,
      additionalAuthors: [
        ...editFormData.additionalAuthors,
        { firstName: "", lastName: "", degree: "" },
      ],
    });
  };

  const removeAdditionalAuthor = (index) => {
    setEditFormData({
      ...editFormData,
      additionalAuthors: editFormData.additionalAuthors.filter(
        (_, i) => i !== index
      ),
    });
  };

  const updateAdditionalAuthor = (index, field, value) => {
    const newAuthors = [...editFormData.additionalAuthors];
    newAuthors[index] = { ...newAuthors[index], [field]: value };
    setEditFormData({ ...editFormData, additionalAuthors: newAuthors });
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
        setReviewers(reviewers.filter((r) => r.id !== reviewerToDelete.id));
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

  const handleToggleAssignmentType = async (reviewerId, currentType) => {
    const token = localStorage.getItem("adminToken");
    const newType = currentType === "all" ? "limited" : "all";
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/reviewers/${reviewerId}/assignment`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ assignmentType: newType }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setReviewers(
          reviewers.map((r) =>
            r.id === reviewerId
              ? {
                  ...r,
                  assignmentType: newType,
                  assignedAbstracts: newType === "all" ? 0 : r.assignedAbstracts,
                }
              : r
          )
        );
      }
    } catch (error) {
      console.error("Error updating assignment type:", error);
    }
  };

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
        setReviewers(
          reviewers.map((r) =>
            r.id === reviewerId
              ? {
                  ...r,
                  assignmentType: "all",
                  assignedAbstracts: 0,
                  assignedLimit: 0,
                }
              : r
          )
        );
      }
    } catch (error) {
      console.error("Error clearing assignments:", error);
    }
  };

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
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reviewerIds: selectedReviewers, abstractsPerReviewer }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setAssignmentResult({
          success: true,
          message: data.message,
          data: data.data,
        });
        fetchData(token);
        setSelectedReviewers([]);
      } else {
        setAssignmentResult({ success: false, message: data.message });
      }
    } catch (error) {
      console.error("Error randomizing assignments:", error);
      setAssignmentResult({
        success: false,
        message: error.message || "Failed to randomize assignments",
      });
    } finally {
      setIsRandomizing(false);
    }
  };

  const toggleReviewerSelection = (reviewerId) => {
    if (selectedReviewers.includes(reviewerId)) {
      setSelectedReviewers(selectedReviewers.filter((id) => id !== reviewerId));
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
      pending: {
        icon: Clock,
        label: "Pending",
        class: "bg-slate-700 text-slate-300",
      },
      under_review: {
        icon: Eye,
        label: "Under Review",
        class: "bg-slate-600 text-slate-200",
      },
      accepted: {
        icon: CheckCircle,
        label: "Accepted",
        class: "bg-slate-800 text-white border border-slate-600",
      },
      rejected: {
        icon: XCircle,
        label: "Rejected",
        class: "bg-slate-800/50 text-slate-400",
      },
    };
    return configs[status] || configs.pending;
  };

  const getAuthorResponseBadge = (abstract) => {
    if (abstract.status !== "accepted") return null;
    const response = abstract.authorResponse || "pending";
    if (response === "accepted")
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium rounded">
          <UserCheck className="w-3 h-3" />
          Confirmed
        </span>
      );
    if (response === "declined")
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium rounded">
          <UserX className="w-3 h-3" />
          Declined
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-medium rounded">
        <Hourglass className="w-3 h-3" />
        Awaiting
      </span>
    );
  };

  const getKeywordsArray = (keywords) => {
    if (!keywords) return [];
    if (Array.isArray(keywords)) return keywords;
    if (typeof keywords === "string")
      return keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);
    return [];
  };

  const getDepartmentLabel = (dept) => {
    const found = departments.find((d) => d.value === dept);
    return found ? found.label : dept;
  };

  const getCategoryLabel = (cat) => {
    const found = categories.find((c) => c.value === cat);
    return found ? found.label : cat;
  };

  const filteredAbstracts = abstracts
    .filter((a) => {
      const matchesStatus = statusFilter === "all" || a.status === statusFilter;
      const matchesSearch =
        searchTerm === "" ||
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.authors.toLowerCase().includes(searchTerm.toLowerCase());
      let matchesAuthorResponse = true;
      if (authorResponseFilter !== "all") {
        if (authorResponseFilter === "awaiting") {
          matchesAuthorResponse =
            a.status === "accepted" &&
            (!a.authorResponse || a.authorResponse === "pending");
        } else if (authorResponseFilter === "confirmed") {
          matchesAuthorResponse = a.authorResponse === "accepted";
        } else if (authorResponseFilter === "declined") {
          matchesAuthorResponse = a.authorResponse === "declined";
        }
      }
      return matchesStatus && matchesSearch && matchesAuthorResponse;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === "score") {
        comparison = (a.averageScore || 0) - (b.averageScore || 0);
      } else if (sortBy === "reviews") {
        comparison = a.reviewCount - b.reviewCount;
      } else if (sortBy === "date") {
        comparison = new Date(a.submittedAt) - new Date(b.submittedAt);
      }
      return sortOrder === "desc" ? -comparison : comparison;
    });

  const pendingAbstractsCount = abstracts.filter(
    (a) => a.status === "pending" || a.status === "under_review"
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
        sortOrder === "desc" ? (
          <ArrowDown className="w-3.5 h-3.5" />
        ) : (
          <ArrowUp className="w-3.5 h-3.5" />
        )
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
        <div className="grid grid-cols-6 gap-4 mb-8">
          {[
            { label: "Total", value: stats?.totalAbstracts || 0 },
            { label: "Pending", value: stats?.pending || 0 },
            { label: "Under Review", value: stats?.underReview || 0 },
            { label: "Accepted", value: stats?.accepted || 0 },
            {
              label: "Confirmed",
              value: stats?.authorResponses?.accepted || 0,
              color: "text-emerald-400",
            },
            {
              label: "Awaiting",
              value: stats?.authorResponses?.pending || 0,
              color: "text-amber-400",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-slate-800/50 border border-slate-800 rounded-xl p-4"
            >
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                {stat.label}
              </p>
              <p
                className={`text-2xl font-semibold ${
                  stat.color || "text-white"
                }`}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="flex gap-1 mb-6">
          {[
            {
              id: "abstracts",
              label: "Abstracts",
              count: abstracts.length,
              icon: FileText,
            },
            {
              id: "reviewers",
              label: "Reviewers",
              count: reviewers.length,
              icon: Users,
            },
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
              <span
                className={`px-1.5 py-0.5 rounded text-xs ${
                  activeTab === tab.id
                    ? "bg-slate-700 text-slate-300"
                    : "bg-slate-800 text-slate-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="bg-slate-800/30 border border-slate-800 rounded-xl overflow-hidden">
          {activeTab === "abstracts" && (
            <>
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
                <select
                  value={authorResponseFilter}
                  onChange={(e) =>
                    setAuthorResponseFilter(e.target.value)
                  }
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-slate-600"
                >
                  <option value="all">All Responses</option>
                  <option value="awaiting">Awaiting Response</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="declined">Declined</option>
                </select>
                <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
                  <SortButton field="score" label="Score" />
                  <SortButton field="reviews" label="Reviews" />
                  <SortButton field="date" label="Date" />
                </div>
              </div>

              <div className="divide-y divide-slate-800">
                {filteredAbstracts.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-slate-500 text-sm">
                      No abstracts found
                    </p>
                  </div>
                ) : (
                  filteredAbstracts.map((abstract) => {
                    const statusConfig = getStatusConfig(abstract.status);
                    const StatusIcon = statusConfig.icon;
                    const isExpanded = expandedAbstract === abstract.id;
                    const keywordsArray = getKeywordsArray(abstract.keywords);
                    return (
                      <div key={abstract.id}>
                        <div
                          className="p-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
                          onClick={() =>
                            setExpandedAbstract(
                              isExpanded ? null : abstract.id
                            )
                          }
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-14 h-14 bg-slate-800 rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                              <span className="text-xl font-semibold text-white">
                                {abstract.averageScore?.toFixed(1) || "—"}
                              </span>
                              <span className="text-[10px] text-slate-500 uppercase">
                                Score
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${statusConfig.class}`}
                                >
                                  <StatusIcon className="w-3 h-3" />
                                  {statusConfig.label}
                                </span>
                                {getAuthorResponseBadge(abstract)}
                                <span className="text-xs text-slate-600">
                                  {abstract.reviewCount} review
                                  {abstract.reviewCount !== 1 ? "s" : ""}
                                </span>
                              </div>
                              <h3 className="font-medium text-white mb-0.5 line-clamp-1">
                                {abstract.title}
                              </h3>
                              <p className="text-sm text-slate-500 line-clamp-1">
                                {abstract.authors}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {/* Edit Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditModal(abstract);
                                }}
                                className="p-2 text-slate-500 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                                title="Edit abstract details"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-slate-600" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-slate-600" />
                              )}
                            </div>
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="px-4 pb-4 border-t border-slate-800 bg-slate-800/20">
                            <div className="pt-4 grid lg:grid-cols-2 gap-6">
                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                                    Abstract
                                  </h4>
                                  <button
                                    onClick={() => openEditModal(abstract)}
                                    className="flex items-center gap-1 px-2 py-1 text-xs text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                    Edit Details
                                  </button>
                                </div>
                                
                                {/* Department & Category Info */}
                                <div className="mb-4 flex flex-wrap gap-2">
                                  <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded">
                                    {getDepartmentLabel(abstract.department)}
                                    {abstract.departmentOther && `: ${abstract.departmentOther}`}
                                  </span>
                                  <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded">
                                    {getCategoryLabel(abstract.category)}
                                  </span>
                                </div>

                                {abstract.abstractContent ? (
                                  <div className="space-y-3 text-sm text-slate-300">
                                    {[
                                      "background",
                                      "methods",
                                      "results",
                                      "conclusion",
                                    ].map((section) => (
                                      <div key={section}>
                                        <span className="text-slate-500 capitalize">
                                          {section}:{" "}
                                        </span>
                                        {abstract.abstractContent[section]}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-slate-300">
                                    {abstract.abstract}
                                  </p>
                                )}
                                {keywordsArray.length > 0 && (
                                  <div className="mt-3">
                                    <span className="text-xs text-slate-500">
                                      Keywords:{" "}
                                    </span>
                                    {keywordsArray.map((k, i) => (
                                      <span
                                        key={i}
                                        className="text-xs text-blue-400"
                                      >
                                        {k}
                                        {i < keywordsArray.length - 1
                                          ? ", "
                                          : ""}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div>
                                <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">
                                  Reviews ({abstract.reviews?.length || 0})
                                </h4>
                                {abstract.reviews &&
                                abstract.reviews.length > 0 ? (
                                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                                    {abstract.reviews.map((review, idx) => (
                                      <div
                                        key={idx}
                                        className="bg-slate-800 rounded-lg p-3"
                                      >
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-xs text-slate-500">
                                            Reviewer {idx + 1}
                                          </span>
                                          <span className="text-sm font-medium text-white">
                                            {review.totalScore?.toFixed(1)}/5
                                          </span>
                                        </div>
                                        {review.scores && (
                                          <div className="grid grid-cols-5 gap-2 mb-2">
                                            {[
                                              {
                                                key: "background",
                                                label: "BG",
                                              },
                                              {
                                                key: "methods",
                                                label: "MT",
                                              },
                                              {
                                                key: "results",
                                                label: "RS",
                                              },
                                              {
                                                key: "conclusions",
                                                label: "CN",
                                              },
                                              {
                                                key: "originality",
                                                label: "OR",
                                              },
                                            ].map(({ key, label }) => (
                                              <div
                                                key={key}
                                                className="text-center"
                                              >
                                                <div className="text-[10px] text-slate-600 uppercase">
                                                  {label}
                                                </div>
                                                <div className="text-sm text-slate-300">
                                                  {review.scores[key]}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                        {review.comments && (
                                          <p className="text-xs text-slate-500 italic mt-2 border-t border-slate-700 pt-2">
                                            {review.comments}
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-slate-600 italic">
                                    No reviews yet
                                  </p>
                                )}

                                {abstract.status === "accepted" && (
                                  <div className="mt-4 pt-4 border-t border-slate-700">
                                    <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                                      Author Response
                                    </h4>
                                    <div className="text-sm text-slate-300 space-y-1">
                                      <p>
                                        Status:{" "}
                                        {abstract.authorResponse ===
                                        "accepted"
                                          ? "Confirmed"
                                          : abstract.authorResponse ===
                                            "declined"
                                          ? "Declined"
                                          : "Awaiting response"}
                                      </p>
                                      <p>
                                        Showcase:{" "}
                                        {abstract.displayOnShowcase
                                          ? "Yes"
                                          : "No"}
                                      </p>
                                      {abstract.authorRespondedAt && (
                                        <p>
                                          Responded:{" "}
                                          {new Date(
                                            abstract.authorRespondedAt
                                          ).toLocaleDateString()}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {abstract.status !== "accepted" &&
                                  abstract.status !== "rejected" && (
                                    <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAccept(abstract.id);
                                        }}
                                        disabled={
                                          actionLoading === abstract.id
                                        }
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
                                        disabled={
                                          actionLoading === abstract.id
                                        }
                                        className="flex-1 px-4 py-2.5 bg-slate-700 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                      >
                                        <XCircle className="w-4 h-4" />
                                        Reject
                                      </button>
                                    </div>
                                  )}

                                {abstract.status === "accepted" &&
                                  (!abstract.authorResponse ||
                                    abstract.authorResponse ===
                                      "pending") && (
                                    <div className="mt-4 pt-4 border-t border-slate-700">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleResendEmail(abstract.id);
                                        }}
                                        disabled={
                                          actionLoading === abstract.id
                                        }
                                        className="w-full px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                      >
                                        <Mail className="w-4 h-4" />
                                        Resend Acceptance Email
                                      </button>
                                    </div>
                                  )}

                                {abstract.status === "accepted" &&
                                  abstract.authorResponse ===
                                    "accepted" && (
                                    <div className="mt-4 p-3 rounded-lg text-center bg-emerald-500/10 border border-emerald-500/30">
                                      <p className="text-sm font-medium text-emerald-400">
                                        ✓ Confirmed for presentation
                                      </p>
                                    </div>
                                  )}
                                {abstract.status === "rejected" && (
                                  <div className="mt-4 p-3 rounded-lg text-center bg-slate-800/50">
                                    <p className="text-sm font-medium text-slate-500">
                                      Not selected
                                    </p>
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

          {activeTab === "reviewers" && (
            <>
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
                      <div
                        key={reviewer.id}
                        className="px-4 py-3 grid grid-cols-12 gap-4 items-center hover:bg-slate-800/30 transition-colors"
                      >
                        <div className="col-span-1">
                          <input
                            type="checkbox"
                            checked={selectedReviewers.includes(
                              reviewer.id
                            )}
                            onChange={() =>
                              toggleReviewerSelection(reviewer.id)
                            }
                            className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                          />
                        </div>
                        <div className="col-span-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-slate-700 rounded-lg flex items-center justify-center text-white text-sm font-medium">
                              {reviewer.name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <span className="text-sm text-white font-medium">
                              {reviewer.name}
                            </span>
                          </div>
                        </div>
                        <div className="col-span-3">
                          <span className="text-sm text-slate-400">
                            {reviewer.email}
                          </span>
                        </div>
                        <div className="col-span-2 text-center">
                          <button
                            onClick={() =>
                              handleToggleAssignmentType(
                                reviewer.id,
                                reviewer.assignmentType
                              )
                            }
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              reviewer.assignmentType === "limited"
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : "bg-green-500/20 text-green-400 border border-green-500/30"
                            }`}
                            title={
                              reviewer.assignmentType === "all"
                                ? "Click to set limited access"
                                : "Click to give full access"
                            }
                          >
                            {reviewer.assignmentType === "limited" ? (
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
                        <div className="col-span-1 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-medium ${
                              reviewer.totalReviewsCompleted > 0
                                ? "bg-slate-700 text-white"
                                : "bg-slate-800 text-slate-500"
                            }`}
                          >
                            {reviewer.totalReviewsCompleted}
                          </span>
                        </div>
                        <div className="col-span-2 flex justify-end gap-2">
                          {reviewer.assignmentType === "limited" &&
                            reviewer.assignedAbstracts > 0 && (
                              <button
                                onClick={() =>
                                  handleClearAssignments(reviewer.id)
                                }
                                className="p-2 text-slate-500 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                                title="Clear assignments"
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
                  <div className="px-4 py-3 border-t border-slate-800 flex justify-between text-sm text-slate-500">
                    <span>
                      {reviewers.length} reviewers •{" "}
                      {
                        reviewers.filter(
                          (r) => r.assignmentType === "all"
                        ).length
                      }{" "}
                      full access •{" "}
                      {
                        reviewers.filter(
                          (r) => r.assignmentType === "limited"
                        ).length
                      }{" "}
                      limited
                    </span>
                    <span>
                      {reviewers.reduce(
                        (sum, r) => sum + r.totalReviewsCompleted,
                        0
                      )}{" "}
                      total reviews
                    </span>
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
                <p className="text-sm text-slate-500">
                  This cannot be undone
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-6">
              Removing{" "}
              <span className="text-white font-medium">
                {reviewerToDelete.name}
              </span>{" "}
              will delete all {reviewerToDelete.totalReviewsCompleted} of their
              reviews. Abstract scores will be recalculated.
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

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Shuffle className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">
                  Randomize Abstract Assignments
                </h3>
                <p className="text-sm text-slate-500">
                  Non-overlapping distribution
                </p>
              </div>
            </div>
            {assignmentResult && (
              <div
                className={`mb-4 p-4 rounded-lg ${
                  assignmentResult.success
                    ? "bg-green-500/10 border border-green-500/30"
                    : "bg-red-500/10 border border-red-500/30"
                }`}
              >
                <p
                  className={`text-sm ${
                    assignmentResult.success
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {assignmentResult.message}
                </p>
              </div>
            )}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Abstracts per Reviewer
                </label>
                <input
                  type="number"
                  value={abstractsPerReviewer}
                  onChange={(e) =>
                    setAbstractsPerReviewer(
                      Math.max(1, parseInt(e.target.value) || 1)
                    )
                  }
                  min="1"
                  max={pendingAbstractsCount}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {pendingAbstractsCount} abstracts available for review
                </p>
              </div>
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
                        onChange={() =>
                          toggleReviewerSelection(reviewer.id)
                        }
                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-600"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-white">
                          {reviewer.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {reviewer.email}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          reviewer.assignmentType === "limited"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {reviewer.assignmentType === "limited"
                          ? `Limited (${reviewer.assignedAbstracts})`
                          : "All"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              {selectedReviewers.length > 0 && (
                <div
                  className={`p-3 rounded-lg ${
                    selectedReviewers.length * abstractsPerReviewer <=
                    pendingAbstractsCount
                      ? "bg-blue-500/10 border border-blue-500/30"
                      : "bg-red-500/10 border border-red-500/30"
                  }`}
                >
                  <p
                    className={`text-sm ${
                      selectedReviewers.length * abstractsPerReviewer <=
                      pendingAbstractsCount
                        ? "text-blue-400"
                        : "text-red-400"
                    }`}
                  >
                    {selectedReviewers.length} reviewers ×{" "}
                    {abstractsPerReviewer} abstracts ={" "}
                    {selectedReviewers.length * abstractsPerReviewer} total
                    needed
                    {selectedReviewers.length * abstractsPerReviewer >
                      pendingAbstractsCount && (
                      <span className="block mt-1">
                        ⚠️ Not enough abstracts! Reduce reviewers or abstracts
                        per reviewer.
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
                  selectedReviewers.length * abstractsPerReviewer >
                    pendingAbstractsCount
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

      {/* Edit Abstract Modal */}
      {showEditModal && editingAbstract && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Edit3 className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Edit Abstract Details</h3>
                  <p className="text-sm text-slate-500 line-clamp-1">
                    {editingAbstract.title}
                  </p>
                </div>
              </div>
              <button
                onClick={closeEditModal}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {editError}
              </div>
            )}

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              {/* Primary Author Section */}
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center">
                    1
                  </span>
                  Primary Author
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">First Name</label>
                    <input
                      type="text"
                      value={editFormData.primaryAuthor.firstName}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          primaryAuthor: {
                            ...editFormData.primaryAuthor,
                            firstName: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={editFormData.primaryAuthor.lastName}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          primaryAuthor: {
                            ...editFormData.primaryAuthor,
                            lastName: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Degree</label>
                    <select
                      value={editFormData.primaryAuthor.degree}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          primaryAuthor: {
                            ...editFormData.primaryAuthor,
                            degree: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select</option>
                      {degrees.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Email</label>
                    <input
                      type="email"
                      value={editFormData.primaryAuthor.email}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          primaryAuthor: {
                            ...editFormData.primaryAuthor,
                            email: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Authors Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-slate-300">Additional Authors</h4>
                  <button
                    type="button"
                    onClick={addAdditionalAuthor}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add Author
                  </button>
                </div>
                {editFormData.additionalAuthors.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No additional authors</p>
                ) : (
                  <div className="space-y-3">
                    {editFormData.additionalAuthors.map((author, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900/50 border border-slate-700 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-slate-500">Author {idx + 2}</span>
                          <button
                            type="button"
                            onClick={() => removeAdditionalAuthor(idx)}
                            className="p-1 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={author.firstName}
                            onChange={(e) =>
                              updateAdditionalAuthor(idx, "firstName", e.target.value)
                            }
                            placeholder="First name"
                            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                          />
                          <input
                            type="text"
                            value={author.lastName}
                            onChange={(e) =>
                              updateAdditionalAuthor(idx, "lastName", e.target.value)
                            }
                            placeholder="Last name"
                            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                          />
                          <select
                            value={author.degree}
                            onChange={(e) =>
                              updateAdditionalAuthor(idx, "degree", e.target.value)
                            }
                            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                          >
                            <option value="">Degree</option>
                            {degrees.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Department & Category Section */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Department</label>
                  <select
                    value={editFormData.department}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        department: e.target.value,
                        departmentOther:
                          e.target.value !== "other" ? "" : editFormData.departmentOther,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Category</label>
                  <select
                    value={editFormData.category}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Other Department Field */}
              {editFormData.department === "other" && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Specify Department
                  </label>
                  <input
                    type="text"
                    value={editFormData.departmentOther}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        departmentOther: e.target.value,
                      })
                    }
                    placeholder="Enter department name"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-700">
              <button
                onClick={closeEditModal}
                className="flex-1 px-4 py-2.5 bg-slate-700 text-white text-sm font-medium rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={isSaving}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
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