import { useState } from "react";
import { FileText, ChevronRight, ChevronLeft, Upload, CheckCircle, X, Plus, Trash2 } from "lucide-react";
import { abstractAPI } from "../services/api";
import { useNavigate } from "react-router-dom";

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
      results: "",
      conclusion: "",
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
      const formDataToSend = new FormData();
      
      // Basic info
      formDataToSend.append("title", formData.title);
      
      // Primary author - send as nested fields (NOT as JSON string)
      formDataToSend.append("primaryAuthor[firstName]", formData.primaryAuthor.firstName);
      formDataToSend.append("primaryAuthor[lastName]", formData.primaryAuthor.lastName);
      formDataToSend.append("primaryAuthor[degree]", formData.primaryAuthor.degree);
      formDataToSend.append("primaryAuthor[email]", formData.primaryAuthor.email);
      
      // Additional authors - send as JSON string (backend expects this)
      if (formData.additionalAuthors.length > 0) {
        formDataToSend.append("additionalAuthors", JSON.stringify(formData.additionalAuthors));
      } else {
        formDataToSend.append("additionalAuthors", JSON.stringify([]));
      }
      
      // Department
      formDataToSend.append("department", formData.department);
      if (formData.department === "other") {
        formDataToSend.append("departmentOther", formData.departmentOther);
      }
      
      // Category
      formDataToSend.append("category", formData.category);
      
      // Keywords
      formDataToSend.append("keywords", JSON.stringify(keywords));
      
      // Abstract content - send as nested fields
      formDataToSend.append("abstractContent[background]", formData.abstractContent.background);
      formDataToSend.append("abstractContent[methods]", formData.abstractContent.methods);
      formDataToSend.append("abstractContent[results]", formData.abstractContent.results);
      formDataToSend.append("abstractContent[conclusion]", formData.abstractContent.conclusion);
      
      // PDF file
      formDataToSend.append("pdfFile", pdfFile);

      console.log("📤 Submitting abstract...");
      const response = await abstractAPI.submit(formDataToSend);
      console.log("📥 Response:", response);

      if (response.success) {
        console.log("✅ Success! Redirecting to thank you page...");
        navigate(`/thank-you/${response.data.viewToken}`);
      }
    } catch (error) {
      console.error("❌ Submission error:", error);
      setErrors({ submit: error.message || "Failed to submit. Please try again." });
    } finally {
      setIsSubmitting(false);
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
    };
    return map[cat] || cat;
  };

  return (
    <div className="min-h-screen py-16 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6">
            <FileText className="w-4 h-4 mr-2 text-[#0099CC]" />
            <span className="text-sm font-medium text-slate-900">Submit Abstract</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            NEOMED Research Forum 2025
          </h1>
          <p className="text-slate-600">
            Step {currentStep} of {totalSteps}: {steps[currentStep - 1].description}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, idx) => (
              <div key={step.number} className="flex items-center flex-1">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.number
                      ? "bg-[#0099CC] border-[#0099CC] text-white"
                      : "bg-white border-slate-300 text-slate-400"
                  }`}
                >
                  {currentStep > step.number ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <span className="font-semibold text-sm">{step.number}</span>
                  )}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      currentStep > step.number ? "bg-[#0099CC]" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-600 px-1">
            {steps.map((step) => (
              <div key={step.number} className="text-center" style={{ width: "80px" }}>
                {step.title}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm">
          
          {/* Step 1: Title */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Abstract Title</h2>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none ${
                    errors.title
                      ? "border-red-300 focus:border-red-500"
                      : "border-slate-300 focus:border-[#0099CC]"
                  }`}
                  placeholder="Enter your abstract title"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>
            </div>
          )}

          {/* Step 2: Authors */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Authors</h2>
                <p className="text-slate-600 mb-6">Primary author will receive all correspondence</p>
              </div>

              {/* Primary Author */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Primary Author *</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      First Name *
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
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none ${
                        errors.primaryFirstName
                          ? "border-red-300 focus:border-red-500"
                          : "border-slate-300 focus:border-[#0099CC]"
                      }`}
                      placeholder="John"
                    />
                    {errors.primaryFirstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.primaryFirstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Last Name *
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
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none ${
                        errors.primaryLastName
                          ? "border-red-300 focus:border-red-500"
                          : "border-slate-300 focus:border-[#0099CC]"
                      }`}
                      placeholder="Doe"
                    />
                    {errors.primaryLastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.primaryLastName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Terminal Degree *
                    </label>
                    <select
                      value={formData.primaryAuthor.degree}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          primaryAuthor: { ...formData.primaryAuthor, degree: e.target.value },
                        })
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none bg-white ${
                        errors.primaryDegree
                          ? "border-red-300 focus:border-red-500"
                          : "border-slate-300 focus:border-[#0099CC]"
                      }`}
                    >
                      <option value="">Select Degree</option>
                      {degrees.map((deg) => (
                        <option key={deg} value={deg}>
                          {deg}
                        </option>
                      ))}
                    </select>
                    {errors.primaryDegree && (
                      <p className="mt-1 text-sm text-red-600">{errors.primaryDegree}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email Address *
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
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none ${
                        errors.primaryEmail
                          ? "border-red-300 focus:border-red-500"
                          : "border-slate-300 focus:border-[#0099CC]"
                      }`}
                      placeholder="john.doe@neomed.edu"
                    />
                    {errors.primaryEmail && (
                      <p className="mt-1 text-sm text-red-600">{errors.primaryEmail}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Authors */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900">Additional Authors (Optional)</h3>
                  <button
                    type="button"
                    onClick={addAuthor}
                    className="flex items-center px-4 py-2 bg-[#0099CC] text-white rounded-lg hover:bg-[#0077AA] transition-colors text-sm font-medium"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Author
                  </button>
                </div>

                {formData.additionalAuthors.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-slate-300 rounded-lg">
                    <p className="text-slate-500">No additional authors added yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.additionalAuthors.map((author, index) => (
                      <div
                        key={index}
                        className="bg-slate-50 border border-slate-200 rounded-lg p-6"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-slate-900">Author {index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeAuthor(index)}
                            className="text-red-600 hover:text-red-700 flex items-center text-sm"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Remove
                          </button>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              First Name *
                            </label>
                            <input
                              type="text"
                              value={author.firstName}
                              onChange={(e) => updateAuthor(index, "firstName", e.target.value)}
                              className={`w-full px-4 py-3 border rounded-lg focus:outline-none ${
                                errors[`additionalFirstName${index}`]
                                  ? "border-red-300"
                                  : "border-slate-300"
                              }`}
                              placeholder="First name"
                            />
                            {errors[`additionalFirstName${index}`] && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors[`additionalFirstName${index}`]}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Last Name *
                            </label>
                            <input
                              type="text"
                              value={author.lastName}
                              onChange={(e) => updateAuthor(index, "lastName", e.target.value)}
                              className={`w-full px-4 py-3 border rounded-lg focus:outline-none ${
                                errors[`additionalLastName${index}`]
                                  ? "border-red-300"
                                  : "border-slate-300"
                              }`}
                              placeholder="Last name"
                            />
                            {errors[`additionalLastName${index}`] && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors[`additionalLastName${index}`]}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Degree *
                            </label>
                            <select
                              value={author.degree}
                              onChange={(e) => updateAuthor(index, "degree", e.target.value)}
                              className={`w-full px-4 py-3 border rounded-lg focus:outline-none bg-white ${
                                errors[`additionalDegree${index}`]
                                  ? "border-red-300"
                                  : "border-slate-300"
                              }`}
                            >
                              <option value="">Select</option>
                              {degrees.map((deg) => (
                                <option key={deg} value={deg}>
                                  {deg}
                                </option>
                              ))}
                            </select>
                            {errors[`additionalDegree${index}`] && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors[`additionalDegree${index}`]}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Department, Category, Keywords */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Research Details</h2>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Department *
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none bg-white ${
                    errors.department
                      ? "border-red-300 focus:border-red-500"
                      : "border-slate-300 focus:border-[#0099CC]"
                  }`}
                >
                  <option value="">Select Department</option>
                  <option value="cardiology">Cardiology</option>
                  <option value="neurology">Neurology</option>
                  <option value="oncology">Oncology</option>
                  <option value="pediatrics">Pediatrics</option>
                  <option value="internal">Internal Medicine</option>
                  <option value="surgery">Surgery</option>
                  <option value="psychiatry">Psychiatry</option>
                  <option value="radiology">Radiology</option>
                  <option value="pathology">Pathology</option>
                  <option value="emergency">Emergency Medicine</option>
                  <option value="anesthesiology">Anesthesiology</option>
                  <option value="dermatology">Dermatology</option>
                  <option value="other">Other</option>
                </select>
                {errors.department && (
                  <p className="mt-1 text-sm text-red-600">{errors.department}</p>
                )}
              </div>

              {formData.department === "other" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Specify Department *
                  </label>
                  <input
                    type="text"
                    value={formData.departmentOther}
                    onChange={(e) =>
                      setFormData({ ...formData, departmentOther: e.target.value })
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none ${
                      errors.departmentOther
                        ? "border-red-300 focus:border-red-500"
                        : "border-slate-300 focus:border-[#0099CC]"
                    }`}
                    placeholder="Enter department name"
                  />
                  {errors.departmentOther && (
                    <p className="mt-1 text-sm text-red-600">{errors.departmentOther}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Research Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none bg-white ${
                    errors.category
                      ? "border-red-300 focus:border-red-500"
                      : "border-slate-300 focus:border-[#0099CC]"
                  }`}
                >
                  <option value="">Select Category</option>
                  <option value="clinical">Clinical Research</option>
                  <option value="education">Medical Education</option>
                  <option value="basic">Basic Science</option>
                  <option value="public">Public Health</option>
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>

              {/* Keywords */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Keywords * (Add at least one)
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={handleKeywordKeyPress}
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:border-[#0099CC] focus:outline-none"
                    placeholder="Enter a keyword"
                  />
                  <button
                    type="button"
                    onClick={addKeyword}
                    className="px-6 py-3 bg-[#0099CC] text-white rounded-lg hover:bg-[#0077AA] transition-colors font-medium flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </button>
                </div>

                {keywords.length > 0 ? (
                  <div className="space-y-2">
                    {keywords.map((keyword, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3"
                      >
                        <span className="text-slate-900">
                          <span className="font-semibold text-[#0099CC] mr-2">
                            {index + 1}.
                          </span>
                          {keyword}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeKeyword(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border-2 border-dashed border-slate-300 rounded-lg">
                    <p className="text-slate-500 text-sm">No keywords added yet</p>
                  </div>
                )}

                {errors.keywords && (
                  <p className="mt-2 text-sm text-red-600">{errors.keywords}</p>
                )}
                <p className="mt-2 text-sm text-slate-500">
                  Enter 3-5 keywords that best describe your research
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Abstract Content */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Abstract Content</h2>
                <p className="text-slate-600 mb-6">
                  Please provide your abstract in the structured format below
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Background *
                </label>
                <textarea
                  value={formData.abstractContent.background}
                  onChange={(e) => handleAbstractContentChange("background", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none ${
                    errors.background
                      ? "border-red-300 focus:border-red-500"
                      : "border-slate-300 focus:border-[#0099CC]"
                  }`}
                  rows="4"
                  placeholder="Describe the context and rationale for your study..."
                />
                {errors.background && (
                  <p className="mt-1 text-sm text-red-600">{errors.background}</p>
                )}
                <p className="mt-1 text-sm text-slate-500">
                  {formData.abstractContent.background.split(" ").filter(Boolean).length} words
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Methods *
                </label>
                <textarea
                  value={formData.abstractContent.methods}
                  onChange={(e) => handleAbstractContentChange("methods", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none ${
                    errors.methods
                      ? "border-red-300 focus:border-red-500"
                      : "border-slate-300 focus:border-[#0099CC]"
                  }`}
                  rows="4"
                  placeholder="Describe your research methods and approach..."
                />
                {errors.methods && <p className="mt-1 text-sm text-red-600">{errors.methods}</p>}
                <p className="mt-1 text-sm text-slate-500">
                  {formData.abstractContent.methods.split(" ").filter(Boolean).length} words
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Results *
                </label>
                <textarea
                  value={formData.abstractContent.results}
                  onChange={(e) => handleAbstractContentChange("results", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none ${
                    errors.results
                      ? "border-red-300 focus:border-red-500"
                      : "border-slate-300 focus:border-[#0099CC]"
                  }`}
                  rows="4"
                  placeholder="Present your key findings..."
                />
                {errors.results && <p className="mt-1 text-sm text-red-600">{errors.results}</p>}
                <p className="mt-1 text-sm text-slate-500">
                  {formData.abstractContent.results.split(" ").filter(Boolean).length} words
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Conclusion *
                </label>
                <textarea
                  value={formData.abstractContent.conclusion}
                  onChange={(e) => handleAbstractContentChange("conclusion", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none ${
                    errors.conclusion
                      ? "border-red-300 focus:border-red-500"
                      : "border-slate-300 focus:border-[#0099CC]"
                  }`}
                  rows="4"
                  placeholder="Summarize implications and significance..."
                />
                {errors.conclusion && (
                  <p className="mt-1 text-sm text-red-600">{errors.conclusion}</p>
                )}
                <p className="mt-1 text-sm text-slate-500">
                  {formData.abstractContent.conclusion.split(" ").filter(Boolean).length} words
                </p>
              </div>

              <div className={`border rounded-lg p-4 ${
                getTotalWordCount() >= MAX_WORD_COUNT
                  ? "bg-red-50 border-red-200"
                  : getTotalWordCount() >= MAX_WORD_COUNT * 0.9
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-blue-50 border-blue-200"
              }`}>
                <p className={`text-sm font-semibold ${
                  getTotalWordCount() >= MAX_WORD_COUNT
                    ? "text-red-900"
                    : getTotalWordCount() >= MAX_WORD_COUNT * 0.9
                    ? "text-yellow-900"
                    : "text-blue-900"
                }`}>
                  <strong>Total word count:</strong>{" "}
                  {getTotalWordCount()} / {MAX_WORD_COUNT} words
                  {getTotalWordCount() >= MAX_WORD_COUNT && " - Word limit reached!"}
                </p>
              </div>
            </div>
          )}

          {/* Step 5: PDF Upload */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">PDF Upload</h2>
                <p className="text-slate-600 mb-6">Upload a PDF version of your abstract</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Upload PDF * (Required)
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center hover:border-[#0099CC] transition-colors ${
                    errors.pdf ? "border-red-300 bg-red-50" : "border-slate-300"
                  }`}
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <input
                    type="file"
                    id="pdfFile"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="pdfFile" className="cursor-pointer">
                    <span className="text-[#0099CC] hover:text-[#0077AA] font-medium text-lg">
                      Click to upload
                    </span>
                    <span className="text-slate-600"> or drag and drop</span>
                  </label>
                  <p className="text-sm text-slate-500 mt-2">PDF up to 10MB</p>

                  {pdfFile && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
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