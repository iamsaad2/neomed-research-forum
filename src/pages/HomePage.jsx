import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CheckCircle, AlertCircle, Send, Presentation
} from "lucide-react";
import Stat from "../components/Stat";
import { Link } from "react-router-dom";

export default function HomePage() {
  const [stats, setStats] = useState({ submissions: 0, departments: 0, presenters: 0, awards: 0 });
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  const statsRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  // reveal stats when in view
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true);
    }, { threshold: 0.1 });
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  // animate counters
  useEffect(() => {
    if (!isVisible) return;
    const duration = 2000, steps = 60, stepMs = duration / steps;
    let t = 0;
    const timer = setInterval(() => {
      t += stepMs;
      const p = Math.min(t / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setStats({
        submissions: Math.floor(342 * e),
        departments: Math.floor(24 * e),
        presenters: Math.floor(156 * e),
        awards: Math.floor(12 * e),
      });
      if (p >= 1) clearInterval(timer);
    }, stepMs);
    return () => clearInterval(timer);
  }, [isVisible]);

  // countdown
  useEffect(() => {
    const calc = () => {
      const deadline = new Date("2026-01-05T23:59:59");
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

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden text-white bg-gradient-to-br from-[#0099CC] to-[#0077AA]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center px-5 py-3 backdrop-blur-sm border border-white/30 rounded-full mb-6 shadow-lg bg-white/15">
              <span className="text-sm font-semibold text-white">Submissions Open - Deadline January 5th</span>
            </div>

            <div className="mb-4">
              <span className="text-lg font-medium tracking-wide text-white/90">Northeast Ohio Medical University</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-8 text-white leading-tight">
              Research Forum 2025
            </h1>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link 
                to="/submit"
                className="px-8 py-4 bg-white text-[#0099CC] font-semibold rounded-lg transition-all transform hover:scale-105 hover:shadow-xl flex items-center justify-center"
              >
                Submit Your Abstract
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>

            {/* Countdown */}
            <div className="grid grid-cols-3 gap-6 max-w-sm mx-auto">
              {[
                ["Days", timeLeft.days],
                ["Hours", timeLeft.hours],
                ["Minutes", timeLeft.minutes],
              ].map(([label, val]) => (
                <div key={label} className="backdrop-blur-sm border border-white/30 rounded-xl p-4 text-center shadow-lg bg-white/15">
                  <div className="text-2xl font-bold text-white mb-1">{val}</div>
                  <div className="text-xs font-medium text-white/80 uppercase tracking-wider">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Animated Statistics */}
      <section ref={statsRef} className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <Stat value={`${stats.submissions}+`} label="Abstract Submissions" color="text-[#0099CC]" />
            <Stat value={stats.departments} label="Departments" color="text-slate-900" />
            <Stat value={stats.presenters} label="Presenters" color="text-[#0099CC]" />
            <Stat value={stats.awards} label="Awards & Recognition" color="text-slate-900" />
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">NEOMED Research Forum 2025</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Key dates for our premier annual research event - mark your calendars</p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 -translate-x-1/2 w-1 h-full bg-gradient-to-b from-[#0099CC] to-slate-300" />
            <div className="space-y-12">
              {[
                { date: "November 21, 2025", title: "Submissions Open", status: "active", icon: CheckCircle, description: "Abstract submission portal opens for all researchers" },
                { date: "January 7, 2025", title: "Submission Deadline", status: "upcoming", icon: AlertCircle, description: "Final deadline for abstract submissions - 11:59 PM EST" },
                { date: "January 28, 2025", title: "Acceptance Notifications", status: "upcoming", icon: Send, description: "Authors notified of acceptance decisions" },
                { date: "February 18, 2025", title: "Final Slides Due", status: "upcoming", icon: Presentation, description: "Accepted authors final slides due" },
                { date: "February 25, 2025", title: "Research Forum", status: "upcoming", icon: CheckCircle, description: "Annual NEOMED Research Forum - Full day event" },
              ].map((item, idx) => (
                <div key={item.title} className={`relative flex items-center ${idx % 2 === 0 ? "justify-start" : "justify-end"}`}>
                  <div className={`w-5/12 ${idx % 2 === 0 ? "text-right pr-8" : "text-left pl-8"}`}>
                    <div className={`inline-block p-6 bg-white border rounded-lg ${
                      item.status === "completed"
                        ? "border-green-200 bg-green-50"
                        : item.status === "active"
                        ? "border-orange-200 bg-orange-50"
                        : "border-slate-200"
                    } hover:shadow-lg transition-all`}>
                      <div className="flex items-center gap-3 mb-2">
                        <item.icon className={`w-5 h-5 ${
                          item.status === "completed" ? "text-green-600" :
                          item.status === "active" ? "text-orange-600" : "text-slate-400"
                        }`} />
                        <span className="text-sm font-medium text-slate-600">{item.date}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{item.title}</h3>
                      <p className="text-sm text-slate-600">{item.description}</p>
                    </div>
                  </div>
                  <div className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full ${
                    item.status === "completed" ? "bg-green-600" :
                    item.status === "active" ? "bg-orange-600 animate-pulse" : "bg-slate-400"
                  } border-4 border-white`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}