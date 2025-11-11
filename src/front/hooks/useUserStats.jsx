import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

/**
 * 🎮 Custom Hook: useUserStats
 * 
 * This hook manages user stats across your entire app.
 * Use it on your Dashboard, Home page, or anywhere you need to show user progress!
 * 
 * Features:
 * - Loads stats from backend when user is logged in
 * - Falls back to localStorage if backend fails
 * - Auto-saves to localStorage as backup
 * - Returns loading state and refresh function
 */

const API_BASE_URL = 'https://stunning-palm-tree-g4p7v5x9wwqj2wqvr-3001.app.github.dev'

export const useUserStats = () => {
    const [userStats, setUserStats] = useState({
        level: 1,
        xp: 0,
        coins: 0,
        totalGamesPlayed: 0,
        weeklyStreak: 0,
        unlockedGames: ['dance', 'yoga', 'memory-match'],
        completedGames: [],
        favoriteGames: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Load user stats from backend or localStorage
     */
    const loadUserStats = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('token');

            // Try to load from localStorage first for instant display
            const savedStats = localStorage.getItem('pixelplay_user_stats');
            if (savedStats) {
                const parsed = JSON.parse(savedStats);
                setUserStats(parsed);
                console.log('📊 Loaded stats from localStorage:', parsed);
            }

            // If user is logged in, fetch fresh data from backend
            if (token) {
                console.log('📡 Fetching fresh stats from backend...');
                const response = await axios.get(
                    `${API_BASE_URL}/api/dashboard/stats`,
                    {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }
                );

                if (response.data.success) {
                    const stats = response.data.stats;
                    const loadedStats = {
                        level: stats.level || 1,
                        xp: stats.xp || 0,
                        coins: stats.coins || 0,
                        totalGamesPlayed: stats.total_games_played || 0,
                        weeklyStreak: stats.streak_days || 0,
                        unlockedGames: stats.unlocked_games || ['dance', 'yoga', 'memory-match'],
                        completedGames: stats.completed_games || [],
                        favoriteGames: stats.favorite_games || []
                    };

                    setUserStats(loadedStats);

                    // Save to localStorage as backup
                    localStorage.setItem('pixelplay_user_stats', JSON.stringify(loadedStats));

                    console.log('✅ Stats updated from backend:', loadedStats);
                }
            }
        } catch (err) {
            console.error('❌ Failed to load stats:', err);
            setError(err.message);

            // Keep using localStorage data if backend fails
        } finally {
            setLoading(false);
        }
    }, []);

    // Load stats on mount
    useEffect(() => {
        loadUserStats();
    }, [loadUserStats]);

    /**
     * Refresh stats (useful after completing a game)
     */
    const refreshStats = useCallback(() => {
        loadUserStats();
    }, [loadUserStats]);

    return {
        userStats,
        loading,
        error,
        refreshStats
    };
};

export default useUserStats;