// 🎮 PixelPlay Avatar Service
// Frontend service for communicating with Flask backend

// Get API URL from environment or default to local
const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3001/api";

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem("token"); // Your auth token

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "API request failed");
    }

    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// ===================================
// 🎨 AVATAR API METHODS
// ===================================

export const avatarAPI = {
  getCurrentAvatar: async () => {
    console.log("📥 Fetching current avatar...");
    const data = await apiCall("/avatar/current");
    console.log("✅ Current avatar loaded:", data.avatar);
    return data.avatar;
  },

  saveAvatar: async (avatarConfig) => {
    console.log("💾 Saving avatar:", avatarConfig);
    const data = await apiCall("/avatar/save", {
      method: "POST",
      body: JSON.stringify(avatarConfig),
    });
    console.log("✅ Avatar saved successfully");
    return data;
  },

  updateAvatar: async (options) => {
    console.log("✏️ Updating avatar options:", options);
    const data = await apiCall("/avatar/update", {
      method: "PUT",
      body: JSON.stringify({ options }),
    });
    console.log("✅ Avatar updated successfully");
    return data;
  },
};

// ===================================
// 📦 ITEMS API METHODS
// ===================================

export const itemsAPI = {
  getUnlockedItems: async (avatarStyle = null) => {
    console.log("📥 Fetching unlocked items...");
    const query = avatarStyle ? `?style=${avatarStyle}` : "";
    const data = await apiCall(`/items/unlocked${query}`);
    console.log("✅ Unlocked items loaded:", data.total_items, "items");
    return data.items;
  },

  unlockItem: async (style, category, value, method = "purchase") => {
    console.log(`🔓 Unlocking item: ${category}/${value} in ${style}`);
    const data = await apiCall("/items/unlock", {
      method: "POST",
      body: JSON.stringify({
        style,
        category,
        value,
        unlockMethod: method,
      }),
    });
    console.log("✅ Item unlocked:", data.item);
    return data;
  },

  getCatalog: async (avatarStyle = null) => {
    console.log("📥 Fetching item catalog...");
    const query = avatarStyle ? `?style=${avatarStyle}` : "";
    const data = await apiCall(`/items/catalog${query}`);
    console.log("✅ Catalog loaded:", data.items.length, "items");
    return data.items;
  },
};

// ===================================
// 📊 PROGRESS API METHODS
// ===================================

export const progressAPI = {
  getProgress: async () => {
    console.log("📥 Fetching user progress...");
    const data = await apiCall("/progress/");
    console.log("✅ Progress loaded:", data.progress);
    return data.progress;
  },

  addPoints: async (points, reason) => {
    console.log(`🎯 Adding ${points} points:`, reason);
    const data = await apiCall("/progress/points", {
      method: "POST",
      body: JSON.stringify({ points, reason }),
    });

    if (data.leveled_up) {
      console.log("🎉 LEVEL UP! New level:", data.new_level);
    }

    console.log("✅ Points added. Total:", data.total_points);
    return data;
  },
};

// ===================================
// 💾 PRESETS API METHODS
// ===================================

export const presetsAPI = {
  getPresets: async () => {
    console.log("📥 Fetching saved presets...");
    const data = await apiCall("/presets/");
    console.log("✅ Presets loaded:", data.presets.length, "presets");
    return data.presets;
  },

  savePreset: async (name, avatarConfig) => {
    console.log("💾 Saving preset:", name);
    const data = await apiCall("/presets/save", {
      method: "POST",
      body: JSON.stringify({
        name,
        ...avatarConfig,
      }),
    });
    console.log("✅ Preset saved");
    return data;
  },

  deletePreset: async (presetId) => {
    console.log("🗑️ Deleting preset:", presetId);
    const data = await apiCall(`/presets/${presetId}`, {
      method: "DELETE",
    });
    console.log("✅ Preset deleted");
    return data;
  },
};

// ===================================
// 🎮 HELPER FUNCTIONS
// ===================================

export const loadAvatarEditorData = async (avatarStyle) => {
  console.log("🎮 Loading avatar editor data...");

  try {
    const [avatar, unlockedItems, progress] = await Promise.all([
      avatarAPI.getCurrentAvatar().catch(() => null),
      itemsAPI.getUnlockedItems(avatarStyle).catch(() => ({})),
      progressAPI.getProgress().catch(() => ({})),
    ]);

    console.log("✅ Avatar editor data loaded successfully");

    return {
      avatar,
      unlockedItems,
      progress,
    };
  } catch (error) {
    console.error("❌ Error loading avatar editor data:", error);
    throw error;
  }
};

export default {
  avatarAPI,
  itemsAPI,
  progressAPI,
  presetsAPI,
  loadAvatarEditorData,
};
