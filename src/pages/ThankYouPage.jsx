import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, Mail, Calendar, ArrowRight, Eye } from "lucide-react";

export default function ThankYouPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const magicLink = `${window.location.origin}/view/${token}`;

  const copyLink = () => {
    navigator.clipboard.writeText(magicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen py-16 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Submission Received!
          </h1>
          <p className="text-xl text-slate-600">
            Thank you for submitting to NEOMED Research Forum 2026
          </p>
        </div>

        {/* Confirmation Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm mb-6">
          <div className="flex items-start gap-4 mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                Confirmation Email Sent
              </h3>
              <p className="text-sm text-blue-800">
                We've sent a confirmation email with your unique tracking link. 
                Please check your inbox (and spam folder just in case).
              </p>
            </div>
          </div>

          <h2 className="text-lg font-bold text-slate-900 mb-4">
            View Your Submission Anytime
          </h2>
          <p className="text-slate-600 mb-4">
            Use this link to check the status of your abstract at any time:
          </p>

          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={magicLink}
              readOnly
              className="flex-1 px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
            />
            <button
              onClick={copyLink}
              className="px-4 py-2 bg-[#0099CC] text-white rounded-lg hover:bg-[#0077AA] transition-colors text-sm font-medium"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          <button
            onClick={() => navigate(`/view/${token}`)}
            className="w-full px-6 py-3 bg-[#0099CC] text-white font-medium rounded-lg hover:bg-[#0077AA] transition-colors flex items-center justify-center"
          >
            <Eye className="w-5 h-5 mr-2" />
            View My Submission Now
          </button>
        </div>

        {/* Timeline Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-[#0099CC]" />
            What Happens Next?
          </h2>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">Now: Submission Received</h3>
                <p className="text-sm text-slate-600">Your abstract has been successfully submitted</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">1</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">January 7 - 28, 2026</h3>
                <p className="text-sm text-slate-600">Review Period - Committee evaluates all submissions</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">2</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">January 28, 2026</h3>
                <p className="text-sm text-slate-600">Decision Notification - You'll receive an email with the decision</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">3</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">February 18, 2026</h3>
                <p className="text-sm text-slate-600">Final Slides Due - If accepted, submit your presentation slides</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-purple-600">🎉</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">February 25, 2026</h3>
                <p className="text-sm text-slate-600">Research Forum Day - Present your work!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-yellow-900 mb-2">📌 Important Reminders</h3>
          <ul className="space-y-2 text-sm text-yellow-800">
            <li>• <strong>Save your tracking link</strong> - You'll need it to check your status</li>
            <li>• <strong>Check your email</strong> - We've sent a confirmation with the same link</li>
            <li>• <strong>No edits allowed</strong> - Submissions cannot be modified after submitting</li>
            <li>• <strong>Status updates</strong> - Your submission page will update as we review</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center"
          >
            Return to Home
          </button>
          <button
            onClick={() => navigate(`/view/${token}`)}
            className="flex-1 px-6 py-3 bg-[#0099CC] text-white font-medium rounded-lg hover:bg-[#0077AA] transition-colors flex items-center justify-center"
          >
            View Submission
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-slate-600">
          Questions? Contact us at{" "}
          <a href="mailto:sbadat@neomed.edu" className="text-[#0099CC] hover:text-[#0077AA] font-medium">
            sbadat@neomed.edu
          </a>
        </div>
      </div>
    </div>
  );
}