import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  FileText,
  Calendar,
  Mail,
  AlertCircle,
  Award,
  ArrowLeft,
  Download,
  PartyPopper,
  Upload,
  ThumbsUp,
  ThumbsDown,
  Globe,
  GlobeLock,
} from "lucide-react";
import { abstractAPI } from "../services/api";

export default function ViewAbstractPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [abstract, setAbstract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Author response state
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseType, setResponseType] = useState(null); // 'accept' or 'decline'
  const [displayOnShowcase, setDisplayOnShowcase] = useState(true);
  const [submittingResponse, setSubmittingResponse] = useState(false);
  const [responseError, setResponseError] = useState("");

  useEffect(() => {
    fetchAbstract();
  }, [token]);

  const fetchAbstract = async () => {
    try {
      setLoading(true);
      const response = await abstractAPI.getByToken(token);

      if (response.success) {
        setAbstract(response.data);
      }
    } catch (err) {
      console.error("Error fetching abstract:", err);
      setError(err.message || "Failed to load submission. Please check your link.");
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorResponse = async () => {
    setSubmittingResponse(true);
    setResponseError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/abstracts/respond/${token}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            response: responseType === "accept" ? "accepted" : "declined",
            displayOnShowcase: responseType === "accept" ? displayOnShowcase : false,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setAbstract(data.data);
        setShowResponseModal(false);
      } else {
        setResponseError(data.message || "Failed to submit response");
      }
    } catch (err) {
      console.error("Error submitting response:", err);
      setResponseError("Failed to submit response. Please try again.");
    } finally {
      setSubmittingResponse(false);
    }
  };

  const handleShowcaseToggle = async (newValue) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/abstracts/showcase/${token}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            displayOnShowcase: newValue,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setAbstract(data.data);
      }
    } catch (err) {
      console.error("Error updating showcase preference:", err);
    }
  };

  const getStatusConfig = (status, authorResponse) => {
    // Special case: accepted but author declined
    if (status === "accepted" && authorResponse === "declined") {
      return {
        icon: XCircle,
        label: "Participation Declined",
        bg: "bg-slate-50",
        border: "border-slate-200",
        text: "text-slate-700",
        iconBg: "bg-slate-100",
        iconColor: "text-slate-600",
      };
    }

    const configs = {
      pending: {
        icon: Clock,
        label: "Pending Review",
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-700",
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
      },
      under_review: {
        icon: Eye,
        label: "Under Review",
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-700",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
      },
      accepted: {
        icon: CheckCircle,
        label: authorResponse === "accepted" ? "Confirmed for Presentation" : "Accepted - Response Needed",
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-700",
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
      },
      rejected: {
        icon: XCircle,
        label: "Not Selected",
        bg: "bg-slate-50",
        border: "border-slate-200",
        text: "text-slate-700",
        iconBg: "bg-slate-100",
        iconColor: "text-slate-600",
      },
    };
    return configs[status] || configs.pending;
  };

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

  const formatDeadline = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-3 border-[#0099CC] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500">Loading your submission...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-red-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Submission Not Found</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(abstract.status, abstract.authorResponse);
  const StatusIcon = statusConfig.icon;
  const needsResponse = abstract.status === "accepted" && (!abstract.authorResponse || abstract.authorResponse === "pending");
  const hasAccepted = abstract.status === "accepted" && abstract.authorResponse === "accepted";
  const hasDeclined = abstract.status === "accepted" && abstract.authorResponse === "declined";

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">Back to Home</span>
        </button>

        {/* ACTION REQUIRED BANNER - Only show if accepted and needs response */}
        {needsResponse && (
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 mb-6 text-white shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <PartyPopper className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">🎉 Congratulations!</h2>
                <p className="text-green-100 mb-4">
                  Your abstract has been accepted for presentation at NEOMED Research Forum 2026!
                </p>
                
                <div className="bg-white/10 rounded-lg p-4 mb-4">
                  <p className="font-semibold mb-1">⚠️ Action Required</p>
                  <p className="text-sm text-green-100">
                    Please confirm your participation by{" "}
                    <span className="font-bold text-white">
                      {formatDeadline(abstract.authorResponseDeadline) || "Thursday, February 5th, 2026"}
                    </span>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setResponseType("accept");
                      setShowResponseModal(true);
                    }}
                    className="flex-1 px-6 py-3 bg-white text-green-700 font-semibold rounded-xl hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <ThumbsUp className="w-5 h-5" />
                    Accept & Confirm Participation
                  </button>
                  <button
                    onClick={() => {
                      setResponseType("decline");
                      setShowResponseModal(true);
                    }}
                    className="px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <ThumbsDown className="w-5 h-5" />
                    Decline
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Banner */}
        <div className={`${statusConfig.bg} ${statusConfig.border} border rounded-2xl p-5 mb-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${statusConfig.iconBg} rounded-xl flex items-center justify-center`}>
                <StatusIcon className={`w-6 h-6 ${statusConfig.iconColor}`} />
              </div>
              <div>
                <h2 className={`text-lg font-semibold ${statusConfig.text}`}>
                  {statusConfig.label}
                </h2>
                <p className={`text-sm ${statusConfig.text} opacity-80`}>
                  {abstract.statusMessage}
                </p>
              </div>
            </div>
            {hasAccepted && (
              <Award className="w-10 h-10 text-amber-500" />
            )}
          </div>
        </div>

        {/* Presentation Submission Card - Show after author accepts */}
        {hasAccepted && (
          <div className="bg-white rounded-2xl border border-blue-200 p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-1">Presentation Slides</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Please submit your presentation slides by{" "}
                  <span className="font-semibold text-blue-700">
                    {formatDeadline(abstract.presentationDeadline) || "Saturday, February 21st, 2026"}
                  </span>
                </p>
                
                {abstract.presentationFile?.filename ? (
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <FileText className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800">{abstract.presentationFile.filename}</p>
                      <p className="text-xs text-green-600">
                        Uploaded {new Date(abstract.presentationFile.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      <strong>Coming Soon:</strong> Presentation upload will be available shortly. 
                      You will receive an email with instructions on how to submit your slides.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Showcase Preference Toggle */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {abstract.displayOnShowcase ? (
                    <Globe className="w-5 h-5 text-green-600" />
                  ) : (
                    <GlobeLock className="w-5 h-5 text-slate-400" />
                  )}
                  <div>
                    <p className="font-medium text-slate-900">Public Showcase</p>
                    <p className="text-sm text-slate-500">
                      {abstract.displayOnShowcase 
                        ? "Your abstract is visible on the public showcase" 
                        : "Your abstract is not displayed publicly"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleShowcaseToggle(!abstract.displayOnShowcase)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    abstract.displayOnShowcase ? "bg-green-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      abstract.displayOnShowcase ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Author Declined Card */}
        {hasDeclined && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
            <h3 className="font-semibold text-slate-900 mb-2">Thank You for Your Submission</h3>
            <p className="text-slate-600">
              You have declined the presentation spot for this abstract. We appreciate your 
              submission to NEOMED Research Forum 2026 and encourage you to participate in future forums.
            </p>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {/* Header */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                {getCategoryLabel(abstract.category)}
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                {abstract.departmentOther || getDepartmentLabel(abstract.department)}
              </span>
            </div>

            <h1 className="text-2xl font-semibold text-slate-900 mb-3">
              {abstract.title}
            </h1>

            <p className="text-slate-600">{abstract.allAuthors}</p>

            {abstract.keywords && abstract.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {abstract.keywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-blue-50 text-[#0077AA] text-xs rounded"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Meta Info */}
          <div className="grid sm:grid-cols-3 gap-4 p-6 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                <Mail className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Contact</p>
                <p className="text-sm text-slate-900 font-medium truncate">{abstract.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                <Calendar className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Submitted</p>
                <p className="text-sm text-slate-900 font-medium">
                  {new Date(abstract.submittedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            {abstract.hasPDF && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Attachment</p>
                  {abstract.pdfUrl ? (
                    <a
                      href={`${import.meta.env.VITE_API_URL}${abstract.pdfUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#0077AA] font-medium hover:underline flex items-center gap-1"
                    >
                      View PDF
                      <Download className="w-3 h-3" />
                    </a>
                  ) : (
                    <p className="text-sm text-slate-900 font-medium">PDF Uploaded</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Abstract Content */}
          <div className="p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Abstract</h3>
            <div className="space-y-5">
              {abstract.abstractContent?.background ? (
                <>
                  <div>
                    <h4 className="text-xs font-semibold text-[#0077AA] uppercase tracking-wide mb-2">
                      Background
                    </h4>
                    <p className="text-slate-700 leading-relaxed">
                      {abstract.abstractContent.background}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#0077AA] uppercase tracking-wide mb-2">
                      Methods
                    </h4>
                    <p className="text-slate-700 leading-relaxed">
                      {abstract.abstractContent.methods}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#0077AA] uppercase tracking-wide mb-2">
                      Results
                    </h4>
                    <p className="text-slate-700 leading-relaxed">
                      {abstract.abstractContent.results}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#0077AA] uppercase tracking-wide mb-2">
                      Conclusion
                    </h4>
                    <p className="text-slate-700 leading-relaxed">
                      {abstract.abstractContent.conclusion}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                  {abstract.fullAbstract}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Status-specific Info Cards */}
        {abstract.status === "pending" && (
          <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#0077AA]" />
              What Happens Next?
            </h3>
            <div className="space-y-2 text-sm text-slate-600">
              <p>• <strong>Review Period:</strong> January 13 - 28, 2026</p>
              <p>• <strong>Decision Notification:</strong> January 28, 2026</p>
              <p>• Check back here anytime to see status updates</p>
            </div>
          </div>
        )}

        {abstract.status === "under_review" && (
          <div className="mt-6 bg-blue-50 rounded-2xl border border-blue-200 p-6">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Currently Under Review
            </h3>
            <p className="text-sm text-blue-800">
              Your abstract is being evaluated by our review committee. 
              You'll receive an email notification when a decision is made (by January 28, 2026).
            </p>
          </div>
        )}

        {abstract.status === "rejected" && (
          <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-2">Thank You for Your Submission</h3>
            <p className="text-sm text-slate-600">
              While your abstract wasn't selected for this year's forum, we encourage you to 
              continue your research and consider submitting to future NEOMED Research Forums. 
              We appreciate your contribution to advancing medical research.
            </p>
          </div>
        )}

        {/* Bookmark Reminder */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm text-amber-800">
            <span className="font-semibold">📌 Bookmark this page</span> — This is your unique link to view your submission. Return anytime to check your status.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
          >
            Return to Home
          </button>
          <p className="mt-4 text-sm text-slate-500">
            Questions? Contact{" "}
            <a
              href="mailto:sbadat@neomed.edu"
              className="text-[#0077AA] hover:underline font-medium"
            >
              sbadat@neomed.edu
            </a>
          </p>
        </div>
      </div>

      {/* Response Modal */}
      {showResponseModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            {responseType === "accept" ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ThumbsUp className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Confirm Your Participation
                  </h3>
                  <p className="text-slate-600">
                    You're accepting to present your abstract at NEOMED Research Forum 2026.
                  </p>
                </div>

                {/* Showcase Option */}
                <div className="bg-slate-50 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="showcase"
                      checked={displayOnShowcase}
                      onChange={(e) => setDisplayOnShowcase(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-slate-300 text-green-600 focus:ring-green-500"
                    />
                    <label htmlFor="showcase" className="cursor-pointer">
                      <p className="font-medium text-slate-900">Display on Public Showcase</p>
                      <p className="text-sm text-slate-500">
                        Allow your abstract to be displayed on our website's Accepted Abstracts page
                      </p>
                    </label>
                  </div>
                </div>

                {responseError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {responseError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowResponseModal(false)}
                    className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                    disabled={submittingResponse}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAuthorResponse}
                    disabled={submittingResponse}
                    className="flex-1 px-4 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submittingResponse ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Confirming...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Confirm Participation
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ThumbsDown className="w-8 h-8 text-slate-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Decline Presentation
                  </h3>
                  <p className="text-slate-600">
                    Are you sure you want to decline your presentation spot? This action cannot be undone.
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> By declining, you are giving up your presentation slot. 
                    Your abstract will not be presented at the forum.
                  </p>
                </div>

                {responseError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {responseError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowResponseModal(false)}
                    className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                    disabled={submittingResponse}
                  >
                    Go Back
                  </button>
                  <button
                    onClick={handleAuthorResponse}
                    disabled={submittingResponse}
                    className="flex-1 px-4 py-3 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submittingResponse ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Yes, Decline"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
