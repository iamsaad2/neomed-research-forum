import { useState, useEffect } from "react";
import {
  Trophy,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  AlertTriangle,
  GripVertical,
} from "lucide-react";

export default function WinnersAdminTab() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingWinner, setEditingWinner] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [winnerToDelete, setWinnerToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    title: "",
    award: "",
    category: "",
    displayOrder: 0,
  });

  useEffect(() => {
    fetchWinners();
  }, []);

  const fetchWinners = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/winners`
      );
      const data = await res.json();
      if (data.success) {
        setWinners(data.data);
      }
    } catch (error) {
      console.error("Error fetching winners:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      title: "",
      award: "",
      category: "",
      displayOrder: winners.length,
    });
    setEditingWinner(null);
    setShowForm(false);
  };

  const openEditForm = (winner) => {
    setEditingWinner(winner);
    setFormData({
      name: winner.name,
      title: winner.title,
      award: winner.award,
      category: winner.category || "",
      displayOrder: winner.displayOrder || 0,
    });
    setShowForm(true);
  };

  const openNewForm = () => {
    setEditingWinner(null);
    setFormData({
      name: "",
      title: "",
      award: "",
      category: "",
      displayOrder: winners.length,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.title || !formData.award) return;
    setIsSaving(true);

    try {
      const token = localStorage.getItem("adminToken");
      const url = editingWinner
        ? `${import.meta.env.VITE_API_URL}/api/admin/winners/${editingWinner._id}`
        : `${import.meta.env.VITE_API_URL}/api/admin/winners`;
      const method = editingWinner ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        fetchWinners();
        resetForm();
      }
    } catch (error) {
      console.error("Error saving winner:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!winnerToDelete) return;
    setIsDeleting(true);

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/winners/${winnerToDelete._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.success) {
        setWinners(winners.filter((w) => w._id !== winnerToDelete._id));
      }
    } catch (error) {
      console.error("Error deleting winner:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setWinnerToDelete(null);
    }
  };

  const awardPresets = [
    "1st Place",
    "2nd Place",
    "3rd Place",
    "Best Poster",
    "People's Choice",
    "Best Clinical Research",
    "Best Basic Science",
    "Best Medical Education",
    "Best Public Health",
    "Honorable Mention",
  ];

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="inline-block w-6 h-6 border-2 border-slate-600 border-t-slate-300 rounded-full animate-spin mb-3"></div>
        <p className="text-slate-500 text-sm">Loading winners...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span className="text-sm text-slate-300 font-medium">
            {winners.length} winner{winners.length !== 1 ? "s" : ""} displayed on home page
          </span>
        </div>
        <button
          onClick={openNewForm}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Winner
        </button>
      </div>

      {/* Winners List */}
      {winners.length === 0 ? (
        <div className="p-12 text-center">
          <Trophy className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 text-sm mb-1">No winners added yet</p>
          <p className="text-slate-600 text-xs">
            Click "Add Winner" to display winners on the home page
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-800">
          {winners.map((winner, idx) => (
            <div
              key={winner._id}
              className="px-4 py-4 flex items-center gap-4 hover:bg-slate-800/30 transition-colors"
            >
              {/* Order */}
              <div className="flex items-center gap-2 text-slate-600">
                <GripVertical className="w-4 h-4" />
                <span className="text-xs font-mono w-5">
                  {winner.displayOrder}
                </span>
              </div>

              {/* Award icon */}
              <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                {winner.award.toLowerCase().includes("1st") ? "🥇" :
                 winner.award.toLowerCase().includes("2nd") ? "🥈" :
                 winner.award.toLowerCase().includes("3rd") ? "🥉" : "🏆"}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-amber-400 text-xs font-semibold">
                    {winner.award}
                  </span>
                  {winner.category && (
                    <span className="text-slate-600 text-xs">
                      · {winner.category}
                    </span>
                  )}
                </div>
                <p className="text-white font-medium text-sm truncate">
                  {winner.name}
                </p>
                <p className="text-slate-500 text-xs truncate">
                  {winner.title}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditForm(winner)}
                  className="p-2 text-slate-500 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setWinnerToDelete(winner);
                    setShowDeleteModal(true);
                  }}
                  className="p-2 text-slate-600 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-white font-medium">
                  {editingWinner ? "Edit Winner" : "Add Winner"}
                </h3>
              </div>
              <button
                onClick={resetForm}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Award */}
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">
                  Award *
                </label>
                <input
                  type="text"
                  value={formData.award}
                  onChange={(e) =>
                    setFormData({ ...formData, award: e.target.value })
                  }
                  placeholder="e.g., 1st Place"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                />
                {/* Preset buttons */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {awardPresets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, award: preset })
                      }
                      className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                        formData.award === preset
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-slate-700/50 text-slate-400 hover:text-slate-300 border border-slate-700"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Winner Name */}
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">
                  Winner Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Jane Smith, MD"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Research Title */}
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">
                  Research Title *
                </label>
                <textarea
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Title of the winning research abstract..."
                  rows="2"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {/* Category (optional) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">
                    Category (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    placeholder="e.g., Clinical Research"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        displayOrder: parseInt(e.target.value) || 0,
                      })
                    }
                    min="0"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-700">
              <button
                onClick={resetForm}
                className="flex-1 px-4 py-2.5 bg-slate-700 text-white text-sm font-medium rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={
                  isSaving ||
                  !formData.name ||
                  !formData.title ||
                  !formData.award
                }
                className="flex-1 px-4 py-2.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {editingWinner ? "Update" : "Add Winner"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && winnerToDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">Remove Winner</h3>
                <p className="text-sm text-slate-500">
                  This cannot be undone
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-6">
              Remove{" "}
              <span className="text-white font-medium">
                {winnerToDelete.name}
              </span>{" "}
              ({winnerToDelete.award}) from the winners display?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setWinnerToDelete(null);
                }}
                className="flex-1 px-4 py-2.5 bg-slate-700 text-white text-sm font-medium rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Removing...
                  </>
                ) : (
                  "Remove"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}