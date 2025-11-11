/**
 * Avatar Utilities - DiceBear API Integration
 * Handles avatar URL generation and configuration
 */

// Available DiceBear styles
export const AVATAR_STYLES = {
  AVATAAARS: 'avataaars',
  BOTTTS: 'bottts',
  PIXEL_ART: 'pixel-art',
  LORELEI: 'lorelei',
  PERSONAS: 'personas',
  ADVENTURER: 'adventurer',
  BIG_SMILE: 'big-smile',
  OPEN_PEEPS: 'open-peeps'
};

// Default avatar configuration
export const DEFAULT_AVATAR_CONFIG = {
  style: AVATAR_STYLES.AVATAAARS,
  seed: 'default',
  backgroundColor: 'b6e3f4',
  backgroundType: 'gradientLinear',
  size: 200
};

/**
 * Generate DiceBear avatar URL
 * @param {Object} config - Avatar configuration
 * @returns {string} - Avatar URL
 */
export const generateAvatarURL = (config = {}) => {
  const {
    style = DEFAULT_AVATAR_CONFIG.style,
    seed = DEFAULT_AVATAR_CONFIG.seed,
    size = DEFAULT_AVATAR_CONFIG.size,
    backgroundColor,
    ...otherOptions
  } = config;

  // Base URL for DiceBear API v7
  const baseUrl = `https://api.dicebear.com/7.x/${style}/svg`;

  // Build query parameters
  const params = new URLSearchParams();
  
  // Add seed (required for consistent avatars)
  params.append('seed', seed);
  
  // Add size if specified
  if (size) {
    params.append('size', size);
  }
  
  // Add background color if specified
  if (backgroundColor) {
    params.append('backgroundColor', backgroundColor);
  }

  // Add any other options (like accessories, clothing, etc.)
  Object.entries(otherOptions).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        params.append(key, value.join(','));
      } else {
        params.append(key, value);
      }
    }
  });

  const url = `${baseUrl}?${params.toString()}`;
  console.log('🎨 Generated avatar URL:', url);
  return url;
};

/**
 * Generate a random seed for avatar
 * @returns {string} - Random seed
 */
export const generateRandomSeed = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
};

/**
 * Validate avatar configuration
 * @param {Object} config - Avatar configuration
 * @returns {boolean} - Is valid
 */
export const isValidAvatarConfig = (config) => {
  if (!config || typeof config !== 'object') return false;
  if (!config.style || !Object.values(AVATAR_STYLES).includes(config.style)) return false;
  if (!config.seed || typeof config.seed !== 'string') return false;
  return true;
};

/**
 * Get avatar style options for a specific style
 * @param {string} style - Avatar style name
 * @returns {Object} - Available options for that style
 */
export const getStyleOptions = (style) => {
  const options = {
    [AVATAR_STYLES.AVATAAARS]: {
      accessories: ['prescription01', 'prescription02', 'round', 'sunglasses', 'wayfarers'],
      clothing: ['blazerShirt', 'blazerSweater', 'collarSweater', 'graphicShirt', 'hoodie', 'overall', 'shirtCrewNeck', 'shirtScoopNeck', 'shirtVNeck'],
      clothingColor: ['black', 'blue01', 'blue02', 'blue03', 'gray01', 'gray02', 'heather', 'pastelBlue', 'pastelGreen', 'pastelOrange', 'pastelRed', 'pastelYellow', 'pink', 'red', 'white'],
      eyebrows: ['angry', 'angryNatural', 'default', 'defaultNatural', 'flatNatural', 'raisedExcited', 'raisedExcitedNatural', 'sadConcerned', 'sadConcernedNatural', 'unibrowNatural', 'upDown', 'upDownNatural'],
      eyes: ['close', 'cry', 'default', 'dizzy', 'eyeRoll', 'happy', 'hearts', 'side', 'squint', 'surprised', 'wink', 'winkWacky'],
      facialHair: ['beardMedium', 'beardLight', 'beardMajestic', 'moustacheFancy', 'moustacheMagnum'],
      mouth: ['concerned', 'default', 'disbelief', 'eating', 'grimace', 'sad', 'screamOpen', 'serious', 'smile', 'tongue', 'twinkle', 'vomit'],
      top: ['bigHair', 'bob', 'bun', 'curly', 'curvy', 'dreads', 'frida', 'fro', 'froBand', 'longButNotTooLong', 'miaWallace', 'shavedSides', 'straight01', 'straight02', 'straightAndStrand'],
      hairColor: ['auburn', 'black', 'blonde', 'blondeGolden', 'brown', 'brownDark', 'pastelPink', 'platinum', 'red', 'silverGray']
    },
    [AVATAR_STYLES.PIXEL_ART]: {
      accessories: ['glasses', 'sunglasses'],
      clothing: ['shirt', 'dress'],
      eyes: ['open', 'happy', 'surprised'],
      mouth: ['smile', 'frown', 'open']
    },
    [AVATAR_STYLES.BOTTTS]: {
      eyes: ['bulging', 'dizzy', 'eva', 'frame1', 'frame2', 'glow', 'happy', 'hearts', 'robocop', 'round', 'roundFrame01', 'roundFrame02', 'sensor', 'shade01'],
      mouth: ['bite', 'diagram', 'grill01', 'grill02', 'grill03', 'smile01', 'smile02', 'square01', 'square02'],
      texture: ['camo01', 'camo02', 'circuits', 'dirty01', 'dirty02', 'grunge01', 'grunge02', 'rust01', 'rust02']
    }
  };

  return options[style] || {};
};

/**
 * Create a complete avatar configuration object
 * @param {Object} overrides - Configuration overrides
 * @returns {Object} - Complete avatar config
 */
export const createAvatarConfig = (overrides = {}) => {
  return {
    ...DEFAULT_AVATAR_CONFIG,
    seed: overrides.seed || generateRandomSeed(),
    ...overrides
  };
};

/**
 * Save avatar to localStorage
 * @param {string} name - Avatar name
 * @param {Object} config - Avatar configuration
 * @returns {Object} - Saved avatar object
 */
export const saveAvatarToStorage = (name, config) => {
  const avatars = getAvatarsFromStorage();
  
  const newAvatar = {
    id: Date.now(),
    name: name || `Avatar ${avatars.length + 1}`,
    config: config,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  avatars.push(newAvatar);
  localStorage.setItem('pixelplay_avatars', JSON.stringify(avatars));
  
  console.log('💾 Avatar saved to localStorage:', newAvatar);
  return newAvatar;
};

/**
 * Get all avatars from localStorage
 * @returns {Array} - Array of saved avatars
 */
export const getAvatarsFromStorage = () => {
  try {
    const stored = localStorage.getItem('pixelplay_avatars');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('❌ Error loading avatars from localStorage:', error);
    return [];
  }
};

/**
 * Get current avatar from localStorage
 * @returns {Object|null} - Current avatar config
 */
export const getCurrentAvatarFromStorage = () => {
  try {
    const stored = localStorage.getItem('pixelplay_current_avatar');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('❌ Error loading current avatar:', error);
    return null;
  }
};

/**
 * Set current avatar in localStorage
 * @param {Object} config - Avatar configuration
 */
export const setCurrentAvatarInStorage = (config) => {
  localStorage.setItem('pixelplay_current_avatar', JSON.stringify(config));
  console.log('✅ Current avatar updated in localStorage');
};

/**
 * Delete avatar from localStorage
 * @param {number} avatarId - Avatar ID to delete
 * @returns {boolean} - Success
 */
export const deleteAvatarFromStorage = (avatarId) => {
  const avatars = getAvatarsFromStorage();
  const filtered = avatars.filter(a => a.id !== avatarId);
  localStorage.setItem('pixelplay_avatars', JSON.stringify(filtered));
  console.log('🗑️ Avatar deleted from localStorage:', avatarId);
  return true;
};

/**
 * Update avatar in localStorage
 * @param {number} avatarId - Avatar ID
 * @param {Object} updates - Updates to apply
 * @returns {Object|null} - Updated avatar
 */
export const updateAvatarInStorage = (avatarId, updates) => {
  const avatars = getAvatarsFromStorage();
  const index = avatars.findIndex(a => a.id === avatarId);
  
  if (index === -1) {
    console.error('❌ Avatar not found:', avatarId);
    return null;
  }

  avatars[index] = {
    ...avatars[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  localStorage.setItem('pixelplay_avatars', JSON.stringify(avatars));
  console.log('✏️ Avatar updated in localStorage:', avatars[index]);
  return avatars[index];
};

export default {
  generateAvatarURL,
  generateRandomSeed,
  isValidAvatarConfig,
  getStyleOptions,
  createAvatarConfig,
  saveAvatarToStorage,
  getAvatarsFromStorage,
  getCurrentAvatarFromStorage,
  setCurrentAvatarInStorage,
  deleteAvatarFromStorage,
  updateAvatarInStorage,
  AVATAR_STYLES,
  DEFAULT_AVATAR_CONFIG
};