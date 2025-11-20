// API Service for NEOMED Research Forum
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

console.log("🔧 API URL configured:", API_URL); // Debug log

// Helper function to handle API responses
const handleResponse = async (response) => {
  // Check if response is ok before trying to parse JSON
  if (!response.ok) {
    let errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;

    // Try to get error message from response
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // If JSON parsing fails, try to get text
      try {
        const errorText = await response.text();
        if (errorText) errorMessage = errorText;
      } catch (e2) {
        // Keep the original error message
      }
    }

    throw new Error(errorMessage);
  }

  // Check if there's actually content to parse
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await response.json();
  } else {
    // If not JSON, return text or empty object
    const text = await response.text();
    return text ? { message: text } : {};
  }
};

// Abstract Submission APIs
export const abstractAPI = {
  // Submit a new abstract
  submit: async (formData) => {
    console.log("📤 Submitting to:", `${API_URL}/api/abstracts/submit`);

    try {
      const response = await fetch(`${API_URL}/api/abstracts/submit`, {
        method: "POST",
        body: formData, // FormData object with file
        // Don't set Content-Type header - let browser set it with boundary
      });

      console.log("📥 Response status:", response.status);
      return await handleResponse(response);
    } catch (error) {
      console.error("❌ Submit error:", error);
      throw error;
    }
  },

  // Get all abstracts (admin/reviewer view)
  getAll: async () => {
    const response = await fetch(`${API_URL}/api/abstracts`);
    return handleResponse(response);
  },

  // Get published abstracts for showcase
  getPublished: async () => {
    console.log(
      "📤 Fetching published abstracts from:",
      `${API_URL}/api/abstracts/published`
    );

    try {
      const response = await fetch(`${API_URL}/api/abstracts/published`);
      console.log("📥 Response status:", response.status);
      return await handleResponse(response);
    } catch (error) {
      console.error("❌ Fetch error:", error);
      throw error;
    }
  },

  // Get single abstract by ID
  getById: async (id) => {
    const response = await fetch(`${API_URL}/api/abstracts/${id}`);
    return handleResponse(response);
  },

  // Get abstract by magic link token
  getByToken: async (token) => {
    console.log("📤 Fetching abstract by token:", token);

    try {
      const response = await fetch(`${API_URL}/api/abstracts/view/${token}`);
      console.log("📥 Response status:", response.status);
      return await handleResponse(response);
    } catch (error) {
      console.error("❌ Fetch error:", error);
      throw error;
    }
  },
};

// Reviewer APIs
export const reviewerAPI = {
  // Login as reviewer
  login: async (name, email, password) => {
    const response = await fetch(`${API_URL}/api/reviewers/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });
    return handleResponse(response);
  },

  // Get abstracts available for review
  getAbstracts: async (token) => {
    const response = await fetch(`${API_URL}/api/reviewers/abstracts`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  // Submit a review
  submitReview: async (token, abstractId, score, comments) => {
    const response = await fetch(
      `${API_URL}/api/reviewers/review/${abstractId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ score, comments }),
      }
    );
    return handleResponse(response);
  },

  // Get my reviews
  getMyReviews: async (token) => {
    const response = await fetch(`${API_URL}/api/reviewers/my-reviews`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },
};

// Admin APIs
export const adminAPI = {
  // Admin login
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/api/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  // Create first admin (only works if no admins exist)
  createFirst: async (name, email, password) => {
    const response = await fetch(`${API_URL}/api/admin/create-first`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });
    return handleResponse(response);
  },

  // Get all abstracts with filters
  getAbstracts: async (token, status = null, sortBy = null) => {
    let url = `${API_URL}/api/admin/abstracts`;
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (sortBy) params.append("sortBy", sortBy);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  // Get dashboard statistics
  getStats: async (token) => {
    const response = await fetch(`${API_URL}/api/admin/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  // Accept an abstract
  acceptAbstract: async (token, abstractId) => {
    const response = await fetch(`${API_URL}/api/admin/accept/${abstractId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  // Reject an abstract
  rejectAbstract: async (token, abstractId) => {
    const response = await fetch(`${API_URL}/api/admin/reject/${abstractId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  // Publish abstract to showcase
  publishAbstract: async (token, abstractId) => {
    const response = await fetch(`${API_URL}/api/admin/publish/${abstractId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  // Unpublish abstract from showcase
  unpublishAbstract: async (token, abstractId) => {
    const response = await fetch(
      `${API_URL}/api/admin/unpublish/${abstractId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return handleResponse(response);
  },
};

// Test backend connection
export const testConnection = async () => {
  try {
    console.log("🔍 Testing connection to:", API_URL);
    const response = await fetch(`${API_URL}/`);
    const data = await handleResponse(response);
    console.log("✅ Backend connected:", data);
    return { success: true, data };
  } catch (error) {
    console.error("❌ Backend connection failed:", error);
    return { success: false, error: error.message };
  }
};

export default {
  abstractAPI,
  reviewerAPI,
  adminAPI,
  testConnection,
};
