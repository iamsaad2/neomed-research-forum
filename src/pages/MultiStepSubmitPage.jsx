import { useState } from "react";
import { FileText, ChevronRight, ChevronLeft, Upload, CheckCircle, X } from "lucide-react";
import { abstractAPI } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function MultiStepSubmitPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    authors: "",
    email: "",
    department: "",
    category: "",
    keywords: "",
    abstract: "",
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const totalSteps = 4;

  const steps = [
    { number: 1, title: "Basic Info", description: "Title, Authors, Email" },
    { number: 2, title: "Details", description: "Department, Category" },
    { number: 3, title: "Abstract", description: "Research Content" },
    { number: 4, title: "Review", description: "Confirm & Submit" },
  ];

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

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.title) newErrors.title = "Title is required";
      if (!formData.authors) newErrors.authors = "Authors are required";
      if (!formData.email) newErrors.email = "Email is required";
      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Please enter a valid email";
      }
    }

    if (step === 2) {
      if (!formData.department) newErrors.department = "Department is required";
      if (!formData.category) newErrors.category = "Category is required";
    }

    if (step === 3) {
      if (!formData.abstract) newErrors.abstract = "Abstract is required";
      const wordCount = formData.abstract.split(" ").filter(Boolean).length;
      if (wordCount > 300) {
        newErrors.abstract = `Abstract is ${wordCount} words (max 300)`;
      }
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
    
    console.log("🔵 handleSubmit called");
    console.log("📋 Current step:", currentStep);
    console.log("📝 Form data:", formData);
    
    if (!validateStep(currentStep)) {
      console.log("❌ Validation failed");
      return;
    }

    // Check if agreement checkbox is checked
    const agreementCheckbox = document.getElementById("agreement");
    console.log("✅ Checkbox element:", agreementCheckbox);
    console.log("✅ Checkbox checked:", agreementCheckbox?.checked);
    
    if (!agreementCheckbox || !agreementCheckbox.checked) {
      console.log("❌ Checkbox not checked");
      setErrors({ ...errors, submit: "Please confirm the agreement to submit" });
      return;
    }

    console.log("🚀 Starting submission...");
    setIsSubmitting(true);
    setErrors({});

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      if (pdfFile) {
        formDataToSend.append("pdfFile", pdfFile);
      }

      console.log("📤 Submitting abstract to API...");
      const response = await abstractAPI.submit(formDataToSend);
      console.log("📥 Response received:", response);

      if (response.success) {
        console.log("✅ Success! Token:", response.data.viewToken);
        console.log("🔄 Navigating to thank you page...");
        // Redirect to thank you page with token
        navigate(`/thank-you/${response.data.viewToken}`);
      } else {
        console.log("❌ Response not successful:", response);
      }
    } catch (error) {
      console.error("❌ Submission error:", error);
      setErrors({ ...errors, submit: error.message || "Failed to submit. Please try again." });
    } finally {
      setIsSubmitting(false);
      console.log("✅ Submission process complete");
    }
  };

  return (
    <div className="min-h-screen py-16 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-indigo-100 border border-indigo-200 rounded-full mb-6">
            <FileText className="w-4 h-4 mr-2 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-900">Submit Abstract</span>
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
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "bg-white border-slate-300 text-slate-400"
                  }`}
                >
                  {currentStep > step.number ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <span className="font-semibold">{step.number}</span>
                  )}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      currentStep > step.number ? "bg-indigo-600" : "bg-slate-200"
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
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Basic Information</h2>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Abstract Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none ${
                    errors.title
                      ? "border-red-300 focus:border-red-500"
                      : "border-slate-300 focus:border-indigo-500"
                  }`}
                  placeholder="Enter your abstract title"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Authors *
                </label>
                <input
                  type="text"
                  value={formData.authors}
                  onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none ${
                    errors.authors
                      ? "border-red-300 focus:border-red-500"
                      : "border-slate-300 focus:border-indigo-500"
                  }`}
                  placeholder="Smith J, Johnson K, Williams R"
                />
                {errors.authors && <p className="mt-1 text-sm text-red-600">{errors.authors}</p>}
                <p className="mt-1 text-sm text-slate-500">
                  Separate multiple authors with commas
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Corresponding Author Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none ${
                    errors.email
                      ? "border-red-300 focus:border-red-500"
                      : "border-slate-300 focus:border-indigo-500"
                  }`}
                  placeholder="author@neomed.edu"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                <p className="mt-1 text-sm text-slate-500">
                  We'll send your submission confirmation and status updates here
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Research Details */}
          {currentStep === 2 && (
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
                      : "border-slate-300 focus:border-indigo-500"
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
                </select>
                {errors.department && (
                  <p className="mt-1 text-sm text-red-600">{errors.department}</p>
                )}
              </div>

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
                      : "border-slate-300 focus:border-indigo-500"
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

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Keywords (Optional)
                </label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  placeholder="AI, machine learning, diagnostics"
                />
                <p className="mt-1 text-sm text-slate-500">Enter 3-5 keywords separated by commas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Upload PDF (Optional)
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                  <input
                    type="file"
                    id="pdfFile"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="pdfFile" className="cursor-pointer">
                    <span className="text-indigo-600 hover:text-indigo-700 font-medium">
                      Click to upload
                    </span>
                    <span className="text-slate-600"> or drag and drop</span>
                  </label>
                  <p className="text-xs text-slate-500 mt-1">PDF up to 10MB</p>
                  {pdfFile && (
                    <div className="mt-3 flex items-center justify-center text-sm text-slate-700">
                      <FileText className="w-4 h-4 mr-2 text-green-600" />
                      {pdfFile.name}
                      <button
                        type="button"
                        onClick={() => {
                          setPdfFile(null);
                          document.getElementById("pdfFile").value = "";
                        }}
                        className="ml-2 text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {errors.pdf && <p className="mt-2 text-sm text-red-600">{errors.pdf}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Abstract Text */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Abstract Content</h2>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Abstract Text * (Max 300 words)
                </label>
                <textarea
                  value={formData.abstract}
                  onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none ${
                    errors.abstract
                      ? "border-red-300 focus:border-red-500"
                      : "border-slate-300 focus:border-indigo-500"
                  }`}
                  rows="12"
                  placeholder="Background: &#10;Methods: &#10;Results: &#10;Conclusion: "
                />
                {errors.abstract && <p className="mt-1 text-sm text-red-600">{errors.abstract}</p>}
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-slate-500">
                    Use structured format: Background, Methods, Results, Conclusion
                  </span>
                  <span
                    className={`${
                      formData.abstract.split(" ").filter(Boolean).length > 300
                        ? "text-red-600 font-medium"
                        : "text-slate-500"
                    }`}
                  >
                    {formData.abstract.split(" ").filter(Boolean).length}/300 words
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Review Your Submission</h2>

              <div className="bg-slate-50 rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Title</h3>
                  <p className="text-slate-900">{formData.title}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Authors</h3>
                  <p className="text-slate-900">{formData.authors}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Email</h3>
                  <p className="text-slate-900">{formData.email}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-1">Department</h3>
                    <p className="text-slate-900 capitalize">{formData.department}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-1">Category</h3>
                    <p className="text-slate-900 capitalize">{formData.category}</p>
                  </div>
                </div>

                {formData.keywords && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-1">Keywords</h3>
                    <p className="text-slate-900">{formData.keywords}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Abstract</h3>
                  <p className="text-slate-900 whitespace-pre-line">{formData.abstract}</p>
                </div>

                {pdfFile && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-1">PDF</h3>
                    <p className="text-slate-900 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-green-600" />
                      {pdfFile.name}
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-900">
                  <strong>Important:</strong> Once submitted, you cannot edit your abstract. Please
                  review carefully before submitting.
                </p>
              </div>

              <div className="flex items-start">
                <input 
                  type="checkbox" 
                  id="agreement" 
                  className="mt-1 mr-3 w-4 h-4"
                />
                <label htmlFor="agreement" className="text-sm text-slate-700">
                  I confirm that this abstract represents original work and all authors have
                  approved this submission. I understand that I cannot edit this submission after
                  submitting.
                </label>
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
                className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
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
          <a href="mailto:sbadat@neomed.edu" className="text-indigo-600 hover:text-indigo-700">
            sbadat@neomed.edu
          </a>
        </div>
      </div>
    </div>
  );
}