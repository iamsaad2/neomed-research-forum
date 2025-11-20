import { useState, useEffect } from "react";
import { Award, BarChart3, Layers, ChevronRight, AlertCircle } from "lucide-react";
import Stat from "../components/Stat";
import { abstractAPI } from "../services/api";

export default function ShowcasePage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [abstracts, setAbstracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPublishedAbstracts();
  }, []);

  const fetchPublishedAbstracts = async () => {
    try {
      setLoading(true);
      const response = await abstractAPI.getPublished();
      
      if (response.success) {
        // Transform backend data to match frontend format
        const transformedData = response.data.map((abstract) => ({
          id: abstract._id,
          title: abstract.title,
          authors: abstract.authors,
          department: getDepartmentLabel(abstract.department),
          category: getCategoryLabel(abstract.category),
          keywords: abstract.keywords ? abstract.keywords.split(',').map(k => k.trim()) : [],
          excerpt: abstract.abstract ? abstract.abstract.substring(0, 150) + '...' : '',
          averageScore: abstract.averageScore || 0,
        }));
        
        setAbstracts(transformedData);
      }
    } catch (err) {
      console.error("Error fetching abstracts:", err);
      setError("Failed to load abstracts. Please try again later.");
    } finally {
      setLoading(false);
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

  const filtered = abstracts.filter((a) => {
    const catOK = selectedCategory === "all" || a.category === selectedCategory;
    const s = searchTerm.toLowerCase();
    const searchOK = a.title.toLowerCase().includes(s) ||
      a.authors.toLowerCase().includes(s) ||
      a.keywords.some((k) => k.toLowerCase().includes(s));
    return catOK && searchOK;
  });

  // Calculate statistics
  const stats = {
    total: abstracts.length,
    acceptanceRate: abstracts.length > 0 ? 87 : 0, // You can calculate this from backend if needed
    departments: [...new Set(abstracts.map(a => a.department))].length,
    presenters: abstracts.length, // Assuming one presenter per abstract
  };

  if (loading) {
    return (
      <div className="min-h-screen py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600">Loading published abstracts...</p>
          </div>
        </div>
      </div>
    );
  }

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

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <span className="text-red-900">{error}</span>
          </div>
        )}

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
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white border border-slate-200 rounded-lg">
            <p className="text-slate-600">No abstracts found matching your criteria.</p>
          </div>
        ) : (
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
                  {a.keywords.slice(0, 5).map((k) => (
                    <span key={k} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">{k}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <button className="text-indigo-600 font-medium text-sm flex items-center hover:text-indigo-700">
                    View Full Abstract <ChevronRight className="ml-1 w-4 h-4" />
                  </button>
                  {a.averageScore > 0 && (
                    <span className="text-xs text-slate-500">Score: {a.averageScore.toFixed(1)}/10</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats footer */}
        <div className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <Stat value={stats.total.toString()} label="Total Submissions" />
            <Stat value={`${stats.acceptanceRate}%`} label="Acceptance Rate" />
            <Stat value={stats.departments.toString()} label="Departments" />
            <Stat value={stats.presenters.toString()} label="Presenters" />
          </div>
        </div>
      </div>
    </div>
  );
}