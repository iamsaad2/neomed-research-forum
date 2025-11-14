export default function Select({ label, value, onChange, options, required = false }) {
    return (
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
        <select
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-indigo-500 focus:outline-none bg-white"
        >
          <option value="">Select</option>
          {options.map(([val, text]) => (
            <option key={val} value={val}>{text}</option>
          ))}
        </select>
      </div>
    );
  }
  