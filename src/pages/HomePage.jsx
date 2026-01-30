import { useEffect, useState } from "react";
import {
  ArrowRight,
  Calendar,
  Clock,
  Award,
  Users,
  FileCheck,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function HomePage() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  // countdown
  useEffect(() => {
    const calc = () => {
      const deadline = new Date("2026-01-12T23:59:59");
      const now = new Date();
      const diff = deadline - now;
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
        });
      }
    };
    calc();
    const id = setInterval(calc, 60000);
    return () => clearInterval(id);
  }, []);

  // ==========================================
  // SUBMISSION STATUS FLAG - Easy to toggle
  // Set to false to reopen submissions
  // ==========================================
  const SUBMISSIONS_CLOSED = false;

  return (
    <div>
      {/* Hero Section - Professional and Clean */}
      <section className="relative bg-gradient-to-br from-slate-50 to-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto">
            {/* Deadline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-full mb-8 shadow-sm">
              <Clock className="w-4 h-4 text-[#0099CC]" />
              <span className="text-sm font-medium text-slate-700">
                Submission Deadline: January 12, 2026
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Research Forum 2026
            </h1>

            <p className="text-xl text-slate-600 mb-10 leading-relaxed">
              Northeast Ohio Medical University's premier annual research showcase.
              {SUBMISSIONS_CLOSED 
                ? " Abstract submissions have closed. Thank you to all who submitted!"
                : " Submit your abstract to share valuable research with the medical community."
              }
            </p>

            {/* Primary CTA - Updated for closed status */}
            {SUBMISSIONS_CLOSED ? (
              <div className="inline-flex items-center px-8 py-4 bg-slate-400 text-white font-semibold rounded-lg cursor-not-allowed">
                Submissions Closed
              </div>
            ) : (
              <Link 
                to="/submit"
                className="inline-flex items-center px-8 py-4 bg-[#0077AA] text-white font-semibold rounded-lg shadow-lg hover:bg-[#005F89] transition-colors"
              >
                Submit Your Abstract
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            )}

            {/* Countdown Timer - Hidden when closed */}
            {!SUBMISSIONS_CLOSED && (
              <div className="mt-12 pt-12 border-t border-slate-200">
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">
                  Time Remaining
                </p>
                <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
                  {[
                    ["Days", timeLeft.days],
                    ["Hours", timeLeft.hours],
                    ["Minutes", timeLeft.minutes],
                  ].map(([label, val]) => (
                    <div key={label} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                      <div className="text-3xl font-bold text-slate-900 mb-1">{val}</div>
                      <div className="text-xs font-medium text-slate-500 uppercase">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Key Dates - Clean Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Key Dates</h2>
            <p className="text-lg text-slate-600">Mark these key milestones on your calendar</p>
          </div>

          <div className="space-y-6">
            {[
              { 
                date: "December 15, 2025", 
                title: "Abstract Submissions Open", 
                description: "Submission portal opens for all researchers",
                icon: Calendar,
                status: "complete"
              },
              { 
                date: "January 12, 2026", 
                title: "Abstract Submission Deadline", 
                description: "Submissions are now closed",
                icon: Clock,
                status: "complete"
              },
              { 
                date: "January 28, 2026", 
                title: "Acceptance Notification", 
                description: "Authors will be notified of their submission status",
                icon: Award,
                status: "current"
              },
              { 
                date: "February 21, 2026", 
                title: "Final Presentation Due", 
                description: "Accepted presenters submit final slides",
                icon: Users,
                status: "upcoming"
              },
              { 
                date: "February 25, 2026", 
                title: "Research Forum Day", 
                description: "Full-day research forum and presentations",
                icon: Award,
                status: "event"
              },
            ].map((item, idx) => (
              <div 
                key={idx}
                className={`border rounded-lg p-6 transition-all ${
                  item.status === "current"
                    ? "bg-[#0099CC]/10 border-[#0099CC] ring-2 ring-[#0099CC]" 
                    : item.status === "complete"
                    ? "bg-slate-100 border-slate-300 opacity-60"
                    : "bg-white border-slate-200 hover:border-[#0099CC] hover:shadow-md"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                    item.status === "current" ? "bg-[#0099CC]" :
                    item.status === "complete" ? "bg-slate-400" :
                    item.status === "event" ? "bg-[#0099CC]" : "bg-slate-100"
                  }`}>
                    <item.icon className={`w-6 h-6 ${
                      item.status === "current" || item.status === "complete" || item.status === "event" 
                        ? "text-white" 
                        : "text-slate-600"
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between mb-2">
                      <h3 className={`text-lg font-bold ${
                        item.status === "current" ? "text-[#0077AA]" : "text-slate-900"
                      }`}>
                        {item.title}
                      </h3>
                      <span className={`text-sm font-medium ${
                        item.status === "current" ? "text-[#0099CC]" : "text-slate-500"
                      }`}>
                        {item.date}
                      </span>
                    </div>
                    <p className={
                      item.status === "current" ? "text-slate-700" : "text-slate-600"
                    }>
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action - Updated for closed status */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {SUBMISSIONS_CLOSED ? (
            <>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Thank You for Your Submissions!
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Abstract submissions have closed. The review committee is now evaluating all submissions.
                Authors will be notified of decisions by January 28, 2026.
              </p>
              <div className="inline-flex items-center px-6 py-3 bg-slate-200 text-slate-600 font-medium rounded-lg">
                Review Period in Progress
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Ready to Share Your Research?
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Join fellow clinicians and researchers in advancing medical knowledge at NEOMED's Research Forum 2026.
              </p>
              <Link 
                to="/submit"
                className="inline-flex items-center px-8 py-4 bg-[#0077AA] text-white font-semibold rounded-lg shadow-lg hover:bg-[#005F89] transition-colors"
              >
                Submit Your Abstract
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </>
          )}
        </div>
      </section>
    </div>
  );
}