import { useState, useEffect, useRef } from "react";
import {
  Settings as SettingsIcon,
  Save,
  Plus,
  Trash2,
  Calendar,
  Image as ImageIcon,
  Upload,
  Check,
  GripVertical,
} from "lucide-react";
import { settingsAPI } from "../services/api";

// Small styled text input for the dark admin theme.
function Field({ label, value, onChange, placeholder, type = "text", hint }) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1.5">{label}</label>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#0099CC]"
      />
      {hint && <p className="text-[11px] text-slate-600 mt-1">{hint}</p>}
    </div>
  );
}

function SectionTitle({ icon, children }) {
  return (
    <div className="flex items-center gap-2 mb-4 mt-2">
      {icon}
      <h3 className="text-sm font-semibold text-slate-200">{children}</h3>
    </div>
  );
}

export default function SettingsAdminTab() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const token = () => localStorage.getItem("adminToken");

  useEffect(() => {
    (async () => {
      try {
        const res = await settingsAPI.get();
        if (res.success) setForm(res.data);
      } catch (e) {
        setError("Could not load settings: " + e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  // ----- Key Dates helpers -----
  const updateKeyDate = (idx, key, value) =>
    setForm((f) => {
      const keyDates = [...f.keyDates];
      keyDates[idx] = { ...keyDates[idx], [key]: value };
      return { ...f, keyDates };
    });

  const addKeyDate = () =>
    setForm((f) => ({
      ...f,
      keyDates: [
        ...f.keyDates,
        { date: "", title: "", status: "upcoming" },
      ],
    }));

  const removeKeyDate = (idx) =>
    setForm((f) => ({
      ...f,
      keyDates: f.keyDates.filter((_, i) => i !== idx),
    }));

  // ----- Save all text fields -----
  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await settingsAPI.update(token(), form);
      if (res.success) {
        setForm(res.data);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        setError(res.message || "Save failed");
      }
    } catch (e) {
      setError("Save failed: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  // ----- Recap photo upload / delete -----
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const res = await settingsAPI.uploadRecapPhoto(token(), file);
      if (res.success) setForm(res.data);
      else setError(res.message || "Upload failed");
    } catch (err) {
      setError("Upload failed: " + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeletePhoto = async (photo) => {
    setError("");
    try {
      const res = await settingsAPI.deleteRecapPhoto(token(), {
        publicId: photo.publicId,
        url: photo.url,
      });
      if (res.success) setForm(res.data);
    } catch (err) {
      setError("Delete failed: " + err.message);
    }
  };

  const updatePhotoCaption = (idx, caption) =>
    setForm((f) => {
      const recapPhotos = [...f.recapPhotos];
      recapPhotos[idx] = { ...recapPhotos[idx], caption };
      return { ...f, recapPhotos };
    });

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="inline-block w-6 h-6 border-2 border-slate-600 border-t-slate-300 rounded-full animate-spin mb-3"></div>
        <p className="text-slate-500 text-sm">Loading settings...</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm">
        {error || "No settings available."}
      </div>
    );
  }

  const statusOptions = ["complete", "current", "upcoming"];

  return (
    <div>
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-800/95 backdrop-blur z-10">
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-5 h-5 text-[#0099CC]" />
          <span className="text-sm text-slate-300 font-medium">
            Site content — edits go live across the whole website
          </span>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-emerald-400 text-xs">
              <Check className="w-4 h-4" /> Saved
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#0099CC] text-white text-sm font-medium rounded-lg hover:bg-[#0077AA] transition-colors disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 px-4 py-2.5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="p-6 space-y-8">
        {/* ===== Identity ===== */}
        <section>
          <SectionTitle icon={<SettingsIcon className="w-4 h-4 text-[#0099CC]" />}>Event Identity</SectionTitle>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Event name" value={form.eventName} onChange={(v) => set("eventName", v)} placeholder="Research Forum" />
            <Field label="Year" type="number" value={form.year} onChange={(v) => set("year", parseInt(v) || 0)} placeholder="2027" />
            <Field label="University" value={form.university} onChange={(v) => set("university", v)} placeholder="Northeast Ohio Medical University" />
            <Field label="Contact email" value={form.contactEmail} onChange={(v) => set("contactEmail", v)} placeholder="you@neomed.edu" />
            <Field label="Event date" value={form.eventDate} onChange={(v) => set("eventDate", v)} placeholder="February 24, 2027" />
            <Field label="Event time" value={form.eventTime} onChange={(v) => set("eventTime", v)} placeholder="4:00 PM" />
          </div>
        </section>

        {/* ===== Submissions ===== */}
        <section>
          <SectionTitle icon={<Check className="w-4 h-4 text-[#0099CC]" />}>Submissions</SectionTitle>
          <div className="grid sm:grid-cols-2 gap-4 items-start">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Submissions open?</label>
              <button
                type="button"
                onClick={() => set("submissionsOpen", !form.submissionsOpen)}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  form.submissionsOpen
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                    : "bg-red-500/10 border-red-500/40 text-red-400"
                }`}
              >
                <span className={`w-9 h-5 rounded-full relative transition-colors ${form.submissionsOpen ? "bg-emerald-500" : "bg-slate-600"}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${form.submissionsOpen ? "left-4" : "left-0.5"}`} />
                </span>
                {form.submissionsOpen ? "Open — form is live" : "Closed — shows closed banner"}
              </button>
            </div>
            <Field label="Submission deadline (shown on closed banner)" value={form.submissionDeadlineText} onChange={(v) => set("submissionDeadlineText", v)} placeholder="January 12, 2027 at 11:59 PM EST" />
          </div>
        </section>

        {/* ===== Key Dates ===== */}
        <section>
          <SectionTitle icon={<Calendar className="w-4 h-4 text-[#0099CC]" />}>Key Dates (home page timeline)</SectionTitle>
          <div className="space-y-2">
            {form.keyDates.map((kd, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 rounded-lg p-2">
                <GripVertical className="w-4 h-4 text-slate-700 flex-shrink-0" />
                <input
                  value={kd.title}
                  onChange={(e) => updateKeyDate(idx, "title", e.target.value)}
                  placeholder="Milestone (e.g. Submissions Open)"
                  className="flex-1 min-w-0 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-[#0099CC]"
                />
                <input
                  value={kd.date}
                  onChange={(e) => updateKeyDate(idx, "date", e.target.value)}
                  placeholder="Dec 14, 2026"
                  className="w-36 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-[#0099CC]"
                />
                <select
                  value={kd.status}
                  onChange={(e) => updateKeyDate(idx, "status", e.target.value)}
                  className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-300 text-xs focus:outline-none focus:border-[#0099CC]"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button onClick={() => removeKeyDate(idx)} className="p-1.5 text-slate-600 hover:text-red-400 rounded transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button onClick={addKeyDate} className="mt-3 flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add date
          </button>
          <p className="text-[11px] text-slate-600 mt-2">
            "current" highlights the row in blue; "complete" dims it. Set the forum day to "current".
          </p>
        </section>

        {/* ===== Participant deadlines ===== */}
        <section>
          <SectionTitle icon={<Calendar className="w-4 h-4 text-[#0099CC]" />}>Participant Deadlines (abstract link page)</SectionTitle>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Confirm participation by" value={form.confirmByText} onChange={(v) => set("confirmByText", v)} placeholder="Friday, February 6, 2027 at 11:59 PM" />
            <Field label="Confirm deadline (short display)" value={form.confirmDeadlineDisplay} onChange={(v) => set("confirmDeadlineDisplay", v)} placeholder="Thursday, February 5, 2027" />
            <Field label="Presentation slides due" value={form.presentationDueText} onChange={(v) => set("presentationDueText", v)} placeholder="Saturday, February 21, 2027 at 11:59 PM" />
            <Field label="Review period" value={form.reviewPeriodText} onChange={(v) => set("reviewPeriodText", v)} placeholder="January 13 – 28, 2027" />
            <Field label="Decision notification" value={form.decisionNotificationText} onChange={(v) => set("decisionNotificationText", v)} placeholder="January 28, 2027" />
          </div>
        </section>

        {/* ===== Recap photos ===== */}
        <section>
          <SectionTitle icon={<ImageIcon className="w-4 h-4 text-[#0099CC]" />}>Event Recap Photos (home page gallery)</SectionTitle>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 mb-4"
          >
            {uploading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {uploading ? "Uploading..." : "Upload photo"}
          </button>

          {form.recapPhotos.length === 0 ? (
            <p className="text-slate-500 text-sm">No photos yet. Upload some to fill the home page gallery.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {form.recapPhotos.map((photo, idx) => (
                <div key={photo.url + idx} className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
                  <div className="aspect-video bg-slate-900">
                    <img src={photo.url} alt={photo.caption || "recap"} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2 space-y-2">
                    <input
                      value={photo.caption || ""}
                      onChange={(e) => updatePhotoCaption(idx, e.target.value)}
                      placeholder="Caption (optional)"
                      className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-xs focus:outline-none focus:border-[#0099CC]"
                    />
                    <button
                      onClick={() => handleDeletePhoto(photo)}
                      className="w-full flex items-center justify-center gap-1.5 px-2 py-1 text-red-400 hover:bg-red-500/10 rounded text-xs transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-[11px] text-slate-600 mt-2">
            Caption edits are saved with "Save Changes". Uploads and removals apply immediately.
          </p>
        </section>
      </div>
    </div>
  );
}
