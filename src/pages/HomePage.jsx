import { useEffect, useState } from "react";
import {
  ArrowRight,
  Calendar,
  Clock,
  Award,
  Users,
  Trophy,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

const RECAP_PHOTOS = [
  { src: "/recap/recap-1.jpg", caption: "" },
  { src: "/recap/recap-2.jpg", caption: "" },
  { src: "/recap/recap-3.jpg", caption: "" },
  { src: "/recap/recap-4.jpg", caption: "" },
  { src: "/recap/recap-5.jpg", caption: "" },
  { src: "/recap/recap-6.jpg", caption: "" },
  { src: "/recap/recap-7.jpg", caption: "" },
  { src: "/recap/recap-8.jpg", caption: "" },
  { src: "/recap/recap-9.jpg", caption: "" },
];

export default function HomePage() {
  const [winners, setWinners] = useState([]);
  const [winnersLoading, setWinnersLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [visibleSections, setVisibleSections] = useState(new Set());

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/winners`);
        const data = await res.json();
        if (data.success) setWinners(data.data);
      } catch (e) {
        console.error("Error fetching winners:", e);
      } finally {
        setWinnersLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.dataset.idx]));
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -30px 0px" }
    );
    const items = document.querySelectorAll("[data-gallery-item]");
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [winners, winnersLoading]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handle = (e) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight") setLightboxIndex((p) => (p + 1) % RECAP_PHOTOS.length);
      if (e.key === "ArrowLeft") setLightboxIndex((p) => (p - 1 + RECAP_PHOTOS.length) % RECAP_PHOTOS.length);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handle);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handle);
    };
  }, [lightboxIndex]);

  const getAwardAccent = (award) => {
    const l = award.toLowerCase();
    if (l.includes("1st") || l.includes("first")) return { color: "#D97706", border: "border-amber-200", tag: "bg-amber-100 text-amber-700" };
    if (l.includes("2nd") || l.includes("second")) return { color: "#6B7280", border: "border-slate-200", tag: "bg-slate-100 text-slate-600" };
    if (l.includes("3rd") || l.includes("third")) return { color: "#B45309", border: "border-orange-200", tag: "bg-orange-100 text-orange-700" };
    return { color: "#0077AA", border: "border-sky-200", tag: "bg-sky-100 text-sky-700" };
  };

  const buildGalleryRows = () => {
    const rows = [];
    let i = 0;
    while (i < RECAP_PHOTOS.length) {
      rows.push({ type: "hero", photos: [{ ...RECAP_PHOTOS[i], globalIdx: i }] });
      i++;
      if (i < RECAP_PHOTOS.length - 1) {
        rows.push({
          type: "pair",
          photos: [
            { ...RECAP_PHOTOS[i], globalIdx: i },
            { ...RECAP_PHOTOS[i + 1], globalIdx: i + 1 },
          ],
        });
        i += 2;
      } else if (i < RECAP_PHOTOS.length) {
        rows.push({ type: "hero", photos: [{ ...RECAP_PHOTOS[i], globalIdx: i }] });
        i++;
      }
    }
    return rows;
  };

  const galleryRows = buildGalleryRows();

  return (
    <div className="bg-white">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .gallery-reveal {
          opacity: 0; transform: translateY(24px);
          transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .gallery-reveal.visible { opacity: 1; transform: translateY(0); }
        .photo-card { overflow: hidden; position: relative; }
        .photo-card img { transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .photo-card:hover img { transform: scale(1.04); }
        .photo-card::after {
          content: ''; position: absolute; inset: 0; border-radius: inherit;
          background: linear-gradient(0deg, rgba(0,0,0,0.35) 0%, transparent 45%);
          opacity: 0; transition: opacity 0.35s ease; pointer-events: none;
        }
        .photo-card:hover::after { opacity: 1; }
        .photo-card .caption-text {
          transform: translateY(6px); opacity: 0;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .photo-card:hover .caption-text { transform: translateY(0); opacity: 1; }
        .photo-card .expand-icon {
          opacity: 0; transform: scale(0.85);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .photo-card:hover .expand-icon { opacity: 1; transform: scale(1); }
        .winner-card {
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease;
        }
        .winner-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px -8px rgba(0,0,0,0.1);
        }
        .lightbox-img { animation: fadeIn 0.25s ease-out; }
      `}</style>

      {/* All content shares the same max-w-6xl container */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8">

        {/* ============================================ */}
        {/* COMPACT HEADER */}
        {/* ============================================ */}
        <div className="pt-8 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Research Forum 2026</h1>
            <p className="text-sm text-slate-500 mt-1">Northeast Ohio Medical University</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Calendar className="w-4 h-4 text-[#0077AA]" />
            <span>February 25, 2026 · 4:00 PM</span>
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        {/* ============================================ */}
        {/* WINNERS SECTION */}
        {/* ============================================ */}
        {winners.length > 0 && (
          <div className="py-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#0077AA]/10 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-[#0077AA]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Forum Winners</h2>
                <p className="text-sm text-slate-400">Congratulations to our award recipients</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {winners.map((winner) => {
                const accent = getAwardAccent(winner.award);
                return (
                  <div
                    key={winner._id}
                    className={`winner-card rounded-xl border ${accent.border} bg-white p-5 relative overflow-hidden`}
                  >
                    <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ backgroundColor: accent.color }} />
                    <div className="mb-3 flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide ${accent.tag}`}>
                        <Award className="w-3 h-3" />
                        {winner.award}
                      </span>
                      {winner.category && (
                        <span className="text-xs text-slate-400">{winner.category}</span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-1.5 leading-snug">{winner.name}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{winner.title}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* EVENT HIGHLIGHTS — EDITORIAL HEADER */}
        {/* ============================================ */}
        {RECAP_PHOTOS.length > 0 && (
          <div className="pb-14">
            {/* Section header with gradient accent line */}
            <div className="pt-4 pb-8">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                <div>
                  <p className="text-[#0077AA] text-xs font-semibold tracking-widest uppercase mb-2">Event Recap</p>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Forum Highlights</h2>
                </div>
                <p className="text-slate-400 text-sm md:text-right max-w-xs">
                  A look back at the presentations, discussions, and achievements
                </p>
              </div>
              <div className="mt-5 h-px bg-gradient-to-r from-[#0077AA]/50 via-slate-200 to-transparent" />
            </div>

            {/* Gallery rows */}
            <div className="space-y-4">
              {galleryRows.map((row, rowIdx) => {
                const key = `row-${rowIdx}`;
                const isVisible = visibleSections.has(key);

                if (row.type === "hero") {
                  const photo = row.photos[0];
                  return (
                    <div key={key} data-gallery-item data-idx={key} className={`gallery-reveal ${isVisible ? "visible" : ""}`}>
                      <div className="photo-card rounded-2xl cursor-pointer aspect-[21/9] md:aspect-[2.4/1] shadow-sm" onClick={() => setLightboxIndex(photo.globalIdx)}>
                        <img src={photo.src} alt={photo.caption || "Forum highlight"} className="w-full h-full object-cover rounded-2xl" loading="lazy" />
                        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 z-10">
                          {photo.caption && <p className="caption-text text-white text-sm md:text-base font-medium">{photo.caption}</p>}
                        </div>
                        <div className="expand-icon absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={key} data-gallery-item data-idx={key} className={`gallery-reveal grid grid-cols-1 md:grid-cols-2 gap-4 ${isVisible ? "visible" : ""}`}>
                    {row.photos.map((photo, pIdx) => (
                      <div key={photo.globalIdx} className="photo-card rounded-2xl cursor-pointer aspect-[16/9] shadow-sm" onClick={() => setLightboxIndex(photo.globalIdx)} style={{ transitionDelay: `${pIdx * 100}ms` }}>
                        <img src={photo.src} alt={photo.caption || "Forum highlight"} className="w-full h-full object-cover rounded-2xl" loading="lazy" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-10">
                          {photo.caption && <p className="caption-text text-white text-sm font-medium">{photo.caption}</p>}
                        </div>
                        <div className="expand-icon absolute top-3 right-3 z-10 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* KEY DATES */}
        {/* ============================================ */}
        <div className="py-12">
          <div className="h-px bg-slate-100 mb-8" />
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-[#0077AA]/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-[#0077AA]" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Key Dates</h2>
          </div>
          <div className="space-y-3">
            {[
              { date: "Dec 15, 2025", title: "Submissions Open", icon: Calendar, status: "complete" },
              { date: "Jan 12, 2026", title: "Submission Deadline", icon: Clock, status: "complete" },
              { date: "Jan 28, 2026", title: "Acceptance Notification", icon: Award, status: "complete" },
              { date: "Feb 21, 2026", title: "Final Presentation Due", icon: Users, status: "complete" },
              { date: "Feb 25, 2026", title: "Research Forum Day", icon: Award, status: "current" },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`rounded-lg px-4 py-3 flex items-center gap-4 ${
                  item.status === "current"
                    ? "bg-[#0077AA]/[0.06] border border-[#0077AA]/20"
                    : "bg-slate-50 border border-transparent opacity-50"
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center ${
                  item.status === "current" ? "bg-[#0077AA] text-white" : "bg-slate-200 text-slate-400"
                }`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 flex items-center justify-between gap-4">
                  <span className={`font-semibold text-sm ${item.status === "current" ? "text-[#0077AA]" : "text-slate-600"}`}>{item.title}</span>
                  <span className={`text-sm flex-shrink-0 ${item.status === "current" ? "text-[#0077AA]" : "text-slate-400"}`}>{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ============================================ */}
        {/* CTA — SIMPLE INLINE */}
        {/* ============================================ */}
        <div className="py-12 border-t border-slate-100 text-center">
          <h3 className="text-xl font-bold text-slate-900 mb-2">Explore the Research</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
            Browse all accepted abstracts from NEOMED's Research Forum 2026.
          </p>
          <Link
            to="/showcase"
            className="inline-flex items-center px-6 py-3 bg-[#0077AA] text-white font-semibold rounded-lg hover:bg-[#005F89] transition-colors"
          >
            View Accepted Abstracts
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>

        {/* Bottom spacer */}
        <div className="h-8" />

      </div>

      {/* ============================================ */}
      {/* LIGHTBOX */}
      {/* ============================================ */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/[0.97] flex items-center justify-center" onClick={() => setLightboxIndex(null)}>
          <button className="absolute top-5 right-5 z-50 p-2.5 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all" onClick={() => setLightboxIndex(null)}>
            <X className="w-5 h-5" />
          </button>
          <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white/40 text-xs font-medium tracking-widest">
            {lightboxIndex + 1} / {RECAP_PHOTOS.length}
          </div>
          <button className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-50 p-3 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all" onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + RECAP_PHOTOS.length) % RECAP_PHOTOS.length); }}>
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="max-w-6xl w-full mx-4 md:mx-8" onClick={(e) => e.stopPropagation()}>
            <img key={lightboxIndex} src={RECAP_PHOTOS[lightboxIndex].src} alt={RECAP_PHOTOS[lightboxIndex].caption || `Photo ${lightboxIndex + 1}`} className="lightbox-img w-full max-h-[82vh] object-contain rounded-lg" />
            {RECAP_PHOTOS[lightboxIndex].caption && (
              <p className="text-center text-white/60 text-sm mt-5 font-medium">{RECAP_PHOTOS[lightboxIndex].caption}</p>
            )}
          </div>
          <button className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-50 p-3 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all" onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % RECAP_PHOTOS.length); }}>
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}