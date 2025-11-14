import { FileText, CheckCircle, X, AlertCircle, Send } from "lucide-react";
import Input from "../components/Input";
import Select from "../components/Select";

export default function SubmitPage({
  formData, setFormData,
  isSubmitting, setIsSubmitting,
  submitSuccess, setSubmitSuccess,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({ title: "", authors: "", department: "", category: "", abstract: "", email: "", keywords: "" });
      setTimeout(() => setSubmitSuccess(false), 5000);
    }, 2000);
  };

  return (
    <div className="min-h-screen py-16 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-indigo-100 border border-indigo-200 rounded-full mb-6">
            <FileText className="w-4 h-4 mr-2 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-900">Submission Portal</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Submit Your Abstract</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Share your groundbreaking research with the NEOMED community. All submissions undergo peer review.
          </p>
        </div>

        {submitSuccess && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
              <span className="text-green-900 font-medium">
                Abstract submitted successfully! Confirmation email sent.
              </span>
            </div>
            <button onClick={() => setSubmitSuccess(false)} className="text-green-600 hover:text-green-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-8">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Input
              label="Abstract Title *"
              value={formData.title}
              onChange={(v) => setFormData({ ...formData, title: v })}
              placeholder="Enter your abstract title"
              required
            />
            <Input
              type="email"
              label="Corresponding Author Email *"
              value={formData.email}
              onChange={(v) => setFormData({ ...formData, email: v })}
              placeholder="author@neomed.edu"
              required
            />
          </div>

          <div className="mb-6">
            <Input
              label="Authors *"
              value={formData.authors}
              onChange={(v) => setFormData({ ...formData, authors: v })}
              placeholder="Smith J, Johnson K, Williams R"
              required
              helper="Separate multiple authors with commas"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Select
              label="Department *"
              value={formData.department}
              onChange={(v) => setFormData({ ...formData, department: v })}
              required
              options={[
                ["cardiology", "Cardiology"], ["neurology", "Neurology"], ["oncology", "Oncology"],
                ["pediatrics", "Pediatrics"], ["internal", "Internal Medicine"], ["surgery", "Surgery"],
                ["psychiatry", "Psychiatry"], ["radiology", "Radiology"], ["pathology", "Pathology"],
                ["emergency", "Emergency Medicine"], ["anesthesiology", "Anesthesiology"], ["dermatology", "Dermatology"],
              ]}
            />
            <Select
              label="Research Category *"
              value={formData.category}
              onChange={(v) => setFormData({ ...formData, category: v })}
              required
              options={[
                ["clinical", "Clinical Research"],
                ["education", "Medical Education"],
                ["basic", "Basic Science"],
                ["public", "Public Health"],
              ]}
            />
          </div>

          <div className="mb-6">
            <Input
              label="Keywords"
              value={formData.keywords}
              onChange={(v) => setFormData({ ...formData, keywords: v })}
              placeholder="AI, machine learning, diagnostics, precision medicine"
              helper="Enter 3-5 keywords separated by commas"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Abstract Text * (Max 300 words)</label>
            <textarea
              required
              value={formData.abstract}
              onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-indigo-500 focus:outline-none"
              rows="8"
              placeholder={"Background: \nMethods: \nResults: \nConclusion: "}
            />
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-slate-500">Use structured format: Background, Methods, Results, Conclusion</span>
              <span className={`${formData.abstract.split(" ").filter(Boolean).length > 300 ? "text-red-600" : "text-slate-500"}`}>
                {formData.abstract.split(" ").filter(Boolean).length}/300 words
              </span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-slate-900 mb-2 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 text-indigo-600" />
              Submission Guidelines
            </h3>
            <ul className="space-y-1 text-sm text-slate-600">
              <li>• All abstracts must be original work not previously published</li>
              <li>• Research must comply with IRB and ethical guidelines</li>
              <li>• Presenting author must register for the conference</li>
              <li>• Submissions are final and cannot be edited after deadline</li>
            </ul>
          </div>

          <div className="flex items-center mb-6">
            <input type="checkbox" required id="agreement" className="mr-3" />
            <label htmlFor="agreement" className="text-sm text-slate-700">
              I confirm that this abstract represents original work and all authors have approved this submission *
            </label>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 px-6 py-3 font-medium text-white rounded-lg transition-all ${
                isSubmitting ? "bg-slate-400 cursor-not-allowed"
                              : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  Submit Abstract <Send className="ml-2 w-4 h-4" />
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                setFormData({ title: "", authors: "", department: "", category: "", abstract: "", email: "", keywords: "" })
              }
              className="px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50"
            >
              Clear Form
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-600">
            Need help? Contact us at{" "}
            <a href="mailto:research@neomed.edu" className="text-indigo-600 hover:text-indigo-700 font-medium">
              research@neomed.edu
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
