export default function Stat({ value, label, color = "" }) {
    return (
      <div className="text-center">
        <div className={`text-4xl font-bold mb-2 ${color}`}>{value}</div>
        <div className="text-sm text-slate-600 font-medium">{label}</div>
      </div>
    );
  }
  