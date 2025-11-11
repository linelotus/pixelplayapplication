import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
  generateAvatarURL,
  saveAvatarToStorage,
  getAvatarsFromStorage,
  getCurrentAvatarFromStorage,
  setCurrentAvatarInStorage,
  deleteAvatarFromStorage,
  generateRandomSeed
} from '../utils/avatarUtils';

const AvatarContext = createContext();

// Initial state - combines your existing structure with new utilities
const initialState = {
  userStats: {
    level: 1,
    points: 0
  },
  currentAvatar: {
    style: 'avataaars',
    seed: 'default',
    accessories: [],
    accessoriesChance: 50,
    clothing: 'blazerShirt',
    clothingColor: ['blue'],
    eyebrows: 'default',
    eyes: 'default',
    facialHair: [],
    facialHairChance: 0,
    hair: 'shortWaved',
    hairColor: ['brown'],
    mouth: 'default',
    skin: ['light'],
    top: 'shortWaved',
    backgroundColor: 'b6e3f4',
    size: 200
  },
  savedAvatars: [],
  inventory: {},
  editorSettings: {
    currentStyle: 'avataaars',
    previewMode: 'live'
  },
  notifications: []
};

// Reducer - simplified, just avatar operations
const avatarReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_AVATAR':
      return { ...state, currentAvatar: { ...state.currentAvatar, ...action.payload } };

    case 'SAVE_AVATAR':
      const newAvatar = {
        id: Date.now(),
        name: action.payload.name || `Avatar ${state.savedAvatars.length + 1}`,
        config: action.payload.config || action.payload.settings, // Support both 'config' and 'settings'
        settings: action.payload.config || action.payload.settings, // Backwards compatibility
        createdAt: new Date().toISOString()
      };
      return { ...state, savedAvatars: [...state.savedAvatars, newAvatar] };

    case 'SET_CURRENT_AVATAR':
      return { ...state, currentAvatar: action.payload };

    case 'DELETE_AVATAR':
      return {
        ...state,
        savedAvatars: state.savedAvatars.filter(a => a.id !== action.payload)
      };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, {
          id: Date.now(),
          message: action.payload.message,
          type: action.payload.type || 'info'
        }]
      };

    case 'CLEAR_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };

    case 'LOAD_USER_DATA':
      return { ...state, ...action.payload };

    default:
      return state;
  }
};

// Provider
export const AvatarProvider = ({ children }) => {
  const [state, dispatch] = useReducer(avatarReducer, initialState);

  // Save to localStorage whenever avatars change
  useEffect(() => {
    const dataToSave = {
      userStats: state.userStats,
      currentAvatar: state.currentAvatar,
      savedAvatars: state.savedAvatars,
      inventory: state.inventory
    };
    
    // Save to both your existing key and new utilities format
    localStorage.setItem('pixelplay-data', JSON.stringify(dataToSave));
    setCurrentAvatarInStorage(state.currentAvatar);
    
    console.log('💾 Saved to localStorage:', {
      avatarCount: state.savedAvatars.length,
      currentAvatar: state.currentAvatar.style
    });
  }, [state.userStats, state.currentAvatar, state.savedAvatars, state.inventory]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('pixelplay-data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        dispatch({ type: 'LOAD_USER_DATA', payload: parsed });
        console.log('✅ Loaded from localStorage:', {
          avatarCount: parsed.savedAvatars?.length || 0
        });
      } catch (error) {
        console.error('❌ Could not load saved data:', error);
      }
    } else {
      // Try loading from new utilities format
      const currentAvatar = getCurrentAvatarFromStorage();
      const savedAvatars = getAvatarsFromStorage();
      
      if (currentAvatar || savedAvatars.length > 0) {
        dispatch({ 
          type: 'LOAD_USER_DATA', 
          payload: { 
            currentAvatar: currentAvatar || state.currentAvatar,
            savedAvatars: savedAvatars 
          } 
        });
      }
    }
  }, []);

  // Helper functions
  const value = {
    ...state,
    dispatch,
    isLoading: false,
    syncError: null,

    // Avatar operations
    updateAvatar: (changes) => dispatch({ type: 'UPDATE_AVATAR', payload: changes }),
    
    updateCurrentAvatar: (changes) => dispatch({ type: 'UPDATE_AVATAR', payload: changes }),
    
    saveAvatar: (name, settings) => {
      const config = settings || state.currentAvatar;
      dispatch({ type: 'SAVE_AVATAR', payload: { name, config, settings: config } });
      
      // Also save using new utility for consistency
      saveAvatarToStorage(name, config);
      
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: { message: `Avatar "${name}" saved!`, type: 'success' }
      });
    },
    
    saveCurrentAvatar: (name) => {
      const config = state.currentAvatar;
      dispatch({ type: 'SAVE_AVATAR', payload: { name, config, settings: config } });
      
      // Also save using new utility
      saveAvatarToStorage(name, config);
      
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: { message: `Avatar "${name}" saved!`, type: 'success' }
      });
    },
    
    setCurrentAvatar: (avatar) => dispatch({ type: 'SET_CURRENT_AVATAR', payload: avatar }),
    
    loadSavedAvatar: (avatarId) => {
      const avatar = state.savedAvatars.find(a => a.id === avatarId);
      if (avatar) {
        dispatch({ type: 'SET_CURRENT_AVATAR', payload: avatar.config || avatar.settings });
        return true;
      }
      return false;
    },
    
    deleteAvatar: (id) => {
      dispatch({ type: 'DELETE_AVATAR', payload: id });
      deleteAvatarFromStorage(id);
    },
    
    deleteSavedAvatar: (id) => {
      dispatch({ type: 'DELETE_AVATAR', payload: id });
      deleteAvatarFromStorage(id);
    },

    generateRandomAvatar: () => {
      const randomAvatar = {
        ...state.currentAvatar,
        seed: generateRandomSeed()
      };
      dispatch({ type: 'SET_CURRENT_AVATAR', payload: randomAvatar });
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: { message: '🎲 Random avatar generated!', type: 'success' }
      });
    },

    // Notifications
    addNotification: (message, type) => dispatch({
      type: 'ADD_NOTIFICATION',
      payload: { message, type }
    }),
    clearNotification: (id) => dispatch({ type: 'CLEAR_NOTIFICATION', payload: id }),

    // Utility functions
    getAvatarURL: (config) => generateAvatarURL(config || state.currentAvatar),
    
    // Compatibility
    refreshData: () => console.log('📦 No backend to refresh from'),
    hasCurrentAvatar: !!state.currentAvatar,
    hasSavedAvatars: state.savedAvatars.length > 0,
    savedAvatarsCount: state.savedAvatars.length
  };

  return <AvatarContext.Provider value={value}>{children}</AvatarContext.Provider>;
};

// Custom hook
export const useAvatar = () => {
  const context = useContext(AvatarContext);
  if (!context) throw new Error('useAvatar must be used within an AvatarProvider');
  return context;
};

export default AvatarContext;