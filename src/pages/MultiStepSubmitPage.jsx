import { useState } from "react";
import { FileText, ChevronRight, ChevronLeft, Upload, CheckCircle, X, Plus, Trash2, XCircle, Calendar, Mail } from "lucide-react";
import { abstractAPI } from "../services/api";
import { useNavigate, Link } from "react-router-dom";

// ==========================================
// SUBMISSION STATUS FLAG - Easy to toggle
// Set to false to reopen submissions
// ==========================================
const SUBMISSIONS_CLOSED = false;

export default function MultiStepSubmitPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    primaryAuthor: {
      firstName: "",
      lastName: "",
      degree: "",
      email: "",
    },
    additionalAuthors: [],
    department: "",
    departmentOther: "",
    category: "",
    abstractContent: {
      background: "",
      methods: "",
      conclusion: "",
      results: "",
    },
  });
  
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const totalSteps = 6;
  const MAX_WORD_COUNT = 400;

  const steps = [
    { number: 1, title: "Title", description: "Abstract Title" },
    { number: 2, title: "Authors", description: "Primary & Additional" },
    { number: 3, title: "Details", description: "Department, Category, Keywords" },
    { number: 4, title: "Abstract", description: "Background, Methods, Results, Conclusion" },
    { number: 5, title: "PDF", description: "Required Upload" },
    { number: 6, title: "Review", description: "Confirm & Submit" },
  ];

  const degrees = ["BS","BA","MD", "DO", "PhD", "MD/PhD", "MS", "Other"];

  // ==========================================
  // SUBMISSIONS CLOSED - Show closed message
  // ==========================================
  if (SUBMISSIONS_CLOSED) {
    return (
      <div className="min-h-screen py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Closed Banner */}
          <div className="bg-white border-2 border-red-300 rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-red-50 border-b border-red-200 p-6">
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-red-900">Submissions Closed</h1>
                  <p className="text-red-700">Abstract submission deadline has passed</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="text-center mb-8">
                <p className="text-lg text-slate-700 mb-4">
                  The abstract submission period for NEOMED Research Forum 2026 ended on{" "}
                  <span className="font-semibold text-red-700">January 12, 2026 at 11:59 PM EST</span>.
                </p>
                <p className="text-slate-600">
                  Thank you to everyone who submitted their research abstracts. The review committee
                  is now evaluating all submissions.
                </p>
              </div>

              {/* Timeline */}
              <div className="bg-slate-50 rounded-xl p-6 mb-8">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#0099CC]" />
                  What Happens Next?
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-slate-900">Review Period</p>
                      <p className="text-sm text-slate-600">January 13 - 28, 2026</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-slate-300 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-slate-900">Acceptance Notifications</p>
                      <p className="text-sm text-slate-600">January 28, 2026</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-slate-300 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-slate-900">Final Slides Due</p>
                      <p className="text-sm text-slate-600">February 18, 2026</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-slate-300 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-slate-900">Research Forum Day</p>
                      <p className="text-sm text-slate-600">February 25, 2026</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Already Submitted? */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">Already submitted?</span> Check your email for your
                  unique tracking link to view your submission status, or contact us if you need assistance.
                </p>
              </div>

              {/* Contact */}
              <div className="text-center">
                <p className="text-slate-600 mb-4">
                  Questions? Contact the Research Forum Committee:
                </p>
                <a
                  href="mailto:sbadat@neomed.edu"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#0099CC] text-white rounded-lg hover:bg-[#0077AA] transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  sbadat@neomed.edu
                </a>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-200 p-4">
              <Link
                to="/"
                className="block w-full text-center px-6 py-3 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // NORMAL SUBMISSION FORM (when open)
  // ==========================================

  // Author management
  const addAuthor = () => {
    setFormData({
      ...formData,
      additionalAuthors: [
        ...formData.additionalAuthors,
        { firstName: "", lastName: "", degree: "" },
      ],
    });
  };

  const removeAuthor = (index) => {
    const newAuthors = formData.additionalAuthors.filter((_, i) => i !== index);
    setFormData({ ...formData, additionalAuthors: newAuthors });
  };

  const updateAuthor = (index, field, value) => {
    const newAuthors = [...formData.additionalAuthors];
    newAuthors[index][field] = value;
    setFormData({ ...formData, additionalAuthors: newAuthors });
  };

  // Keyword management
  const addKeyword = () => {
    const trimmed = keywordInput.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed]);
      setKeywordInput("");
      setErrors({ ...errors, keywords: null });
    }
  };

  const removeKeyword = (index) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const handleKeywordKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addKeyword();
    }
  };

  // Word count helper
  const getTotalWordCount = () => {
    return Object.values(formData.abstractContent)
      .join(" ")
      .split(" ")
      .filter(Boolean).length;
  };

  const handleAbstractContentChange = (field, value) => {
    const currentContent = { ...formData.abstractContent };
    const tempContent = { ...currentContent, [field]: value };
    const newWordCount = Object.values(tempContent)
      .join(" ")
      .split(" ")
      .filter(Boolean).length;

    // Only update if under word limit
    if (newWordCount <= MAX_WORD_COUNT) {
      setFormData({
        ...formData,
        abstractContent: tempContent,
      });
    }
  };

  // File handling
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setErrors({ ...errors, pdf: "Please upload a PDF file" });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ ...errors, pdf: "File size must be less than 10MB" });
        return;
      }
      setPdfFile(file);
      setErrors({ ...errors, pdf: null });
    }
  };

  // Validation
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = "Title is required";
    }

    if (step === 2) {
      if (!formData.primaryAuthor.firstName.trim()) 
        newErrors.primaryFirstName = "First name is required";
      if (!formData.primaryAuthor.lastName.trim()) 
        newErrors.primaryLastName = "Last name is required";
      if (!formData.primaryAuthor.degree) 
        newErrors.primaryDegree = "Degree is required";
      if (!formData.primaryAuthor.email.trim()) 
        newErrors.primaryEmail = "Email is required";
      if (formData.primaryAuthor.email && !/\S+@\S+\.\S+/.test(formData.primaryAuthor.email)) {
        newErrors.primaryEmail = "Please enter a valid email";
      }

      // Validate additional authors if any
      formData.additionalAuthors.forEach((author, idx) => {
        if (!author.firstName.trim()) 
          newErrors[`additionalFirstName${idx}`] = "First name is required";
        if (!author.lastName.trim()) 
          newErrors[`additionalLastName${idx}`] = "Last name is required";
        if (!author.degree) 
          newErrors[`additionalDegree${idx}`] = "Degree is required";
      });
    }

    if (step === 3) {
      if (!formData.department) newErrors.department = "Department is required";
      if (formData.department === "other" && !formData.departmentOther.trim()) {
        newErrors.departmentOther = "Please specify department";
      }
      if (!formData.category) newErrors.category = "Category is required";
      if (keywords.length === 0) newErrors.keywords = "At least one keyword is required";
    }

    if (step === 4) {
      if (!formData.abstractContent.background.trim()) 
        newErrors.background = "Background is required";
      if (!formData.abstractContent.methods.trim()) 
        newErrors.methods = "Methods is required";
      if (!formData.abstractContent.results.trim()) 
        newErrors.results = "Results is required";
      if (!formData.abstractContent.conclusion.trim()) 
        newErrors.conclusion = "Conclusion is required";
    }

    if (step === 5) {
      if (!pdfFile) newErrors.pdf = "PDF upload is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      // Format authors string
      const primaryAuthorStr = `${formData.primaryAuthor.lastName} ${formData.primaryAuthor.firstName.charAt(0)}, ${formData.primaryAuthor.degree}`;
      const additionalAuthorsStr = formData.additionalAuthors
        .map((a) => `${a.lastName} ${a.firstName.charAt(0)}, ${a.degree}`)
        .join("; ");
      const allAuthors = additionalAuthorsStr
        ? `${primaryAuthorStr}; ${additionalAuthorsStr}`
        : primaryAuthorStr;

      // Create FormData
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("authors", allAuthors);
      submitData.append("email", formData.primaryAuthor.email);
      submitData.append("department", formData.department);
      submitData.append("departmentOther", formData.departmentOther);
      submitData.append("category", formData.category);
      submitData.append("keywords", keywords.join(", "));
      submitData.append("abstractContent", JSON.stringify(formData.abstractContent));

      // Full abstract text
      const fullAbstract = `Background: ${formData.abstractContent.background}\n\nMethods: ${formData.abstractContent.methods}\n\nResults: ${formData.abstractContent.results}\n\nConclusion: ${formData.abstractContent.conclusion}`;
      submitData.append("abstract", fullAbstract);

      if (pdfFile) {
        submitData.append("pdfFile", pdfFile);
      }

      const response = await abstractAPI.submit(submitData);

      if (response.success) {
        // Navigate to thank you page with the token
        navigate(`/thank-you/${response.data.token}`);
      }
    } catch (error) {
      console.error("Submission error:", error);
      setErrors({ submit: error.message || "Failed to submit. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDepartmentLabel = (dept) => {
    const map = {
      im: "Internal Medicine",
      fm: "Family Medicine",
      peds: "Pediatrics",
      obgyn: "OB/GYN",
      surgery: "Surgery",
      psych: "Psychiatry",
      neuro: "Neurology",
      em: "Emergency Medicine",
      path: "Pathology",
      radio: "Radiology",
      anes: "Anesthesiology",
      derm: "Dermatology",
      ophtho: "Ophthalmology",
      ent: "ENT",
      uro: "Urology",
      ortho: "Orthopedics",
      pm: "Physical Medicine",
      other: "Other",
    };
    return map[dept] || dept;
  };

  const getCategoryLabel = (cat) => {
    const map = {
      clinical: "Clinical Research",
      education: "Medical Education",
      basic: "Basic Science",
      public: "Public Health",
      qi: "Quality Improvement",
      case: "Case Report",
    };
    return map[cat] || cat;
  };

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-[#E6F4F9] border border-[#B3DFF0] rounded-full mb-4">
            <FileText className="w-4 h-4 mr-2 text-[#0099CC]" />
            <span className="text-sm font-medium text-[#006688]">Abstract Submission</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Submit Your Research</h1>
          <p className="text-slate-600">NEOMED Research Forum 2026</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                      currentStep > step.number
                        ? "bg-green-500 text-white"
                        : currentStep === step.number
                        ? "bg-[#0099CC] text-white ring-4 ring-[#0099CC]/20"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {currentStep > step.number ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium hidden sm:block ${
                      currentStep >= step.number ? "text-slate-900" : "text-slate-400"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`w-full h-1 mx-2 rounded ${
                      currentStep > step.number ? "bg-green-500" : "bg-slate-200"
                    }`}
                    style={{ minWidth: "20px", maxWidth: "60px" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
          {/* Step 1: Title */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Abstract Title</h2>
              <p className="text-slate-600 mb-6">
                Enter a clear, descriptive title for your research abstract.
              </p>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0099CC]/20 focus:border-[#0099CC] resize-none ${
                    errors.title ? "border-red-300 bg-red-50" : "border-slate-300"
                  }`}
                  rows="3"
                  placeholder="Enter your abstract title..."
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-600">{errors.title}</p>
                )}
                <p className="mt-2 text-sm text-slate-500">
                  Keep it concise but descriptive. Avoid abbreviations when possible.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Authors */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Authors</h2>
              <p className="text-slate-600 mb-6">
                Enter the primary (presenting) author and any additional authors.
              </p>

              {/* Primary Author */}
              <div className="bg-[#E6F4F9] border border-[#B3DFF0] rounded-lg p-5 mb-6">
                <h3 className="font-semibold text-[#006688] mb-4 flex items-center">
                  <span className="w-6 h-6 bg-[#0099CC] text-white rounded-full text-xs flex items-center justify-center mr-2">
                    1
                  </span>
                  Primary Author (Presenter)
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.primaryAuthor.firstName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          primaryAuthor: { ...formData.primaryAuthor, firstName: e.target.value },
                        })
                      }
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0099CC]/20 focus:border-[#0099CC] ${
                        errors.primaryFirstName ? "border-red-300 bg-red-50" : "border-slate-300"
                      }`}
                      placeholder="First name"
                    />
                    {errors.primaryFirstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.primaryFirstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.primaryAuthor.lastName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          primaryAuthor: { ...formData.primaryAuthor, lastName: e.target.value },
                        })
                      }
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0099CC]/20 focus:border-[#0099CC] ${
                        errors.primaryLastName ? "border-red-300 bg-red-50" : "border-slate-300"
                      }`}
                      placeholder="Last name"
                    />
                    {errors.primaryLastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.primaryLastName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Degree <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.primaryAuthor.degree}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          primaryAuthor: { ...formData.primaryAuthor, degree: e.target.value },
                        })
                      }
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0099CC]/20 focus:border-[#0099CC] bg-white ${
                        errors.primaryDegree ? "border-red-300 bg-red-50" : "border-slate-300"
                      }`}
                    >
                      <option value="">Select degree</option>
                      {degrees.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    {errors.primaryDegree && (
                      <p className="mt-1 text-sm text-red-600">{errors.primaryDegree}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.primaryAuthor.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          primaryAuthor: { ...formData.primaryAuthor, email: e.target.value },
                        })
                      }
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0099CC]/20 focus:border-[#0099CC] ${
                        errors.primaryEmail ? "border-red-300 bg-red-50" : "border-slate-300"
                      }`}
                      placeholder="email@neomed.edu"
                    />
                    {errors.primaryEmail && (
                      <p className="mt-1 text-sm text-red-600">{errors.primaryEmail}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Authors */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">Additional Authors</h3>
                  <button
                    type="button"
                    onClick={addAuthor}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-[#0099CC] hover:bg-[#E6F4F9] rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Author
                  </button>
                </div>

                {formData.additionalAuthors.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">
                    No additional authors added. Click "Add Author" to include co-authors.
                  </p>
                ) : (
                  formData.additionalAuthors.map((author, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 border border-slate-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-slate-600">
                          Author {idx + 2}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeAuthor(idx)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid md:grid-cols-3 gap-3">
                        <div>
                          <input
                            type="text"
                            value={author.firstName}
                            onChange={(e) => updateAuthor(idx, "firstName", e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0099CC]/20 focus:border-[#0099CC] text-sm ${
                              errors[`additionalFirstName${idx}`]
                                ? "border-red-300 bg-red-50"
                                : "border-slate-300"
                            }`}
                            placeholder="First name"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={author.lastName}
                            onChange={(e) => updateAuthor(idx, "lastName", e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0099CC]/20 focus:border-[#0099CC] text-sm ${
                              errors[`additionalLastName${idx}`]
                                ? "border-red-300 bg-red-50"
                                : "border-slate-300"
                            }`}
                            placeholder="Last name"
                          />
                        </div>
                        <div>
                          <select
                            value={author.degree}
                            onChange={(e) => updateAuthor(idx, "degree", e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0099CC]/20 focus:border-[#0099CC] bg-white text-sm ${
                              errors[`additionalDegree${idx}`]
                                ? "border-red-300 bg-red-50"
                                : "border-slate-300"
                            }`}
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
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Step 3: Details */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Details</h2>
              <p className="text-slate-600 mb-6">
                Categorize your research and add relevant keywords.
              </p>

              <div className="space-y-6">
                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0099CC]/20 focus:border-[#0099CC] bg-white ${
                      errors.department ? "border-red-300 bg-red-50" : "border-slate-300"
                    }`}
                  >
                    <option value="">Select department</option>
                    <option value="im">Internal Medicine</option>
                    <option value="fm">Family Medicine</option>
                    <option value="peds">Pediatrics</option>
                    <option value="obgyn">OB/GYN</option>
                    <option value="surgery">Surgery</option>
                    <option value="psych">Psychiatry</option>
                    <option value="neuro">Neurology</option>
                    <option value="em">Emergency Medicine</option>
                    <option value="path">Pathology</option>
                    <option value="radio">Radiology</option>
                    <option value="anes">Anesthesiology</option>
                    <option value="derm">Dermatology</option>
                    <option value="ophtho">Ophthalmology</option>
                    <option value="ent">ENT</option>
                    <option value="uro">Urology</option>
                    <option value="ortho">Orthopedics</option>
                    <option value="pm">Physical Medicine</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.department && (
                    <p className="mt-2 text-sm text-red-600">{errors.department}</p>
                  )}
                </div>

                {formData.department === "other" && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Specify Department <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.departmentOther}
                      onChange={(e) =>
                        setFormData({ ...formData, departmentOther: e.target.value })
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0099CC]/20 focus:border-[#0099CC] ${
                        errors.departmentOther ? "border-red-300 bg-red-50" : "border-slate-300"
                      }`}
                      placeholder="Enter department name"
                    />
                    {errors.departmentOther && (
                      <p className="mt-2 text-sm text-red-600">{errors.departmentOther}</p>
                    )}
                  </div>
                )}

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Research Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0099CC]/20 focus:border-[#0099CC] bg-white ${
                      errors.category ? "border-red-300 bg-red-50" : "border-slate-300"
                    }`}
                  >
                    <option value="">Select category</option>
                    <option value="clinical">Clinical Research</option>
                    <option value="education">Medical Education</option>
                    <option value="basic">Basic Science</option>
                    <option value="public">Public Health</option>
                    <option value="qi">Quality Improvement</option>
                    <option value="case">Case Report</option>
                  </select>
                  {errors.category && (
                    <p className="mt-2 text-sm text-red-600">{errors.category}</p>
                  )}
                </div>

                {/* Keywords */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Keywords <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyPress={handleKeywordKeyPress}
                      className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0099CC]/20 focus:border-[#0099CC] ${
                        errors.keywords ? "border-red-300 bg-red-50" : "border-slate-300"
                      }`}
                      placeholder="Type a keyword and press Enter"
                    />
                    <button
                      type="button"
                      onClick={addKeyword}
                      className="px-4 py-3 bg-[#0099CC] text-white rounded-lg hover:bg-[#0077AA] transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  {errors.keywords && (
                    <p className="mt-2 text-sm text-red-600">{errors.keywords}</p>
                  )}

                  {keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-3 py-1 bg-[#E6F4F9] text-[#006688] text-sm rounded-full border border-[#B3DFF0]"
                        >
                          {keyword}
                          <button
                            type="button"
                            onClick={() => removeKeyword(idx)}
                            className="ml-2 text-[#0099CC] hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="mt-2 text-sm text-slate-500">
                    Add 3-5 keywords that describe your research.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Abstract Content */}
          {currentStep === 4 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">Abstract Content</h2>
                  <p className="text-slate-600">
                    Enter each section of your structured abstract.
                  </p>
                </div>
                <div
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    getTotalWordCount() > MAX_WORD_COUNT * 0.9
                      ? "bg-red-100 text-red-700"
                      : getTotalWordCount() > MAX_WORD_COUNT * 0.75
                      ? "bg-amber-100 text-amber-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {getTotalWordCount()}/{MAX_WORD_COUNT} words
                </div>
              </div>

              <div className="space-y-5">
                {[
                  {
                    field: "background",
                    label: "Background",
                    placeholder:
                      "Describe the context and rationale for your research...",
                  },
                  {
                    field: "methods",
                    label: "Methods",
                    placeholder:
                      "Describe your study design, participants, and procedures...",
                  },
                  {
                    field: "results",
                    label: "Results",
                    placeholder: "Summarize your key findings and data...",
                  },
                  {
                    field: "conclusion",
                    label: "Conclusion",
                    placeholder:
                      "State the implications and significance of your findings...",
                  },
                ].map(({ field, label, placeholder }) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {label} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.abstractContent[field]}
                      onChange={(e) => handleAbstractContentChange(field, e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0099CC]/20 focus:border-[#0099CC] resize-none ${
                        errors[field] ? "border-red-300 bg-red-50" : "border-slate-300"
                      }`}
                      rows="4"
                      placeholder={placeholder}
                    />
                    {errors[field] && (
                      <p className="mt-1 text-sm text-red-600">{errors[field]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: PDF Upload */}
          {currentStep === 5 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Upload PDF</h2>
              <p className="text-slate-600 mb-6">
                Upload a PDF version of your abstract (required).
              </p>

              <div className="space-y-4">
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    pdfFile
                      ? "border-green-300 bg-green-50"
                      : errors.pdf
                      ? "border-red-300 bg-red-50"
                      : "border-slate-300 hover:border-[#0099CC]"
                  }`}
                >
                  <input
                    type="file"
                    id="pdfFile"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {!pdfFile ? (
                    <label htmlFor="pdfFile" className="cursor-pointer">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                      <p className="text-lg font-medium text-slate-700 mb-1">
                        Click to upload PDF
                      </p>
                      <p className="text-sm text-slate-500">PDF up to 10MB</p>
                    </label>
                  ) : (
                    <div>
                      <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                      <div className="flex items-center justify-center text-green-900">
                        <FileText className="w-5 h-5 mr-2 text-green-600" />
                        <span className="font-medium">{pdfFile.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setPdfFile(null);
                            document.getElementById("pdfFile").value = "";
                            setErrors({ ...errors, pdf: null });
                          }}
                          className="ml-3 text-red-600 hover:text-red-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-sm text-green-700 mt-2">
                        {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}

                  {errors.pdf && (
                    <p className="mt-4 text-sm text-red-600 font-medium">{errors.pdf}</p>
                  )}
                </div>

                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-900">
                    <strong>⚠️ Note:</strong> PDF upload is required. Please ensure your PDF
                    matches the content entered in the previous steps.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Review */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Review Your Submission</h2>

              <div className="bg-slate-50 rounded-lg p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Title</h3>
                  <p className="text-slate-900 font-medium">{formData.title}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-2">Authors</h3>
                  <div className="space-y-2">
                    <div className="bg-white rounded-lg p-3 border border-slate-200">
                      <p className="text-sm font-medium text-[#0099CC] mb-1">
                        Primary Author 
                      </p>
                      <p className="text-slate-900">
                        {formData.primaryAuthor.firstName} {formData.primaryAuthor.lastName},{" "}
                        {formData.primaryAuthor.degree}
                      </p>
                      <p className="text-sm text-slate-600">{formData.primaryAuthor.email}</p>
                    </div>
                    {formData.additionalAuthors.map((author, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 border border-slate-200">
                        <p className="text-sm font-medium text-slate-600 mb-1">
                          Author {idx + 1}
                        </p>
                        <p className="text-slate-900">
                          {author.firstName} {author.lastName}, {author.degree}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-1">Department</h3>
                    <p className="text-slate-900">
                      {formData.department === "other"
                        ? formData.departmentOther
                        : getDepartmentLabel(formData.department)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-1">Category</h3>
                    <p className="text-slate-900">{getCategoryLabel(formData.category)}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-2">
                    Keywords ({keywords.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((keyword, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-50 text-[#0077AA] text-sm rounded-full border border-blue-200"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-2">Abstract Content</h3>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                      <p className="text-xs font-semibold text-slate-600 mb-1">BACKGROUND</p>
                      <p className="text-slate-900 text-sm">
                        {formData.abstractContent.background}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                      <p className="text-xs font-semibold text-slate-600 mb-1">METHODS</p>
                      <p className="text-slate-900 text-sm">{formData.abstractContent.methods}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                      <p className="text-xs font-semibold text-slate-600 mb-1">RESULTS</p>
                      <p className="text-slate-900 text-sm">{formData.abstractContent.results}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                      <p className="text-xs font-semibold text-slate-600 mb-1">CONCLUSION</p>
                      <p className="text-slate-900 text-sm">
                        {formData.abstractContent.conclusion}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">PDF</h3>
                  <div className="flex items-center text-green-600">
                    <FileText className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">{pdfFile?.name}</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-900">
                  <strong>⚠️ Important:</strong> Once submitted, you cannot edit your abstract.
                  Please review carefully before submitting.
                </p>
              </div>

              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-900 text-sm">
                  {errors.submit}
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-3 font-medium rounded-lg transition-colors flex items-center ${
                currentStep === 1
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Previous
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                className="px-6 py-3 bg-[#0099CC] text-white font-medium rounded-lg hover:bg-[#0077AA] transition-colors flex items-center"
              >
                Next
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-8 py-3 font-medium rounded-lg transition-colors flex items-center ${
                  isSubmitting
                    ? "bg-slate-400 cursor-not-allowed text-white"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Submit Abstract
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-slate-600">
          Need help? Contact us at{" "}
          <a href="mailto:sbadat@neomed.edu" className="text-[#0099CC] hover:text-[#0077AA]">
            sbadat@neomed.edu
          </a>
        </div>
      </div>
    </div>
  );
}