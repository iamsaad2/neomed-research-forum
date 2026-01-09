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
} from "lucide-react";
import { abstractAPI } from "../services/api";

export default function ViewAbstractPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [abstract, setAbstract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const getStatusConfig = (status) => {
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
        label: "Accepted",
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

  const statusConfig = getStatusConfig(abstract.status);
  const StatusIcon = statusConfig.icon;

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
            {abstract.status === "accepted" && (
              <Award className="w-10 h-10 text-amber-500" />
            )}
          </div>
        </div>

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
              <p>• <strong>Review Period:</strong> January 7 - 28, 2026</p>
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

        {abstract.status === "accepted" && (
          <div className="mt-6 bg-green-50 rounded-2xl border border-green-200 p-6">
            <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Congratulations! 🎉
            </h3>
            <p className="text-sm text-green-800 mb-3">
              <strong>Your abstract has been accepted for presentation!</strong>
            </p>
            <div className="space-y-2 text-sm text-green-800">
              <p>• <strong>Next Step:</strong> Submit your final presentation slides by February 18, 2026</p>
              <p>• <strong>Forum Date:</strong> February 25, 2026</p>
              <p>• You will receive an email with presentation guidelines</p>
            </div>
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
    </div>
  );
}