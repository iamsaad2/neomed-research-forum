import { useEffect, useRef, useState } from "react";
import {
  Zap, ArrowRight, ChevronRight, TrendingUp,
  Database, Target, Shield,
  Stethoscope, BookOpen, FlaskConical, Globe,
  Award, CheckCircle, AlertCircle, Send,
} from "lucide-react";
import Stat from "../components/Stat";
import FeatureCard from "../components/FeatureCard";

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
      const deadline = new Date("2026-01-01T23:59:59");
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

  const departments = [
    { name: "Cardiology", submissions: 45, color: "from-red-500 to-red-600" },
    { name: "Neurology", submissions: 38, color: "from-purple-500 to-purple-600" },
    { name: "Oncology", submissions: 42, color: "from-orange-500 to-orange-600" },
    { name: "Pediatrics", submissions: 28, color: "from-blue-500 to-blue-600" },
    { name: "Internal Medicine", submissions: 51, color: "from-green-500 to-green-600" },
    { name: "Surgery", submissions: 33, color: "from-indigo-500 to-indigo-600" },
    { name: "Psychiatry", submissions: 22, color: "from-pink-500 to-pink-600" },
    { name: "Radiology", submissions: 19, color: "from-yellow-500 to-yellow-600" },
    { name: "Pathology", submissions: 24, color: "from-teal-500 to-teal-600" },
    { name: "Emergency Med", submissions: 31, color: "from-cyan-500 to-cyan-600" },
    { name: "Anesthesiology", submissions: 18, color: "from-emerald-500 to-emerald-600" },
    { name: "Dermatology", submissions: 15, color: "from-violet-500 to-violet-600" },
  ];

  const researchTopics = [
    { name: "AI in Medicine", size: "text-3xl", weight: "font-bold" },
    { name: "Gene Therapy", size: "text-2xl", weight: "font-semibold" },
    { name: "Immunotherapy", size: "text-xl", weight: "font-medium" },
    { name: "Telemedicine", size: "text-2xl", weight: "font-semibold" },
    { name: "Precision Medicine", size: "text-3xl", weight: "font-bold" },
    { name: "Mental Health", size: "text-xl", weight: "font-medium" },
    { name: "Drug Discovery", size: "text-lg", weight: "font-normal" },
    { name: "Biomarkers", size: "text-2xl", weight: "font-semibold" },
    { name: "Clinical Trials", size: "text-xl", weight: "font-medium" },
    { name: "Digital Health", size: "text-2xl", weight: "font-semibold" },
    { name: "Nanomedicine", size: "text-lg", weight: "font-normal" },
    { name: "Stem Cells", size: "text-xl", weight: "font-medium" },
  ];

  const categories = [
    { name: "Clinical Research", icon: Stethoscope, percentage: 78, submissions: 267, color: "from-blue-500 to-blue-600", description: "Patient-centered studies and clinical trials" },
    { name: "Medical Education", icon: BookOpen, percentage: 65, submissions: 223, color: "from-green-500 to-green-600", description: "Innovative teaching methodologies and curriculum development" },
    { name: "Basic Science", icon: FlaskConical, percentage: 82, submissions: 281, color: "from-purple-500 to-purple-600", description: "Fundamental research and laboratory investigations" },
    { name: "Public Health", icon: Globe, percentage: 71, submissions: 244, color: "from-orange-500 to-orange-600", description: "Population health and epidemiological studies" },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden text-white" style={{background: `linear-gradient(135deg, #004963 0%, #0072BC 70%, #62B5E5 100%)`, fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'}}>
        <div className="absolute top-0 right-0 w-96 h-96 opacity-10 blur-3xl" style={{backgroundColor: '#62B5E5'}} />
        <div className="absolute bottom-0 left-0 w-96 h-96 opacity-10 blur-3xl" style={{backgroundColor: '#0072BC'}} />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center px-5 py-3 backdrop-blur-sm border rounded-full mb-6 shadow-lg" style={{backgroundColor: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.3)'}}>
              <span className="text-sm font-semibold text-white">Submissions Open - Deadline January 1st</span>
            </div>

            <div className="mb-4">
              <span className="text-lg font-medium tracking-wide text-white/90">Northeast Ohio Medical University</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-8 text-white leading-tight">
              Research Forum 2025
            </h1>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button className="px-8 py-4 bg-white text-[#004963] font-semibold rounded-lg transition-all transform hover:scale-105 hover:shadow-xl flex items-center justify-center">
                Submit Your Abstract
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg transition-all flex items-center justify-center hover:bg-white/10">
                View Program
                <ChevronRight className="ml-2 w-5 h-5" />
              </button>
            </div>

            {/* Countdown */}
            <div className="grid grid-cols-3 gap-6 max-w-sm mx-auto">
              {[
                ["Days", timeLeft.days],
                ["Hours", timeLeft.hours],
                ["Minutes", timeLeft.minutes],
              ].map(([label, val]) => (
                <div key={label} className="backdrop-blur-sm border rounded-xl p-4 text-center shadow-lg" style={{backgroundColor: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.3)'}}>
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
            <Stat value={`${stats.submissions}+`} label="Abstract Submissions" color="text-[#0072BC]" />
            <Stat value={stats.departments} label="Departments" color="text-[#004963]" />
            <Stat value={stats.presenters} label="Presenters" color="text-[#62B5E5]" />
            <Stat value={stats.awards} label="Awards & Recognition" color="text-[#0072BC]" />
          </div>
        </div>
      </section>

      {/* Department Heatmap */}
      <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Research Activity Across NEOMED</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Real-time visualization of research engagement from our medical, pharmacy, and graduate colleges</p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
            {departments.map((dept) => (
              <div key={dept.name} className="relative group transform hover:scale-105 transition-all duration-200">
                <div className={`h-24 bg-gradient-to-br ${dept.color} rounded-lg p-4 flex flex-col justify-between text-white overflow-hidden`}>
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity rounded-lg" />
                  <div className="relative z-10">
                    <div className="text-xs font-medium opacity-90">{dept.name}</div>
                    <div className="text-2xl font-bold">{dept.submissions}</div>
                  </div>
                  <div className="w-full bg-white/20 h-1 rounded-full relative">
                    <div className="absolute left-0 top-0 h-full bg-white/60 rounded-full" style={{ width: `${(dept.submissions / 51) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Research Categories</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Track submission progress across our four main research domains</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category, i) => (
              <div key={category.name} className="bg-white border border-slate-200 rounded-lg p-6 hover:border-indigo-300 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <category.icon className="w-8 h-8 text-slate-700 group-hover:text-indigo-600 transition-colors" />
                  <div className="relative w-16 h-16">
                    <svg className="transform -rotate-90 w-16 h-16">
                      <circle cx="32" cy="32" r="28" stroke="#e2e8f0" strokeWidth="4" fill="none" />
                      <circle
                        cx="32" cy="32" r="28" stroke={i % 2 === 0 ? "#6366f1" : "#8b5cf6"} strokeWidth="4" fill="none"
                        strokeDasharray={`${2 * Math.PI * 28}`}
                        strokeDashoffset={`${2 * Math.PI * 28 * (1 - category.percentage / 100)}`}
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-slate-900">{category.percentage}%</span>
                    </div>
                  </div>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{category.name}</h3>
                <p className="text-sm text-slate-600 mb-3">{category.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">{category.submissions} submissions</span>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Topics Cloud */}
      <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Trending Research at NEOMED</h2>
          <p className="text-slate-600 max-w-2xl mx-auto mb-8">Discover the cutting-edge research shaping healthcare in Northeast Ohio and beyond</p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {researchTopics.map((t, i) => (
              <div key={i} className={`${t.size} ${t.weight} text-slate-700 hover:text-[#0072BC] transition-all cursor-pointer transform hover:scale-110`}>
                {t.name}
              </div>
            ))}
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
            <div className="absolute left-1/2 -translate-x-1/2 w-1 h-full" style={{background: `linear-gradient(180deg, #0072BC, #004963)`}} />
            <div className="space-y-12">
              {[
                { date: "January 15, 2025", title: "Submissions Open", status: "completed", icon: CheckCircle, description: "Abstract submission portal opens for all researchers" },
                { date: "March 1, 2025", title: "Submission Deadline", status: "active", icon: AlertCircle, description: "Final deadline for abstract submissions - 11:59 PM EST" },
                { date: "April 15, 2025", title: "Acceptance Notifications", status: "upcoming", icon: Send, description: "Authors notified of acceptance decisions" },
                { date: "May 20, 2025", title: "Research Forum", status: "upcoming", icon: Award, description: "Annual NEOMED Research Forum - Full day event" },
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

      {/* Extras */}
      <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Database className="w-10 h-10 mb-4" style={{color: '#0072BC'}} />}
              title="NEOMED Research Archive"
              text="Explore our comprehensive database of student and faculty research from across all three colleges"
              cta="Browse Research"
            />
            <FeatureCard
              icon={<Target className="w-10 h-10 mb-4" style={{color: '#004963'}} />}
              title="Research Mentorship"
              text="Connect with NEOMED faculty mentors to guide your research journey and advance your scholarly work"
              cta="Find a Mentor"
              ctaColor="text-[#004963] group-hover:text-[#0072BC]"
            />
            <FeatureCard
              icon={<Shield className="w-10 h-10 mb-4" style={{color: '#62B5E5'}} />}
              title="IRB & Research Ethics"
              text="Navigate NEOMED's research ethics requirements and ensure compliance with institutional standards"
              cta="View Guidelines"
              ctaColor="text-[#62B5E5] group-hover:text-[#0072BC]"
            />
          </div>
        </div>
      </section>
    </div>
  );
}