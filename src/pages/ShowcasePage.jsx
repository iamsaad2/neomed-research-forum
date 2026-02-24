import { useState, useEffect } from "react";
import { Award, Search, ChevronRight, AlertCircle, X } from "lucide-react";
import { abstractAPI } from "../services/api";

export default function ShowcasePage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [abstracts, setAbstracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAbstract, setSelectedAbstract] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchPublishedAbstracts();
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedAbstract) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [selectedAbstract]);

  const openModal = (abstract) => {
    setSelectedAbstract(abstract);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setModalVisible(true));
    });
  };

  const closeModal = () => {
    setModalVisible(false);
    setTimeout(() => setSelectedAbstract(null), 250);
  };

  const fetchPublishedAbstracts = async () => {
    try {
      setLoading(true);
      const response = await abstractAPI.getPublished();
      
      if (response.success) {
        const transformedData = response.data.map((abstract) => ({
          id: abstract._id || abstract.id,
          title: abstract.title,
          authors: abstract.authors,
          department: getDepartmentLabel(abstract.department),
          category: getCategoryLabel(abstract.category),
          keywords: getKeywordsArray(abstract.keywords),
          excerpt: abstract.abstract ? abstract.abstract.substring(0, 150) + '...' : '',
          averageScore: abstract.averageScore || 0,
          abstractContent: abstract.abstractContent || null,
          fullAbstract: abstract.abstract || '',
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

  const getKeywordsArray = (keywords) => {
    if (!keywords) return [];
    if (Array.isArray(keywords)) return keywords;
    if (typeof keywords === "string") {
      return keywords.split(",").map((k) => k.trim()).filter(Boolean);
    }
    return [];
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

  if (loading) {
    return (
      <div className="min-h-screen py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-[#0099CC] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600">Loading published abstracts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 bg-gradient-to-b from-slate-50 to-white">
      {/* Custom scrollbar styles */}
      <style>{`
        .modal-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .modal-scroll::-webkit-scrollbar-track {
          background: transparent;
          margin: 4px 0;
        }
        .modal-scroll::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 999px;
          transition: background-color 0.2s;
        }
        .modal-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #9ca3af;
        }
        .modal-scroll {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db transparent;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-white border border-slate-300 rounded-full mb-6 shadow-sm">
            <Award className="w-4 h-4 mr-2 text-[#0099CC]" />
            <span className="text-sm font-medium text-slate-700">Accepted Abstracts</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Research Showcase</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Explore research accepted for presentation at NEOMED Research Forum 2026
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <span className="text-red-900">{error}</span>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, author, or keyword..."
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:border-[#0099CC] focus:outline-none focus:ring-1 focus:ring-[#0099CC]"
              />
            </div>
            
            <div className="md:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-[#0099CC] focus:outline-none focus:ring-1 focus:ring-[#0099CC] bg-white"
              >
                <option value="all">All Categories</option>
                <option value="Clinical Research">Clinical Research</option>
                <option value="Medical Education">Medical Education</option>
                <option value="Basic Science">Basic Science</option>
                <option value="Public Health">Public Health</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <p className="text-slate-600">
              Showing <span className="font-semibold text-slate-900">{filtered.length}</span> of{" "}
              <span className="font-semibold text-slate-900">{abstracts.length}</span> abstracts
            </p>
          </div>
        </div>

        {/* Abstract Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-lg shadow-sm">
            <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-lg text-slate-600 mb-2">No abstracts found</p>
            <p className="text-sm text-slate-500">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filtered.map((a) => (
              <div 
                key={a.id} 
                className="bg-white border border-slate-200 rounded-lg p-6 hover:border-[#0099CC] hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    a.category === "Clinical Research" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                    a.category === "Medical Education" ? "bg-green-50 text-green-700 border border-green-200" :
                    a.category === "Basic Science" ? "bg-purple-50 text-purple-700 border border-purple-200" :
                    "bg-orange-50 text-orange-700 border border-orange-200"
                  }`}>
                    {a.category}
                  </span>
                  <span className="text-xs text-slate-500">{a.department}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-[#0099CC] transition-colors line-clamp-2">
                  {a.title}
                </h3>

                <p className="text-sm text-slate-600 mb-3">{a.authors}</p>
                <p className="text-sm text-slate-700 mb-4 line-clamp-3">{a.excerpt}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {a.keywords.slice(0, 5).map((k, idx) => (
                    <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded border border-slate-200">{k}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <button 
                    onClick={() => openModal(a)}
                    className="text-[#0099CC] font-medium text-sm flex items-center hover:text-[#0077AA] transition-colors"
                  >
                    View Full Abstract 
                    <ChevronRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Abstract Modal */}
      {selectedAbstract && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          onClick={closeModal}
        >
          {/* Backdrop with fade */}
          <div 
            className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-250 ease-out ${
              modalVisible ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Modal Panel with scale + slide animation */}
          <div 
            className={`relative bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] shadow-2xl flex flex-col transition-all duration-250 ease-out ${
              modalVisible 
                ? "opacity-100 scale-100 translate-y-0" 
                : "opacity-0 scale-[0.97] translate-y-3"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header — fixed at top */}
            <div className="flex-shrink-0 border-b border-slate-100 px-6 py-5 flex items-start justify-between">
              <div className="flex-1 pr-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                    selectedAbstract.category === "Clinical Research" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                    selectedAbstract.category === "Medical Education" ? "bg-green-50 text-green-700 border border-green-200" :
                    selectedAbstract.category === "Basic Science" ? "bg-purple-50 text-purple-700 border border-purple-200" :
                    "bg-orange-50 text-orange-700 border border-orange-200"
                  }`}>
                    {selectedAbstract.category}
                  </span>
                  <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                    {selectedAbstract.department}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 leading-snug">
                  {selectedAbstract.title}
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors flex-shrink-0 -mr-1 -mt-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body — scrollable with styled scrollbar */}
            <div className="flex-1 min-h-0 overflow-y-auto modal-scroll px-6 py-5">
              {/* Authors */}
              <p className="text-sm text-slate-600 mb-4">{selectedAbstract.authors}</p>

              {/* Keywords */}
              {selectedAbstract.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedAbstract.keywords.map((k, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100">
                      {k}
                    </span>
                  ))}
                </div>
              )}

              <hr className="border-slate-100 mb-6" />

              {/* Abstract Sections */}
              <div className="space-y-5">
                {selectedAbstract.abstractContent?.background ? (
                  <>
                    {[
                      { key: "background", label: "Background" },
                      { key: "methods", label: "Methods" },
                      { key: "results", label: "Results" },
                      { key: "conclusion", label: "Conclusion" },
                    ].map(({ key, label }) => (
                      selectedAbstract.abstractContent[key] && (
                        <div key={key}>
                          <h3 className="text-xs font-semibold text-[#0077AA] uppercase tracking-wider mb-2">
                            {label}
                          </h3>
                          <p className="text-sm text-slate-700 leading-relaxed">
                            {selectedAbstract.abstractContent[key]}
                          </p>
                        </div>
                      )
                    ))}
                  </>
                ) : selectedAbstract.fullAbstract ? (
                  <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                    {selectedAbstract.fullAbstract}
                  </p>
                ) : (
                  <p className="text-sm text-slate-500 italic">
                    Full abstract content is not available.
                  </p>
                )}
              </div>
            </div>

            {/* Footer — fixed at bottom */}
            <div className="flex-shrink-0 border-t border-slate-100 px-6 py-4">
              <button
                onClick={closeModal}
                className="w-full px-4 py-2.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 active:bg-slate-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}