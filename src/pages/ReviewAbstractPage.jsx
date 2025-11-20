import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  CheckCircle,
  FileText,
  Send,
  AlertCircle,
} from "lucide-react";

export default function ReviewAbstractPage() {
  const { abstractId } = useParams();
  const navigate = useNavigate();
  const [abstract, setAbstract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState(0);
  const [comments, setComments] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("reviewerToken");
    if (!token) {
      navigate("/review");
      return;
    }

    fetchAbstract(token);
  }, [abstractId, navigate]);

  const fetchAbstract = async (token) => {
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
        const foundAbstract = data.data.find((a) => a.id === abstractId);
        if (foundAbstract) {
          setAbstract(foundAbstract);
        } else {
          setError("Abstract not found");
        }
      }
    } catch (err) {
      console.error("Error fetching abstract:", err);
      setError("Failed to load abstract");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (score < 1 || score > 10) {
      setError("Please select a score between 1 and 10");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("reviewerToken");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reviewers/review/${abstractId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ score, comments }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/reviewer/dashboard");
        }, 2000);
      } else {
        setError(data.message || "Failed to submit review");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setError("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
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
            <div className="inline-block w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600">Loading abstract...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !abstract) {
    return (
      <div className="min-h-screen py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-900 mb-2">{error}</h2>
            <button
              onClick={() => navigate("/reviewer/dashboard")}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-900 mb-2">
              Review Submitted Successfully!
            </h2>
            <p className="text-green-700 mb-4">
              Thank you for reviewing this abstract.
            </p>
            <p className="text-sm text-green-600">Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/reviewer/dashboard")}
          className="flex items-center text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>

        {/* Abstract Details */}
        <div className="bg-white border border-slate-200 rounded-lg p-8 mb-6">
          <div className="mb-6">
            {abstract.hasReviewed && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <p className="text-green-800 font-medium">
                  You have already reviewed this abstract
                </p>
              </div>
            )}

            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              {abstract.title}
            </h1>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">Authors</h3>
                <p className="text-slate-900">{abstract.authors}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">Department</h3>
                <p className="text-slate-900">{getDepartmentLabel(abstract.department)}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">Category</h3>
                <p className="text-slate-900">{getCategoryLabel(abstract.category)}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">Reviews</h3>
                <p className="text-slate-900 flex items-center">
                  <Star className="w-4 h-4 mr-1 text-yellow-500" />
                  {abstract.reviewCount} review{abstract.reviewCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {abstract.keywords && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-500 mb-2">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(abstract.keywords) 
                    ? abstract.keywords 
                    : abstract.keywords.split(",")
                  ).map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full"
                    >
                      {typeof keyword === 'string' ? keyword.trim() : keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-3">Abstract</h3>
              <div className="space-y-4">
                {/* Check if abstractContent exists and display structured */}
                {abstract.abstractContent?.background ? (
                  <>
                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-1">BACKGROUND</p>
                      <p className="text-slate-900 leading-relaxed">
                        {abstract.abstractContent.background}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-1">METHODS</p>
                      <p className="text-slate-900 leading-relaxed">
                        {abstract.abstractContent.methods}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-1">RESULTS</p>
                      <p className="text-slate-900 leading-relaxed">
                        {abstract.abstractContent.results}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-1">CONCLUSION</p>
                      <p className="text-slate-900 leading-relaxed">
                        {abstract.abstractContent.conclusion}
                      </p>
                    </div>
                  </>
                ) : (
                  /* Fallback to plain abstract text */
                  <p className="text-slate-900 whitespace-pre-line leading-relaxed">
                    {abstract.abstract}
                  </p>
                )}
              </div>
            </div>

            {abstract.hasPDF && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  PDF attachment available
                </p>

                <p>PDF attachment available</p>
<a href={pdfUrl} target="_blank">
  View PDF
</a>
              </div>
            )}
          </div>
        </div>

        {/* Review Form */}
        {!abstract.hasReviewed && (
          <div className="bg-white border border-slate-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Submit Your Review</h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-900 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-6">
              {/* Score Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Score (1-10) *
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setScore(num)}
                      className={`flex-1 py-3 text-center font-semibold rounded-lg transition-all ${
                        score === num
                          ? "bg-purple-600 text-white scale-110 shadow-lg"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  1 = Poor, 5 = Average, 10 = Excellent
                </p>
              </div>

              {/* Comments */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Comments (Optional)
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  rows="6"
                  placeholder="Provide feedback on methodology, clarity, significance, etc."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || score === 0}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors flex items-center justify-center ${
                  submitting || score === 0
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-700"
                }`}
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Submit Review
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}