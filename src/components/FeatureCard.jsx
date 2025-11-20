import { ArrowRight } from "lucide-react";

export default function FeatureCard({
  icon,
  title,
  text,
  cta,
  ctaColor = "text-indigo-600 group-hover:text-indigo-700",
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-8 hover:border-indigo-300 transition-all group">
      {icon}
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 mb-4">{text}</p>
      <button className={`${ctaColor} font-medium flex items-center`}>
        {cta} <ArrowRight className="ml-2 w-4 h-4" />
      </button>
    </div>
  );
}