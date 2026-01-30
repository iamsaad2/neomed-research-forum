import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Calendar,
  Mail,
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  Globe,
  Lock,
} from "lucide-react";
import { abstractAPI } from "../services/api";

// Microsoft Form URL for PowerPoint submission - UPDATE THIS WITH YOUR ACTUAL FORM URL
const POWERPOINT_FORM_URL = "https://forms.office.com/Pages/ResponsePage.aspx?id=VlbRrg7Hk0imjBM_xg7fNqrAjdKdTspBoH-ttwTLR8ZUNVg2OVJKUzREODFHOE5JWkQ5QjNSSlpBUy4u";

export default function ViewAbstractPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [abstract, setAbstract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Author response state
  const [displayOnShowcase, setDisplayOnShowcase] = useState(true);
  const [submittingResponse, setSubmittingResponse] = useState(false);
  const [responseError, setResponseError] = useState("");
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
  const [markingSubmitted, setMarkingSubmitted] = useState(false);

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

  const handleAccept = async () => {
    setSubmittingResponse(true);
    setResponseError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/abstracts/respond/${token}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            response: "accepted",
            displayOnShowcase: displayOnShowcase,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setAbstract(data.data);
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

  const handleDecline = async () => {
    setSubmittingResponse(true);
    setResponseError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/abstracts/respond/${token}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            response: "declined",
            displayOnShowcase: false,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setAbstract(data.data);
        setShowDeclineConfirm(false);
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

  const handleMarkPresentationSubmitted = async () => {
    setMarkingSubmitted(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/abstracts/mark-presentation/${token}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();
      if (data.success) {
        setAbstract(data.data);
      }
    } catch (err) {
      console.error("Error marking presentation as submitted:", err);
    } finally {
      setMarkingSubmitted(false);
    }
  };

  const getStatusConfig = (status, authorResponse) => {
    if (status === "accepted" && authorResponse === "declined") {
      return {
        icon: XCircle,
        label: "Participation Declined",
        bg: "bg-slate-50",
        border: "border-slate-200",
        text: "text-slate-600",
        iconColor: "text-slate-400",
      };
    }

    const configs = {
      pending: {
        icon: Clock,
        label: "Pending Review",
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-800",
        iconColor: "text-amber-500",
      },
      under_review: {
        icon: Eye,
        label: "Under Review",
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-800",
        iconColor: "text-blue-500",
      },
      accepted: {
        icon: CheckCircle,
        label: authorResponse === "accepted" ? "Confirmed" : "Accepted",
        bg: authorResponse === "accepted" ? "bg-emerald-50" : "bg-blue-50",
        border: authorResponse === "accepted" ? "border-emerald-200" : "border-blue-200",
        text: authorResponse === "accepted" ? "text-emerald-800" : "text-blue-800",
        iconColor: authorResponse === "accepted" ? "text-emerald-500" : "text-blue-500",
      },
      rejected: {
        icon: XCircle,
        label: "Not Selected",
        bg: "bg-slate-50",
        border: "border-slate-200",
        text: "text-slate-600",
        iconColor: "text-slate-400",
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
    if (!date) return "Thursday, February 5, 2026";
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
          <div className="inline-block w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 text-sm">Loading submission...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg border border-slate-200 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Submission Not Found</h2>
          <p className="text-slate-600 text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800 transition-colors"
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center text-slate-500 hover:text-slate-700 mb-6 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Home
        </button>

        {/* Action Required Card - Clean and Professional */}
        {needsResponse && (
          <div className="bg-white border border-slate-200 rounded-lg mb-6 overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Your abstract has been accepted
              </h2>
              <p className="text-sm text-red-600 font-semibold mt-1">
                Please confirm your participation by Friday, February 6, 2026 at 11:59 PM
              </p>
            </div>
            
            <div className="p-6">
              {responseError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {responseError}
                </div>
              )}

              {/* Showcase Option - One-time choice before accepting */}
              <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={displayOnShowcase}
                    onChange={(e) => setDisplayOnShowcase(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-slate-900">
                      Display my abstract on the public showcase
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Your abstract will appear on the Accepted Abstracts page. This choice cannot be changed after you confirm.
                    </p>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAccept}
                  disabled={submittingResponse}
                  className="flex-1 px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingResponse ? "Submitting..." : "Accept & Confirm Participation"}
                </button>
                <button
                  onClick={() => setShowDeclineConfirm(true)}
                  disabled={submittingResponse}
                  className="px-5 py-2.5 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div className={`${statusConfig.bg} ${statusConfig.border} border rounded-lg px-4 py-3 mb-6 flex items-center gap-3`}>
          <StatusIcon className={`w-5 h-5 ${statusConfig.iconColor}`} />
          <div>
            <span className={`text-sm font-medium ${statusConfig.text}`}>
              {statusConfig.label}
            </span>
            <p className={`text-xs ${statusConfig.text} opacity-75 mt-0.5`}>
              {abstract.statusMessage}
            </p>
          </div>
        </div>

        {/* Confirmed - Next Steps with PowerPoint Submission */}
        {hasAccepted && (
          <div className="bg-white border border-slate-200 rounded-lg mb-6 overflow-hidden">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="font-semibold text-slate-900">Next Steps</h3>
            </div>
            <div className="p-6 space-y-4">
              {/* PowerPoint Submission */}
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ExternalLink className="w-4 h-4 text-slate-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Submit Presentation Slides</p>
                  <p className="text-sm text-red-600 font-semibold mt-1">
                    Due: Saturday, February 21, 2026 at 11:59 PM
                  </p>
                  
                  {/* Presentation Guidelines */}
                  <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="text-sm font-medium text-slate-900 mb-2">Presentation Guidelines</p>
                    <ul className="text-sm text-slate-700 space-y-1">
                      <li>• Presentations should be approximately 5 minutes in length</li>
                      <li>• Please limit your presentation to 7 slides or fewer</li>
                    </ul>
                  </div>
                  
                  <div className="mt-4 space-y-3">
                    <a
                      href={POWERPOINT_FORM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0077AA] text-white text-sm font-medium rounded-lg hover:bg-[#005F89] transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Submit PowerPoint via Form
                    </a>
                    
                    {abstract.presentationSubmitted ? (
                      <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-lg">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Presentation submitted successfully!</span>
                      </div>
                    ) : (
                      <div className="pt-2">
                        <button
                          onClick={handleMarkPresentationSubmitted}
                          disabled={markingSubmitted}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-300 text-emerald-700 text-sm font-medium rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {markingSubmitted ? "Confirming..." : "I have submitted my PowerPoint"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Showcase Status - Read only after confirmation */}
              <div className="flex items-start gap-4 pt-4 border-t border-slate-100">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {abstract.displayOnShowcase ? (
                    <Globe className="w-4 h-4 text-slate-600" />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Public Showcase</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {abstract.displayOnShowcase 
                      ? "Your abstract is displayed on the public showcase" 
                      : "Your abstract is not publicly displayed"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Declined Message */}
        {hasDeclined && (
          <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6">
            <p className="text-sm text-slate-600">
              You have declined the presentation spot. Thank you for your submission to NEOMED Research Forum 2026.
            </p>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded">
                {getCategoryLabel(abstract.category)}
              </span>
              <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded">
                {abstract.departmentOther || getDepartmentLabel(abstract.department)}
              </span>
            </div>

            <h1 className="text-xl font-semibold text-slate-900 mb-2">
              {abstract.title}
            </h1>

            <p className="text-sm text-slate-600">{abstract.allAuthors}</p>

            {abstract.keywords && abstract.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {abstract.keywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Meta Info - Removed PDF view */}
          <div className="grid sm:grid-cols-2 gap-4 p-6 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Contact</p>
                <p className="text-sm text-slate-900">{abstract.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Submitted</p>
                <p className="text-sm text-slate-900">
                  {new Date(abstract.submittedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Abstract Content */}
          <div className="p-6">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Abstract</h3>
            <div className="space-y-4">
              {abstract.abstractContent?.background ? (
                <>
                  {["background", "methods", "results", "conclusion"].map((section) => (
                    <div key={section}>
                      <h4 className="text-xs font-semibold text-slate-700 uppercase mb-1.5">
                        {section}
                      </h4>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {abstract.abstractContent[section]}
                      </p>
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                  {abstract.fullAbstract}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Timeline Info */}
        {abstract.status === "pending" && (
          <div className="mt-6 bg-white border border-slate-200 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Timeline</h3>
            <div className="space-y-2 text-sm text-slate-600">
              <p>• Review Period: January 13 – 28, 2026</p>
              <p>• Decision Notification: January 28, 2026</p>
            </div>
          </div>
        )}

        {abstract.status === "under_review" && (
          <div className="mt-6 bg-white border border-slate-200 rounded-lg p-5">
            <p className="text-sm text-slate-600">
              Your abstract is being evaluated. You will receive an email when a decision is made.
            </p>
          </div>
        )}

        {abstract.status === "rejected" && (
          <div className="mt-6 bg-white border border-slate-200 rounded-lg p-5">
            <p className="text-sm text-slate-600">
              Thank you for your submission. We encourage you to continue your research and consider submitting to future forums.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500">
            Questions? Contact{" "}
            <a href="mailto:sbadat@neomed.edu" className="text-blue-600 hover:underline">
              sbadat@neomed.edu
            </a>
          </p>
        </div>
      </div>

      {/* Decline Confirmation Modal */}
      {showDeclineConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Decline Presentation?
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to decline? This will give up your presentation spot and cannot be undone.
            </p>
            
            {responseError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {responseError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeclineConfirm(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                disabled={submittingResponse}
              >
                Cancel
              </button>
              <button
                onClick={handleDecline}
                disabled={submittingResponse}
                className="flex-1 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {submittingResponse ? "Processing..." : "Yes, Decline"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}