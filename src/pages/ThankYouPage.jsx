import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, Copy, Check, ExternalLink, Calendar, ArrowRight } from "lucide-react";

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

  const timeline = [
    { date: "Now", title: "Submission Received", description: "Your abstract has been successfully submitted", done: true },
    { date: "Jan 7 - 28", title: "Review Period", description: "Committee evaluates all submissions" },
    { date: "Jan 28", title: "Decision Notification", description: "You'll receive an email with the decision" },
    { date: "Feb 18", title: "Final Slides Due", description: "If accepted, submit your presentation" },
    { date: "Feb 25", title: "Research Forum", description: "Present your work!" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Submission Received!
          </h1>
          <p className="text-lg text-slate-600">
            Thank you for submitting to NEOMED Research Forum 2026
          </p>
        </div>

        {/* Magic Link Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <ExternalLink className="w-5 h-5 text-[#0077AA]" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 mb-1">Your Tracking Link</h2>
              <p className="text-sm text-slate-600">
                Use this link to check your submission status anytime. We've also sent it to your email.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 truncate font-mono">
              {magicLink}
            </div>
            <button
              onClick={copyLink}
              className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                copied
                  ? "bg-green-100 text-green-700"
                  : "bg-[#0077AA] text-white hover:bg-[#005F89]"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>

          <button
            onClick={() => navigate(`/view/${token}`)}
            className="w-full mt-4 px-6 py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            View My Submission
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Timeline Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-slate-600" />
            </div>
            <h2 className="font-semibold text-slate-900">What Happens Next?</h2>
          </div>

          <div className="space-y-0">
            {timeline.map((item, idx) => (
              <div key={idx} className="flex gap-4">
                {/* Timeline Line */}
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    item.done ? "bg-green-500" : "bg-slate-300"
                  }`} />
                  {idx < timeline.length - 1 && (
                    <div className="w-0.5 h-full bg-slate-200 my-1" />
                  )}
                </div>

                {/* Content */}
                <div className="pb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                      item.done 
                        ? "bg-green-100 text-green-700" 
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {item.date}
                    </span>
                  </div>
                  <h3 className="font-medium text-slate-900">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reminder Note */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm text-amber-800">
            <span className="font-semibold">📌 Remember:</span> Save your tracking link! You'll need it to check your submission status. No login required.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex-1 px-6 py-3 border border-slate-200 bg-white text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors text-center"
          >
            Return to Home
          </button>
          <button
            onClick={() => navigate(`/view/${token}`)}
            className="flex-1 px-6 py-3 bg-[#0077AA] text-white font-medium rounded-xl hover:bg-[#005F89] transition-colors flex items-center justify-center gap-2"
          >
            View Submission
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Contact */}
        <p className="mt-8 text-center text-sm text-slate-500">
          Questions? Contact us at{" "}
          <a href="mailto:sbadat@neomed.edu" className="text-[#0077AA] hover:underline font-medium">
            sbadat@neomed.edu
          </a>
        </p>
      </div>
    </div>
  );
}