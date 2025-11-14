import { useState } from "react";
import { Award, BarChart3, Layers, ChevronRight } from "lucide-react";
import Stat from "../components/Stat";

export default function ShowcasePage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const abstracts = [
    { id: 1, title: "AI-Powered Early Detection of Cardiovascular Disease Using Deep Learning Models",
      authors: "Chen M, Rodriguez K, Park S", department: "Cardiology",
      category: "Clinical Research", keywords: ["AI","Cardiovascular","Deep Learning"],
      excerpt: "Our study demonstrates a novel deep learning approach achieving 94% accuracy in early cardiovascular disease detection..." },
    { id: 2, title: "Novel Gene Therapy Approaches for Treatment-Resistant Pediatric Leukemia",
      authors: "Thompson J, Williams A, Davis R", department: "Oncology",
      category: "Basic Science", keywords: ["Gene Therapy","Pediatric","Leukemia"],
      excerpt: "This research presents breakthrough findings in CRISPR-based gene editing for pediatric ALL patients..." },
    { id: 3, title: "Virtual Reality Simulation in Medical Student Surgical Training: A Randomized Trial",
      authors: "Martinez L, Johnson P, Brown K", department: "Surgery",
      category: "Medical Education", keywords: ["VR","Simulation","Education"],
      excerpt: "Implementation of VR-based surgical training showed 40% improvement in student performance metrics..." },
    { id: 4, title: "Community Health Interventions Reducing Diabetes Prevalence in Rural Ohio",
      authors: "Anderson B, Taylor M, White D", department: "Internal Medicine",
      category: "Public Health", keywords: ["Diabetes","Community Health","Rural Medicine"],
      excerpt: "Our community-based intervention program resulted in a 28% reduction in Type 2 diabetes incidence..." },
    { id: 5, title: "Biomarker Discovery for Early Alzheimer's Detection Using Proteomics",
      authors: "Kim H, Patel N, Garcia E", department: "Neurology",
      category: "Basic Science", keywords: ["Alzheimer's","Biomarkers","Proteomics"],
      excerpt: "Identification of three novel protein biomarkers showing 89% sensitivity for preclinical Alzheimer's..." },
    { id: 6, title: "Telemedicine Implementation Improving Mental Health Access During COVID-19",
      authors: "Roberts C, Lee S, Murphy T", department: "Psychiatry",
      category: "Public Health", keywords: ["Telemedicine","Mental Health","COVID-19"],
      excerpt: "Analysis of 5,000 telepsychiatry visits demonstrating improved patient outcomes and accessibility..." },
    { id: 7, title: "Nanoparticle Drug Delivery Systems for Targeted Cancer Therapy",
      authors: "Zhang W, Cohen R, Smith J", department: "Oncology",
      category: "Basic Science", keywords: ["Nanoparticles","Drug Delivery","Cancer"],
      excerpt: "Development of pH-responsive nanocarriers achieving 85% tumor targeting efficiency..." },
    { id: 8, title: "Machine Learning Algorithms Predicting Emergency Department Overcrowding",
      authors: "Wilson E, Brown M, Davis K", department: "Emergency Medicine",
      category: "Clinical Research", keywords: ["Machine Learning","Emergency Medicine","Healthcare Analytics"],
      excerpt: "Predictive model achieving 91% accuracy in forecasting ED patient volume 48 hours in advance..." },
  ];

  const filtered = abstracts.filter((a) => {
    const catOK = selectedCategory === "all" || a.category === selectedCategory;
    const s = searchTerm.toLowerCase();
    const searchOK = a.title.toLowerCase().includes(s) ||
      a.authors.toLowerCase().includes(s) ||
      a.keywords.some((k) => k.toLowerCase().includes(s));
    return catOK && searchOK;
  });

  return (
    <div className="min-h-screen py-16 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 border border-green-200 rounded-full mb-6">
            <Award className="w-4 h-4 mr-2 text-green-600" />
            <span className="text-sm font-medium text-green-900">Accepted Abstracts</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Research Showcase</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Explore cutting-edge research accepted for presentation at NEOMED Research Forum 2025
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, author, or keyword..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div className="md:w-64">
              <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-indigo-500 focus:outline-none bg-white"
              >
                <option value="all">All Categories</option>
                <option value="Clinical Research">Clinical Research</option>
                <option value="Medical Education">Medical Education</option>
                <option value="Basic Science">Basic Science</option>
                <option value="Public Health">Public Health</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Showing {filtered.length} of {abstracts.length} abstracts
            </p>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm border border-slate-300 text-slate-700 rounded hover:bg-slate-50">
                <BarChart3 className="w-4 h-4 inline mr-1" /> Export
              </button>
              <button className="px-3 py-1 text-sm border border-slate-300 text-slate-700 rounded hover:bg-slate-50">
                <Layers className="w-4 h-4 inline mr-1" /> Print
              </button>
            </div>
          </div>
        </div>

        {/* Abstract Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filtered.map((a) => (
            <div key={a.id} className="bg-white border border-slate-200 rounded-lg p-6 hover:border-indigo-300 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  a.category === "Clinical Research" ? "bg-blue-100 text-blue-700" :
                  a.category === "Medical Education" ? "bg-green-100 text-green-700" :
                  a.category === "Basic Science" ? "bg-purple-100 text-purple-700" :
                  "bg-orange-100 text-orange-700"
                }`}>
                  {a.category}
                </span>
                <span className="text-xs text-slate-500">{a.department}</span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                {a.title}
              </h3>

              <p className="text-sm text-slate-600 mb-3">{a.authors}</p>
              <p className="text-sm text-slate-700 mb-4">{a.excerpt}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {a.keywords.map((k) => (
                  <span key={k} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">{k}</span>
                ))}
              </div>

              <button className="text-indigo-600 font-medium text-sm flex items-center hover:text-indigo-700">
                View Full Abstract <ChevronRight className="ml-1 w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Stats footer */}
        <div className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <Stat value="342" label="Total Submissions" />
            <Stat value="87%" label="Acceptance Rate" />
            <Stat value="24" label="Departments" />
            <Stat value="156" label="Presenters" />
          </div>
        </div>
      </div>
    </div>
  );
}
