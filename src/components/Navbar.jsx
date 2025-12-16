import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar({ mobileMenuOpen, setMobileMenuOpen }) {
  const location = useLocation();

  const LinkBtn = ({ to, children }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        aria-current={isActive ? "page" : undefined}
        className={`relative group px-1 py-2 text-sm font-medium transition-colors
          ${isActive ? "text-[#0099CC]" : "text-slate-700 hover:text-[#0099CC]"}
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0099CC] focus-visible:ring-offset-2 rounded-sm`}
      >
        {children}
        <span
          className={`pointer-events-none absolute left-0 -bottom-0.5 h-0.5 w-full rounded-full
            bg-[#0099CC] transform-gpu transition-transform duration-200 origin-left
            ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
        />
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-3">
              {/* NEOMED Logo */}
              <img 
                src="/neomed-logo.png" 
                alt="NEOMED Logo" 
                className="h-10 w-auto"
              />
              <div>
                <div className="text-xl font-bold text-slate-900">NEOMED</div>
                <div className="text-xs text-slate-600 -mt-1">Research Forum 2026</div>
              </div>
            </Link>

            <div className="hidden md:flex space-x-6">
              <LinkBtn to="/">Home</LinkBtn>
              <LinkBtn to="/submit">Submit Abstract</LinkBtn>
              <LinkBtn to="/showcase">Accepted Abstracts</LinkBtn>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-700"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200">
          <div className="px-4 py-3 space-y-2">
            {[
              ["/", "Home"],
              ["/submit", "Submit Abstract"],
              ["/showcase", "Accepted Abstracts"],
            ].map(([to, label]) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded hover:text-[#0099CC]"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}