export default function Input({
    label,
    value,
    onChange,
    placeholder,
    helper,
    type = "text",
    required = false,
  }) {
    return (
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
        <input
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-indigo-500 focus:outline-none"
          placeholder={placeholder}
        />
        {helper && <p className="mt-1 text-sm text-slate-500">{helper}</p>}
      </div>
    );
  }
  