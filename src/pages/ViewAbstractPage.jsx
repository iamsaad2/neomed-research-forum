import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
} from "lucide-react";
import { abstractAPI } from "../services/api";

export default function ViewAbstractPage() {
  const { token } = useParams();
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

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: {
        icon: Clock,
        color: "yellow",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        textColor: "text-yellow-900",
        iconColor: "text-yellow-600",
        label: "Pending Review",
      },
      under_review: {
        icon: Eye,
        color: "blue",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        textColor: "text-blue-900",
        iconColor: "text-blue-600",
        label: "Under Review",
      },
      accepted: {
        icon: CheckCircle,
        color: "green",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        textColor: "text-green-900",
        iconColor: "text-green-600",
        label: "Accepted",
      },
      rejected: {
        icon: XCircle,
        color: "red",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        textColor: "text-red-900",
        iconColor: "text-red-600",
        label: "Not Selected",
      },
    };

    return statusMap[status] || statusMap.pending;
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
      <div className="min-h-screen py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600">Loading your submission...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-900 mb-2">Submission Not Found</h2>
            <p className="text-red-800 mb-6">{error}</p>
            <button
              onClick={() => (window.location.href = "/")}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(abstract.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen py-16 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Your Submission</h1>
          <p className="text-slate-600">NEOMED Research Forum 2025</p>
        </div>

        {/* Status Banner */}
        <div
          className={`${statusInfo.bgColor} ${statusInfo.borderColor} border-2 rounded-lg p-6 mb-6`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <StatusIcon className={`w-8 h-8 ${statusInfo.iconColor}`} />
              <div>
                <h2 className={`text-2xl font-bold ${statusInfo.textColor}`}>
                  {statusInfo.label}
                </h2>
                <p className={`text-sm ${statusInfo.textColor} mt-1`}>
                  {abstract.statusMessage}
                </p>
              </div>
            </div>
            {abstract.status === "accepted" && (
              <Award className="w-12 h-12 text-yellow-500" />
            )}
          </div>
        </div>

        {/* Abstract Details */}
        <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">{abstract.title}</h2>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-2">Authors</h3>
              <p className="text-slate-900">{abstract.allAuthors}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-2">Contact Email</h3>
              <p className="text-slate-900 flex items-center">
                <Mail className="w-4 h-4 mr-2 text-slate-400" />
                {abstract.email}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-2">Department</h3>
              <p className="text-slate-900">
                {abstract.departmentOther || getDepartmentLabel(abstract.department)}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-2">Category</h3>
              <p className="text-slate-900">{getCategoryLabel(abstract.category)}</p>
            </div>

            {abstract.keywords && abstract.keywords.length > 0 && (
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-slate-500 mb-2">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {abstract.keywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-2">Submitted</h3>
              <p className="text-slate-900 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                {new Date(abstract.submittedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            {abstract.hasPDF && (
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">PDF Attachment</h3>
                <div className="flex items-center gap-3">
                  <p className="text-slate-900 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-green-600" />
                    Uploaded ✓
                  </p>
                  {abstract.pdfUrl && (
                    <a
                      href={`${import.meta.env.VITE_API_URL}${abstract.pdfUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      View PDF
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-sm font-medium text-slate-500 mb-3">Abstract</h3>
            <div className="space-y-4">
              {abstract.abstractContent?.background && (
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-1">BACKGROUND</p>
                  <p className="text-slate-900 leading-relaxed">
                    {abstract.abstractContent.background}
                  </p>
                </div>
              )}
              {abstract.abstractContent?.methods && (
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-1">METHODS</p>
                  <p className="text-slate-900 leading-relaxed">
                    {abstract.abstractContent.methods}
                  </p>
                </div>
              )}
              {abstract.abstractContent?.results && (
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-1">RESULTS</p>
                  <p className="text-slate-900 leading-relaxed">
                    {abstract.abstractContent.results}
                  </p>
                </div>
              )}
              {abstract.abstractContent?.conclusion && (
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-1">CONCLUSION</p>
                  <p className="text-slate-900 leading-relaxed">
                    {abstract.abstractContent.conclusion}
                  </p>
                </div>
              )}
              
              {/* Fallback to fullAbstract if abstractContent sections are not available */}
              {!abstract.abstractContent?.background && abstract.fullAbstract && (
                <p className="text-slate-900 whitespace-pre-line leading-relaxed">
                  {abstract.fullAbstract}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Timeline/Next Steps */}
        {abstract.status === "pending" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3">📅 What Happens Next?</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• <strong>Review Period:</strong> January 7 - 28, 2025</li>
              <li>• <strong>Decision Notification:</strong> January 28, 2025</li>
              <li>• <strong>Check back here</strong> to see status updates</li>
            </ul>
          </div>
        )}

        {abstract.status === "under_review" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3">🔍 Currently Under Review</h3>
            <p className="text-sm text-blue-800">
              Your abstract is being evaluated by our review committee. 
              You'll receive an email notification when a decision is made (by January 28, 2025).
            </p>
          </div>
        )}

        {abstract.status === "accepted" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-green-900 mb-3 flex items-center">
              <Award className="w-5 h-5 mr-2" />
              🎉 Congratulations!
            </h3>
            <div className="space-y-2 text-sm text-green-800">
              <p><strong>Your abstract has been accepted for presentation!</strong></p>
              <ul className="mt-3 space-y-2">
                <li>• <strong>Next Step:</strong> Submit your final presentation slides by February 18, 2025</li>
                <li>• <strong>Forum Date:</strong> February 25, 2025</li>
                <li>• <strong>Important:</strong> You will receive an email with presentation guidelines</li>
              </ul>
            </div>
          </div>
        )}

        {abstract.status === "rejected" && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-slate-900 mb-3">Thank You for Your Submission</h3>
            <p className="text-sm text-slate-700">
              While your abstract wasn't selected for this year's forum, we encourage you to 
              continue your research and consider submitting to future NEOMED Research Forums. 
              We appreciate your contribution to advancing medical research.
            </p>
          </div>
        )}

        {/* Important Note */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-900">
            <strong>📌 Bookmark this page</strong> - This is your unique link to view your submission. 
            You can return to this page anytime to check your status.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center">
          <button
            onClick={() => (window.location.href = "/")}
            className="px-6 py-3 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
          >
            Return to Home
          </button>
          <p className="mt-4 text-sm text-slate-600">
            Questions? Contact{" "}
            <a
              href="mailto:sbadat@neomed.edu"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              sbadat@neomed.edu
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}