import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  Send,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

// Rubric criteria definitions
const RUBRIC_CRITERIA = [
  {
    id: "background",
    title: "Background & Objective",
    description: "Clarity of background, identified gap, and objective or hypothesis.",
    levels: [
      { score: 5, label: "Excellent", description: "Very clear and concise background, specific gap, and focused objective or hypothesis that is clearly relevant." },
      { score: 4, label: "Good", description: "Clear background and objective; gap is present but could be sharper or more concise." },
      { score: 3, label: "Satisfactory", description: "Background and objective are present but somewhat vague, generic, or loosely connected to a gap." },
      { score: 2, label: "Weak", description: "Background and/or objective are confusing, incomplete, or minimally related to a clear question." },
      { score: 1, label: "Poor", description: "No clear background or objective; relevance is hard to determine." },
    ],
  },
  {
    id: "methods",
    title: "Study Design & Methods",
    description: "Appropriateness and clarity of study design, data source, variables, and analysis.",
    levels: [
      { score: 5, label: "Excellent", description: "Design clearly described and appropriate; population/data source, key variables, and analysis are well specified and feasible." },
      { score: 4, label: "Good", description: "Design and methods mostly clear and appropriate; only minor details are missing." },
      { score: 3, label: "Satisfactory", description: "Methods described but incomplete or somewhat vague; generally appropriate but important pieces are underdeveloped." },
      { score: 2, label: "Weak", description: "Methods hard to follow, missing key elements, or only loosely aligned with the objective." },
      { score: 1, label: "Poor", description: "Methods absent or clearly inappropriate." },
    ],
  },
  {
    id: "results",
    title: "Results",
    description: "Quality and clarity of reported results.",
    levels: [
      { score: 5, label: "Excellent", description: "Key findings clearly presented with appropriate numbers or themes; results directly address the objective and can be understood from the abstract alone." },
      { score: 4, label: "Good", description: "Main findings presented and generally clear, but some detail is limited." },
      { score: 3, label: "Satisfactory", description: "Results present but somewhat incomplete, descriptive, or only partially linked to the objective." },
      { score: 2, label: "Weak", description: "Results minimal, vague, or difficult to interpret; little evidence that the analysis is complete." },
      { score: 1, label: "Poor", description: "No real results presented." },
    ],
  },
  {
    id: "conclusions",
    title: "Conclusions",
    description: "Extent to which conclusions follow from results and state clear take-home messages.",
    levels: [
      { score: 5, label: "Excellent", description: "Conclusions clearly supported by the results and state specific, realistic take-home messages." },
      { score: 4, label: "Good", description: "Conclusions mostly supported by results and offer reasonable take-home points, with minor overstatement or vagueness." },
      { score: 3, label: "Satisfactory", description: "Conclusions are general, mainly restate results, or only lightly touch on meaning." },
      { score: 2, label: "Weak", description: "Conclusions unclear, weakly supported by results, or substantially overstate what the data show." },
      { score: 1, label: "Poor", description: "Conclusions missing, unrelated to results, or clearly inappropriate." },
    ],
  },
  {
    id: "originality",
    title: "Originality & Writing Quality",
    description: "Novelty of the work and clarity of writing (organization, grammar, spelling).",
    levels: [
      { score: 5, label: "Excellent", description: "Clearly original or addresses an important gap; writing is very clear, well organized, and free of noticeable grammar or spelling errors." },
      { score: 4, label: "Good", description: "Shows some originality or important application; writing is generally clear and well organized with only minor language issues." },
      { score: 3, label: "Satisfactory", description: "Incremental or modestly original; writing is understandable but may be dense or awkward, with several minor errors." },
      { score: 2, label: "Weak", description: "Limited originality or importance; writing is confusing or poorly organized with frequent grammar or spelling issues." },
      { score: 1, label: "Poor", description: "Little or no originality; writing is very hard to follow due to organization or language problems." },
    ],
  },
];

const SCORE_LABELS = {
  1: "Poor",
  2: "Weak", 
  3: "Satisfactory",
  4: "Good",
  5: "Excellent"
};

export default function ReviewAbstractPage() {
  const { abstractId } = useParams();
  const navigate = useNavigate();
  const [abstract, setAbstract] = useState(null);
  const [allAbstracts, setAllAbstracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [scores, setScores] = useState({
    background: 0,
    methods: 0,
    results: 0,
    conclusions: 0,
    originality: 0,
  });
  const [previousReview, setPreviousReview] = useState(null);
  const [comments, setComments] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [expandedCriterion, setExpandedCriterion] = useState(null);
  const [hideAuthors, setHideAuthors] = useState(() => {
    const saved = localStorage.getItem("hideAuthors");
    return saved === "true";
  });
  const [nextPendingAbstract, setNextPendingAbstract] = useState(null);

  // Reset state when abstractId changes
  useEffect(() => {
    // Reset all form state when navigating to a new abstract
    setScores({
      background: 0,
      methods: 0,
      results: 0,
      conclusions: 0,
      originality: 0,
    });
    setPreviousReview(null);
    setComments("");
    setError("");
    setSuccess(false);
    setExpandedCriterion(null);
    setAbstract(null);
    setLoading(true);

    const token = localStorage.getItem("reviewerToken");
    if (!token) {
      navigate("/review");
      return;
    }

    fetchAbstract(token);
    fetchMyReview(token);
    fetchAllAbstracts(token);
  }, [abstractId, navigate]);

  // Persist hide authors preference
  useEffect(() => {
    localStorage.setItem("hideAuthors", hideAuthors.toString());
  }, [hideAuthors]);

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

  const fetchAllAbstracts = async (token) => {
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
        setAllAbstracts(data.data);
        // Find next pending abstract (not the current one)
        const pendingAbstracts = data.data.filter(a => !a.hasReviewed && a.id !== abstractId);
        if (pendingAbstracts.length > 0) {
          setNextPendingAbstract(pendingAbstracts[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching all abstracts:", err);
    }
  };

  const fetchMyReview = async (token) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reviewers/my-reviews`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        const myReview = data.data.find((r) => r.abstractId === abstractId);
        if (myReview) {
          setPreviousReview(myReview);
        }
      }
    } catch (err) {
      console.error("Error fetching my reviews:", err);
    }
  };

  const handleScoreChange = (criterionId, score) => {
    setScores((prev) => ({
      ...prev,
      [criterionId]: score,
    }));
  };

  const getTotalScore = () => {
    const values = Object.values(scores);
    const validScores = values.filter((s) => s > 0);
    if (validScores.length === 0) return 0;
    return validScores.reduce((a, b) => a + b, 0) / 5;
  };

  const allScoresSelected = () => {
    return Object.values(scores).every((s) => s >= 1 && s <= 5);
  };

  // Mask author names
  const maskAuthors = (authors) => {
    if (!hideAuthors || !authors) return authors;
    return authors.split(/[,;]/).map(() => "————").join(", ");
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!allScoresSelected()) {
      setError("Please score all 5 criteria before submitting");
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
          body: JSON.stringify({ scores, comments }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        
        // After 1.5 seconds, navigate to next pending abstract or dashboard
        setTimeout(() => {
          // Re-fetch to get updated list
          fetchAllAbstracts(token).then(() => {
            // Find next pending abstract after submission
            const pendingAbstracts = allAbstracts.filter(a => !a.hasReviewed && a.id !== abstractId);
            if (pendingAbstracts.length > 0) {
              navigate(`/reviewer/abstract/${pendingAbstracts[0].id}`);
            } else {
              navigate("/reviewer/dashboard");
            }
          });
          
          // Fallback: if we already have nextPendingAbstract, use it
          if (nextPendingAbstract) {
            navigate(`/reviewer/abstract/${nextPendingAbstract.id}`);
          } else {
            navigate("/reviewer/dashboard");
          }
        }, 1500);
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
      <div className="min-h-screen py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block w-10 h-10 border-3 border-[#0099CC] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500">Loading abstract...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !abstract) {
    return (
      <div className="min-h-screen py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-red-200 rounded-xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">{error}</h2>
            <button
              onClick={() => navigate("/reviewer/dashboard")}
              className="mt-4 px-5 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    const pendingCount = allAbstracts.filter(a => !a.hasReviewed && a.id !== abstractId).length;
    
    return (
      <div className="min-h-screen py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-green-200 rounded-xl p-8 text-center">
            <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Review Submitted!
            </h2>
            <p className="text-slate-600 mb-1">
              Total Score: <span className="font-semibold">{getTotalScore().toFixed(1)}/5</span>
            </p>
            {pendingCount > 0 ? (
              <p className="text-sm text-slate-500 mt-3">
                <span className="inline-flex items-center gap-1">
                  Loading next abstract...
                  <ArrowRight className="w-4 h-4" />
                </span>
              </p>
            ) : (
              <p className="text-sm text-slate-500 mt-3">
                All abstracts reviewed! Returning to dashboard...
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Back Button and Hide Authors Toggle */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/reviewer/dashboard")}
            className="flex items-center text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>

          <button
            onClick={() => setHideAuthors(!hideAuthors)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
              hideAuthors
                ? "bg-amber-50 border-amber-300 text-amber-700"
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
            title={hideAuthors ? "Show author names" : "Hide author names for blind review"}
          >
            {hideAuthors ? (
              <>
                <EyeOff className="w-4 h-4" />
                <span className="text-sm font-medium">Authors Hidden</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">Hide Authors</span>
              </>
            )}
          </button>
        </div>

        <div className="grid lg:grid-cols-5 gap-6 items-start">
          {/* Main Content - Abstract Details */}
          <div className="lg:col-span-3 lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto lg:pr-2">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex gap-2">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                      {getCategoryLabel(abstract.category)}
                    </span>
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                      {getDepartmentLabel(abstract.department)}
                    </span>
                  </div>
                </div>
                
                <h1 className="text-2xl font-semibold text-slate-900 leading-tight mb-3">
                  {abstract.title}
                </h1>
                
                {/* Authors with hide toggle */}
                <p className={`${hideAuthors ? "text-slate-400 italic" : "text-slate-600"}`}>
                  {maskAuthors(abstract.authors)}
                </p>
                
                {abstract.keywords && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {(Array.isArray(abstract.keywords)
                      ? abstract.keywords
                      : abstract.keywords.split(",")
                    ).map((keyword, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-blue-50 text-[#0077AA] text-xs rounded"
                      >
                        {typeof keyword === "string" ? keyword.trim() : keyword}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Abstract Content */}
              <div className="p-6">
                <div className="space-y-6">
                  {abstract.abstractContent?.background ? (
                    <>
                      <div>
                        <h3 className="text-xs font-semibold text-[#0077AA] uppercase tracking-wide mb-2">
                          Background
                        </h3>
                        <p className="text-slate-700 leading-relaxed">
                          {abstract.abstractContent.background}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold text-[#0077AA] uppercase tracking-wide mb-2">
                          Methods
                        </h3>
                        <p className="text-slate-700 leading-relaxed">
                          {abstract.abstractContent.methods}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold text-[#0077AA] uppercase tracking-wide mb-2">
                          Results
                        </h3>
                        <p className="text-slate-700 leading-relaxed">
                          {abstract.abstractContent.results}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold text-[#0077AA] uppercase tracking-wide mb-2">
                          Conclusion
                        </h3>
                        <p className="text-slate-700 leading-relaxed">
                          {abstract.abstractContent.conclusion}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                      {abstract.abstract}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Review Form or Previous Review */}
          <div className="lg:col-span-2 lg:sticky lg:top-4 lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto">
            {/* Already Reviewed - Show Previous Scores */}
            {(abstract.hasReviewed || previousReview) && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <h2 className="font-semibold text-slate-900">Your Review</h2>
                </div>
                
                {previousReview ? (
                  <>
                    <div className="mb-4">
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-sm text-slate-500">Total Score</span>
                        <span className="text-2xl font-semibold text-slate-900">
                          {previousReview.myTotalScore?.toFixed(1) || "—"}/5
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {RUBRIC_CRITERIA.map((criterion) => (
                        <div key={criterion.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                          <span className="text-sm text-slate-600">{criterion.title}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-900">
                              {previousReview.myScores?.[criterion.id] || "—"}
                            </span>
                            <span className="text-xs text-slate-400">
                              {SCORE_LABELS[previousReview.myScores?.[criterion.id]] || ""}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {previousReview.myComments && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <span className="text-sm text-slate-500">Your Comments</span>
                        <p className="mt-1 text-sm text-slate-700">{previousReview.myComments}</p>
                      </div>
                    )}

                    {/* Next Abstract Button */}
                    {nextPendingAbstract && (
                      <button
                        onClick={() => navigate(`/reviewer/abstract/${nextPendingAbstract.id}`)}
                        className="w-full mt-4 py-3 px-4 bg-[#0077AA] text-white rounded-lg font-medium hover:bg-[#005F89] transition-colors flex items-center justify-center gap-2"
                      >
                        Review Next Abstract
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-slate-500">You have already submitted a review for this abstract.</p>
                )}
              </div>
            )}

            {/* Review Form - Only show if not reviewed */}
            {!abstract.hasReviewed && !previousReview && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-slate-900">Your Review</h2>
                    <div className="text-right">
                      <span className="text-2xl font-semibold text-slate-900">
                        {getTotalScore().toFixed(1)}
                      </span>
                      <span className="text-slate-400">/5</span>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#0099CC] rounded-full transition-all duration-300"
                      style={{ width: `${(Object.values(scores).filter(s => s > 0).length / 5) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {Object.values(scores).filter(s => s > 0).length}/5 criteria scored
                  </p>
                </div>

                {error && (
                  <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmitReview} className="p-4">
                  {/* Scoring Criteria */}
                  <div className="space-y-3">
                    {RUBRIC_CRITERIA.map((criterion) => (
                      <div
                        key={criterion.id}
                        className="border border-slate-200 rounded-lg overflow-hidden"
                      >
                        {/* Criterion Header */}
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedCriterion(
                              expandedCriterion === criterion.id ? null : criterion.id
                            )
                          }
                          className="w-full p-3 text-left hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-slate-900 truncate">
                                {criterion.title}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2 ml-2">
                              {scores[criterion.id] > 0 && (
                                <span className="px-2 py-0.5 bg-[#0099CC] text-white text-xs font-medium rounded">
                                  {scores[criterion.id]} - {SCORE_LABELS[scores[criterion.id]]}
                                </span>
                              )}
                              {expandedCriterion === criterion.id ? (
                                <ChevronUp className="w-4 h-4 text-slate-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                          </div>
                        </button>

                        {/* Expanded Level Descriptions */}
                        {expandedCriterion === criterion.id && (
                          <div className="px-3 pb-3 border-t border-slate-100 bg-slate-50">
                            <p className="text-xs text-slate-500 py-2">{criterion.description}</p>
                            <div className="space-y-1.5">
                              {criterion.levels.map((level) => (
                                <button
                                  key={level.score}
                                  type="button"
                                  onClick={() => handleScoreChange(criterion.id, level.score)}
                                  className={`w-full p-2.5 rounded-lg text-left transition-all ${
                                    scores[criterion.id] === level.score
                                      ? "bg-[#0099CC] text-white"
                                      : "bg-white border border-slate-200 hover:border-[#0099CC] text-slate-700"
                                  }`}
                                >
                                  <div className="flex items-start gap-2">
                                    <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                                      scores[criterion.id] === level.score
                                        ? "bg-white/20 text-white"
                                        : "bg-slate-100 text-slate-600"
                                    }`}>
                                      {level.score}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                      <span className="text-sm font-medium">{level.label}</span>
                                      <p className={`text-xs mt-0.5 ${
                                        scores[criterion.id] === level.score ? "text-white/80" : "text-slate-500"
                                      }`}>
                                        {level.description}
                                      </p>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Quick Score Buttons */}
                        {expandedCriterion !== criterion.id && (
                          <div className="px-3 pb-3 flex gap-1.5">
                            {[1, 2, 3, 4, 5].map((score) => (
                              <button
                                key={score}
                                type="button"
                                onClick={() => handleScoreChange(criterion.id, score)}
                                className={`flex-1 py-2 text-sm font-medium rounded transition-all ${
                                  scores[criterion.id] === score
                                    ? "bg-[#0099CC] text-white"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                              >
                                {score}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Comments */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Comments <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-[#0099CC] focus:ring-1 focus:ring-[#0099CC] focus:outline-none text-sm resize-none"
                      rows="3"
                      placeholder="Feedback for the author..."
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting || !allScoresSelected()}
                    className={`w-full mt-4 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center ${
                      submitting || !allScoresSelected()
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-[#0077AA] text-white hover:bg-[#005F89]"
                    }`}
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Review
                      </>
                    )}
                  </button>

                  {!allScoresSelected() && (
                    <p className="text-center text-xs text-slate-400 mt-2">
                      Score all criteria to submit
                    </p>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}