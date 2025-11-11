import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getUserData } from '../utils/auth';
import { useTTS } from '../hooks/useTTS';
import VoiceSelector from '../components/VoiceSelector';
import axios from 'axios';
import {
    Play,
    Pause,
    RotateCcw,
    Star,
    Trophy,
    Heart,
    Zap,
    Users,
    Target,
    Timer,
    Lock,
    CheckCircle,
    Search,
    ArrowLeft,
    Volume2,
    VolumeX,
    Filter
} from 'lucide-react';

// ===================================
// 🎵 GAME MUSIC CONFIGURATION
// ===================================
const GAME_MUSIC = {
    'dance': '/Audio/upbeat-dance.mp3',
    'ninja': '/Audio/action-theme.mp3',
    'yoga': '/Audio/calm-ambient.mp3',
    'rhythm': '/Audio/electronic-beat.mp3',
    'lightning-ladders': '/Audio/energetic-workout.mp3',
    'shadow-punch': '/Audio/combat-music.mp3',
    'adventure': '/Audio/adventure-theme.mp3',
    'superhero': '/Audio/heroic-theme.mp3',
    'magic': '/Audio/mystical-ambient.mp3',
    'sports': '/Audio/sports-theme.mp3',
    'memory-match': '/Audio/memory-theme.mp3',
    'sequence-memory': '/Audio/brain-theme.mp3'
};

// ===================================
// 🌐 API CONFIGURATION
// ===================================
const API_BASE_URL = 'http://localhost:5000'; // Change to your backend URL

const PixelPlayGameHub = () => {
    // ===================================
    // 📊 STATE MANAGEMENT
    // ===================================

    // Game state
    const [selectedGame, setSelectedGame] = useState(null);
    const [gameState, setGameState] = useState('menu');
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [score, setScore] = useState(0);
    const [streakCount, setStreakCount] = useState(0);

    // Memory game state
    const [memoryCards, setMemoryCards] = useState([]);
    const [flippedCards, setFlippedCards] = useState([]);
    const [matchedCards, setMatchedCards] = useState([]);
    const [memoryMoves, setMemoryMoves] = useState(0);
    const [memoryTimer, setMemoryTimer] = useState(0);

    // Sequence game state
    const [sequence, setSequence] = useState([]);
    const [playerSequence, setPlayerSequence] = useState([]);
    const [isPlayerTurn, setIsPlayerTurn] = useState(false);
    const [activeButton, setActiveButton] = useState(null);
    const [sequenceLevel, setSequenceLevel] = useState(1);
    const [sequenceMessage, setSequenceMessage] = useState('Click START to begin!');

    // UI state
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [showVoiceSettings, setShowVoiceSettings] = useState(false);

    // User state
    const [user, setUser] = useState(null);
    const [userStats, setUserStats] = useState({
        level: 1,
        xp: 0,
        coins: 0,
        totalGamesPlayed: 0,
        weeklyStreak: 0,
        unlockedGames: ['dance', 'yoga', 'memory-match'], // Default unlocked games
        completedGames: [],
        favoriteGames: []
    });
    const [loading, setLoading] = useState(true);

    // Refs
    const currentAudioRef = useRef(null);
    const audioContextRef = useRef(null);

    // TTS Hook
    const {
        speak,
        stopSpeaking,
        voiceEnabled,
        setVoiceEnabled,
        availableVoices,
        selectedVoice,
        setSelectedVoice,
        getKidFriendlyVoices,
        isLoading: voicesLoading
    } = useTTS();

    // ===================================
    // 🎮 ALL 12 GAME DATA
    // ===================================
    const games = [
        {
            id: 'dance',
            name: 'Dance Party',
            emoji: '💃',
            gameType: 'exercise',
            description: 'Dance to fun music and copy the moves! Perfect for getting your groove on.',
            category: 'cardio',
            difficulty: 'Easy',
            duration: '5-10 min',
            xpReward: 50,
            energyRequired: 20,
            unlockLevel: 1,
            playerCount: '1-4 players',
            exercises: [
                { name: 'Warm-up Dance', duration: 45, instruction: 'Start with gentle dance moves!' },
                { name: 'Groove Time', duration: 60, instruction: 'Find your rhythm and groove!' },
                { name: 'Spin Moves', duration: 40, instruction: 'Add some spins to your dance!' },
                { name: 'Jump Dance', duration: 50, instruction: 'Jump to the beat!' },
                { name: 'Freestyle', duration: 60, instruction: 'Dance however you want!' },
                { name: 'Cool Down', duration: 45, instruction: 'Slow dance to cool down!' }
            ],
            hasMusic: true,
            safetyFeatures: ['warm-up', 'cool-down', 'hydration-reminders']
        },
        {
            id: 'ninja',
            name: 'Ninja Training',
            emoji: '🥷',
            gameType: 'exercise',
            description: 'Jump, duck, and punch like a ninja! Master the ancient arts of fitness.',
            category: 'strength',
            difficulty: 'Medium',
            duration: '8-12 min',
            xpReward: 75,
            energyRequired: 30,
            unlockLevel: 3,
            playerCount: '1-2 players',
            exercises: [
                { name: 'Ninja Preparation', duration: 10, instruction: 'Prepare your ninja stance!' },
                { name: 'Jump Training', duration: 40, instruction: 'Practice high ninja jumps!' },
                { name: 'Duck Training', duration: 50, instruction: 'Master the art of ducking!' },
                { name: 'Punch Power', duration: 60, instruction: 'Develop ninja punch strength!' },
                { name: 'Combo Moves', duration: 70, instruction: 'Combine jump, duck, and punch!' },
                { name: 'Speed Challenge', duration: 60, instruction: 'Fast ninja movements!' },
                { name: 'Stealth Mode', duration: 25, instruction: 'Silent ninja techniques!' },
                { name: 'Advanced Combat', duration: 80, instruction: 'Master ninja warrior moves!' },
                { name: 'Meditation Cool Down', duration: 60, instruction: 'Find your inner ninja peace!' }
            ],
            hasMusic: true,
            safetyFeatures: ['form-guidance', 'rest-periods']
        },
        {
            id: 'yoga',
            name: 'Animal Yoga',
            emoji: '🧘',
            gameType: 'exercise',
            description: 'Stretch like different animals! Calm your mind and strengthen your body.',
            category: 'flexibility',
            difficulty: 'Easy',
            duration: '10-15 min',
            xpReward: 60,
            energyRequired: 15,
            unlockLevel: 1,
            playerCount: '1+ players',
            exercises: [
                { name: 'Mountain Pose', duration: 30, instruction: 'Stand tall like a mountain!' },
                { name: 'Cat Stretch', duration: 45, instruction: 'Arch your back like a cat!' },
                { name: 'Downward Dog', duration: 50, instruction: 'Stretch like a happy dog!' },
                { name: 'Cobra Pose', duration: 50, instruction: 'Rise up like a cobra!' },
                { name: 'Frog Jumps', duration: 40, instruction: 'Hop like a playful frog!' },
                { name: 'Eagle Balance', duration: 60, instruction: 'Balance with eagle focus!' },
                { name: 'Child Pose Rest', duration: 45, instruction: 'Rest like a sleepy child!' },
                { name: 'Tree Pose', duration: 35, instruction: 'Stand strong like a tree!' },
                { name: 'Butterfly Stretch', duration: 60, instruction: 'Flutter like a butterfly!' },
                { name: 'Final Relaxation', duration: 55, instruction: 'Deep relaxation and breathing!' }
            ],
            hasMusic: true,
            safetyFeatures: ['breathing-guidance', 'relaxation-focus']
        },
        {
            id: 'rhythm',
            name: 'Rhythm Master',
            emoji: '🎵',
            gameType: 'exercise',
            description: 'Move to the beat! Follow the rhythm and hit every move perfectly.',
            category: 'cardio',
            difficulty: 'Medium',
            duration: '6-10 min',
            xpReward: 65,
            energyRequired: 25,
            unlockLevel: 4,
            playerCount: '1-2 players',
            exercises: [
                { name: 'Beat Basics', duration: 40, instruction: 'Feel the rhythm in your body!' },
                { name: 'Step to the Beat', duration: 50, instruction: 'Step on every beat!' },
                { name: 'Clap and Move', duration: 45, instruction: 'Clap and move together!' },
                { name: 'Speed Rhythm', duration: 60, instruction: 'Keep up with the fast beat!' },
                { name: 'Freestyle Flow', duration: 55, instruction: 'Create your own rhythm!' },
                { name: 'Cool Down Sway', duration: 35, instruction: 'Slow sway to cool down!' }
            ],
            hasMusic: true,
            safetyFeatures: ['rhythm-guidance', 'pace-control']
        },
        {
            id: 'lightning-ladders',
            name: 'Lightning Ladders',
            emoji: '⚡',
            gameType: 'exercise',
            description: 'Super fast footwork! Train your agility and speed with lightning-quick movements.',
            category: 'agility',
            difficulty: 'Hard',
            duration: '8-12 min',
            xpReward: 90,
            energyRequired: 35,
            unlockLevel: 6,
            playerCount: '1 player',
            exercises: [
                { name: 'Ladder Warmup', duration: 30, instruction: 'Prepare your feet!' },
                { name: 'Quick Steps', duration: 50, instruction: 'Fast feet through the ladder!' },
                { name: 'Side Shuffle', duration: 55, instruction: 'Shuffle side to side!' },
                { name: 'In-Out Drill', duration: 60, instruction: 'Jump in and out quickly!' },
                { name: 'Crossover Steps', duration: 65, instruction: 'Cross your feet through!' },
                { name: 'Sprint Finish', duration: 45, instruction: 'Give it all you got!' },
                { name: 'Recovery Walk', duration: 40, instruction: 'Walk it out slowly!' }
            ],
            hasMusic: true,
            safetyFeatures: ['proper-warmup', 'recovery-periods']
        },
        {
            id: 'shadow-punch',
            name: 'Shadow Boxing',
            emoji: '🥊',
            gameType: 'exercise',
            description: 'Box like a champion! Practice your jabs, hooks, and uppercuts.',
            category: 'strength',
            difficulty: 'Hard',
            duration: '10-15 min',
            xpReward: 85,
            energyRequired: 40,
            unlockLevel: 7,
            playerCount: '1 player',
            exercises: [
                { name: 'Stance Training', duration: 30, instruction: 'Get into boxing stance!' },
                { name: 'Jab Practice', duration: 50, instruction: 'Perfect your jab!' },
                { name: 'Hook Combos', duration: 60, instruction: 'Throw powerful hooks!' },
                { name: 'Uppercut Power', duration: 55, instruction: 'Uppercut with force!' },
                { name: 'Speed Combinations', duration: 70, instruction: 'Fast combo punches!' },
                { name: 'Defense Moves', duration: 50, instruction: 'Duck and weave!' },
                { name: 'Final Round', duration: 60, instruction: 'Give it your all!' },
                { name: 'Cool Down', duration: 40, instruction: 'Slow movements to cool!' }
            ],
            hasMusic: true,
            safetyFeatures: ['proper-form', 'controlled-movement']
        },
        {
            id: 'adventure',
            name: 'Adventure Quest',
            emoji: '🗺️',
            gameType: 'exercise',
            description: 'Go on an epic adventure! Climb mountains, cross rivers, and explore!',
            category: 'cardio',
            difficulty: 'Medium',
            duration: '7-12 min',
            xpReward: 70,
            energyRequired: 28,
            unlockLevel: 5,
            playerCount: '1-4 players',
            exercises: [
                { name: 'Journey Start', duration: 30, instruction: 'Begin your adventure!' },
                { name: 'Mountain Climb', duration: 60, instruction: 'Climb the tall mountain!' },
                { name: 'River Jump', duration: 50, instruction: 'Jump across the river!' },
                { name: 'Forest Run', duration: 65, instruction: 'Run through the forest!' },
                { name: 'Cave Crawl', duration: 45, instruction: 'Crawl through the cave!' },
                { name: 'Victory Dance', duration: 40, instruction: 'Celebrate your success!' }
            ],
            hasMusic: true,
            safetyFeatures: ['imaginative-play', 'safety-reminders']
        },
        {
            id: 'superhero',
            name: 'Superhero Training',
            emoji: '🦸',
            gameType: 'exercise',
            description: 'Train like a superhero! Build super strength and super speed!',
            category: 'strength',
            difficulty: 'Medium',
            duration: '8-12 min',
            xpReward: 80,
            energyRequired: 32,
            unlockLevel: 5,
            playerCount: '1-3 players',
            exercises: [
                { name: 'Hero Warmup', duration: 35, instruction: 'Wake up your superpowers!' },
                { name: 'Super Jumps', duration: 50, instruction: 'Jump like you can fly!' },
                { name: 'Power Punches', duration: 55, instruction: 'Punch with super strength!' },
                { name: 'Speed Running', duration: 60, instruction: 'Run at super speed!' },
                { name: 'Hero Poses', duration: 45, instruction: 'Strike a superhero pose!' },
                { name: 'Save the Day', duration: 50, instruction: 'Complete your mission!' },
                { name: 'Hero Rest', duration: 40, instruction: 'Rest like a hero!' }
            ],
            hasMusic: true,
            safetyFeatures: ['age-appropriate', 'fun-focused']
        },
        {
            id: 'magic',
            name: 'Magic Spells',
            emoji: '🔮',
            gameType: 'exercise',
            description: 'Cast magical spells with movement! Become a powerful wizard!',
            category: 'flexibility',
            difficulty: 'Easy',
            duration: '6-10 min',
            xpReward: 55,
            energyRequired: 18,
            unlockLevel: 2,
            playerCount: '1-4 players',
            exercises: [
                { name: 'Wand Warmup', duration: 35, instruction: 'Warm up your magic wand!' },
                { name: 'Circle Spell', duration: 45, instruction: 'Cast circles in the air!' },
                { name: 'Flying Spell', duration: 50, instruction: 'Make yourself fly!' },
                { name: 'Lightning Bolt', duration: 40, instruction: 'Throw lightning bolts!' },
                { name: 'Shield Spell', duration: 45, instruction: 'Create a magic shield!' },
                { name: 'Meditation', duration: 50, instruction: 'Meditate to recharge!' }
            ],
            hasMusic: true,
            safetyFeatures: ['creative-movement', 'gentle-exercise']
        },
        {
            id: 'sports',
            name: 'Sports Mix',
            emoji: '⚽',
            gameType: 'exercise',
            description: 'Try different sports! Soccer, basketball, tennis, and more!',
            category: 'cardio',
            difficulty: 'Medium',
            duration: '8-12 min',
            xpReward: 70,
            energyRequired: 30,
            unlockLevel: 4,
            playerCount: '1-4 players',
            exercises: [
                { name: 'Sports Warmup', duration: 30, instruction: 'Get ready to play!' },
                { name: 'Soccer Kicks', duration: 50, instruction: 'Kick the soccer ball!' },
                { name: 'Basketball Shots', duration: 55, instruction: 'Shoot some hoops!' },
                { name: 'Tennis Swings', duration: 50, instruction: 'Swing like a tennis pro!' },
                { name: 'Baseball Hits', duration: 45, instruction: 'Hit a home run!' },
                { name: 'Victory Lap', duration: 40, instruction: 'Take a victory lap!' }
            ],
            hasMusic: true,
            safetyFeatures: ['sport-safety', 'equipment-free']
        },
        {
            id: 'memory-match',
            name: 'Fitness Match Pairs',
            emoji: '🎴',
            gameType: 'memory',
            description: 'Flip cards to find matching pairs of fitness items! Test your visual memory.',
            category: 'brain',
            difficulty: 'Easy',
            duration: '3-7 min',
            xpReward: 30,
            energyRequired: 5,
            unlockLevel: 1,
            playerCount: '1 player',
            hasMusic: true
        },
        {
            id: 'sequence-memory',
            name: 'Exercise Sequence',
            emoji: '🧠',
            gameType: 'sequence',
            description: 'Watch exercises light up, then repeat the pattern! Challenge your memory',
            category: 'brain',
            difficulty: 'Medium',
            duration: '2-10 min',
            xpReward: 25,
            energyRequired: 5,
            unlockLevel: 2,
            playerCount: '1 player',
            hasMusic: true
        }
    ];

    // ===================================
    // 🔓 HELPER: Check if game is unlocked
    // ===================================
    const isGameUnlocked = (game) => {
        return userStats.level >= game.unlockLevel;
    };

    // ===================================
    // 🎯 FILTERING LOGIC
    // ===================================
    const getFilteredGames = () => {
        let filtered = games;

        // Filter by search term
        if (searchTerm.trim()) {
            filtered = filtered.filter(game =>
                game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                game.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                game.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(game => game.category === selectedCategory);
        }

        // Filter by difficulty
        if (selectedDifficulty !== 'all') {
            filtered = filtered.filter(game => game.difficulty === selectedDifficulty);
        }

        return filtered;
    };

    // Get unique categories and difficulties for filters
    const categories = ['all', ...new Set(games.map(g => g.category))];
    const difficulties = ['all', 'Easy', 'Medium', 'Hard'];

    // ===================================
    // 🎵 AUDIO MANAGEMENT
    // ===================================

    const playGameMusic = useCallback((gameId) => {
        if (!audioEnabled) return;

        const musicPath = GAME_MUSIC[gameId];
        if (!musicPath) return;

        try {
            stopCurrentAudio();
            const audio = new Audio(musicPath);
            audio.loop = true;
            audio.volume = 0.3;

            audio.play().catch(err => {
                console.log('Music autoplay blocked:', err);
            });

            currentAudioRef.current = audio;
        } catch (error) {
            console.error('Error playing music:', error);
        }
    }, [audioEnabled]);

    const stopCurrentAudio = useCallback(() => {
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current.currentTime = 0;
            currentAudioRef.current = null;
        }
    }, []);

    // ===================================
    // 🌐 BACKEND API FUNCTIONS
    // ===================================

    /**
     * 🎯 Record game completion to backend
     * This automatically updates ALL stats!
     */
    const recordGameCompletion = useCallback(async (gameData) => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                console.warn('⚠️ No auth token - saving locally only');

                // Save locally even without backend
                const localStats = {
                    ...userStats,
                    xp: userStats.xp + gameData.baseXP,
                    coins: userStats.coins + 10,
                    totalGamesPlayed: userStats.totalGamesPlayed + 1
                };

                // Calculate new level
                localStats.level = Math.floor(localStats.xp / 100) + 1;

                setUserStats(localStats);
                localStorage.setItem('pixelplay_user_stats', JSON.stringify(localStats));

                return null;
            }

            console.log('📤 Sending game data to backend:', gameData);

            const response = await axios.post(
                `${API_BASE_URL}/api/games/complete-session`,
                {
                    game_id: gameData.gameId,
                    score: gameData.score,
                    duration_minutes: gameData.durationMinutes,
                    completed: gameData.completed,
                    base_xp: gameData.baseXP
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ Backend response:', response.data);

            // Update local state with backend response
            if (response.data.success && response.data.user_stats) {
                const stats = response.data.user_stats;
                const updatedStats = {
                    level: stats.level,
                    xp: stats.xp,
                    coins: stats.coins || userStats.coins,
                    weeklyStreak: stats.streak_days,
                    totalGamesPlayed: userStats.totalGamesPlayed + 1,
                    unlockedGames: userStats.unlockedGames,
                    completedGames: userStats.completedGames,
                    favoriteGames: userStats.favoriteGames
                };

                setUserStats(updatedStats);

                // Save to localStorage as backup
                localStorage.setItem('pixelplay_user_stats', JSON.stringify(updatedStats));

                // Check for level up
                if (response.data.session?.leveled_up) {
                    const newLevel = response.data.session.new_level;
                    const coinsEarned = response.data.session.coins_earned;
                    setTimeout(() => {
                        alert(`🎉 LEVEL UP!\n\nYou're now Level ${newLevel}!\n+${coinsEarned} coins earned!`);
                    }, 500);
                }
            }

            return response.data;
        } catch (error) {
            console.error('❌ Backend error:', error.response?.data || error.message);

            // Fallback: Update locally if backend fails
            console.warn('⚠️ Backend save failed, updating locally only');

            const localStats = {
                ...userStats,
                xp: userStats.xp + gameData.baseXP,
                coins: userStats.coins + 10,
                totalGamesPlayed: userStats.totalGamesPlayed + 1
            };

            // Calculate new level
            localStats.level = Math.floor(localStats.xp / 100) + 1;

            setUserStats(localStats);
            localStorage.setItem('pixelplay_user_stats', JSON.stringify(localStats));

            return null;
        }
    }, [userStats]);

    /**
     * 📊 Load user stats from backend on component mount
     */
    const loadUserStats = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.warn('⚠️ No token found - user not logged in');
                // Load from localStorage as fallback
                const savedStats = localStorage.getItem('pixelplay_user_stats');
                if (savedStats) {
                    const parsed = JSON.parse(savedStats);
                    setUserStats(parsed);
                    console.log('📊 Loaded stats from localStorage:', parsed);
                }
                setLoading(false);
                return;
            }

            console.log('📡 Loading user stats from backend...');
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

                // Also save to localStorage as backup
                localStorage.setItem('pixelplay_user_stats', JSON.stringify(loadedStats));

                console.log('✅ Stats loaded from backend:', loadedStats);
            }
        } catch (error) {
            console.error('❌ Failed to load stats from backend:', error);

            // Fallback to localStorage
            const savedStats = localStorage.getItem('pixelplay_user_stats');
            if (savedStats) {
                const parsed = JSON.parse(savedStats);
                setUserStats(parsed);
                console.log('📊 Loaded stats from localStorage fallback:', parsed);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    // Load user stats when component mounts
    useEffect(() => {
        loadUserStats();
    }, [loadUserStats]);

    // Save stats to localStorage whenever they change (as backup)
    useEffect(() => {
        if (!loading) {
            localStorage.setItem('pixelplay_user_stats', JSON.stringify(userStats));
            console.log('💾 Stats auto-saved to localStorage:', userStats);
        }
    }, [userStats, loading]);

    // ===================================
    // 🎮 GAME LOGIC
    // ===================================

    const startGame = useCallback((game) => {
        // Check if game is locked
        if (!isGameUnlocked(game)) {
            alert(`🔒 This game unlocks at Level ${game.unlockLevel}!\n\nYou're currently Level ${userStats.level}. Keep playing to level up!`);
            return;
        }

        setSelectedGame(game);
        setScore(0);
        setStreakCount(0);

        if (game.gameType === 'memory') {
            const emojis = ['🏋️', '🧘', '🏃', '⚽', '🥊', '🏊', '🚴', '🤸'];
            const shuffled = [...emojis, ...emojis]
                .sort(() => Math.random() - 0.5)
                .map((emoji, index) => ({ id: index, emoji, matched: false }));
            setMemoryCards(shuffled);
            setFlippedCards([]);
            setMatchedCards([]);
            setMemoryMoves(0);
            setMemoryTimer(0);
        } else if (game.gameType === 'sequence') {
            setSequence([]);
            setPlayerSequence([]);
            setSequenceLevel(1);
            setIsPlayerTurn(false);
            setSequenceMessage('Click START to begin!');
        } else {
            setCurrentExerciseIndex(0);
            const firstExercise = game.exercises[0];
            setTimeRemaining(firstExercise.duration);
        }

        setGameState('playing');
        playGameMusic(game.id);

        if (voiceEnabled) {
            speak(`Starting ${game.name}! Let's have fun!`);
        }
    }, [playGameMusic, voiceEnabled, speak, userStats.level]);

    const pauseGame = () => {
        setGameState('paused');
        stopCurrentAudio();
    };

    const resumeGame = () => {
        setGameState('playing');
        if (selectedGame) {
            playGameMusic(selectedGame.id);
        }
    };

    const resetGame = () => {
        setGameState('menu');
        setSelectedGame(null);
        setScore(0);
        setStreakCount(0);
        stopCurrentAudio();
    };

    const completeGame = useCallback(async () => {
        setGameState('completed');
        stopCurrentAudio();

        const totalXP = selectedGame.xpReward + (streakCount * 5);
        const durationMinutes = Math.ceil(selectedGame.exercises?.reduce((sum, ex) => sum + ex.duration, 0) / 60) || 5;

        // Update local stats BEFORE sending to backend
        const newXP = userStats.xp + totalXP;
        const newGamesPlayed = userStats.totalGamesPlayed + 1;

        // Calculate new level (every 100 XP = 1 level)
        const newLevel = Math.floor(newXP / 100) + 1;
        const leveledUp = newLevel > userStats.level;

        // Update local state immediately for instant feedback
        setUserStats(prev => ({
            ...prev,
            xp: newXP,
            level: newLevel,
            totalGamesPlayed: newGamesPlayed,
            coins: prev.coins + (leveledUp ? 50 : 10) // Bonus coins for level up
        }));

        // Send to backend (this will sync with server)
        const backendResult = await recordGameCompletion({
            gameId: selectedGame.id,
            score: score,
            durationMinutes: durationMinutes,
            completed: true,
            baseXP: totalXP
        });

        // If backend returns different stats, use those instead
        if (backendResult?.user_stats) {
            setUserStats(prev => ({
                ...prev,
                level: backendResult.user_stats.level,
                xp: backendResult.user_stats.xp,
                coins: backendResult.user_stats.coins || prev.coins,
                weeklyStreak: backendResult.user_stats.streak_days
            }));
        }

        if (voiceEnabled) {
            speak(`Amazing work! You earned ${totalXP} experience points!`);
        }
    }, [selectedGame, score, streakCount, recordGameCompletion, stopCurrentAudio, voiceEnabled, speak, userStats]);

    // Timer logic for exercise games
    useEffect(() => {
        if (gameState !== 'playing' || !selectedGame || selectedGame.gameType !== 'exercise') return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    const nextIndex = currentExerciseIndex + 1;
                    if (nextIndex >= selectedGame.exercises.length) {
                        completeGame();
                        return 0;
                    } else {
                        setCurrentExerciseIndex(nextIndex);
                        const nextExercise = selectedGame.exercises[nextIndex];
                        setScore(prev => prev + 10);
                        setStreakCount(prev => prev + 1);

                        if (voiceEnabled) {
                            speak(nextExercise.instruction);
                        }

                        return nextExercise.duration;
                    }
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState, selectedGame, currentExerciseIndex, completeGame, voiceEnabled, speak]);

    // Memory game timer
    useEffect(() => {
        if (gameState !== 'playing' || !selectedGame || selectedGame.gameType !== 'memory') return;

        const timer = setInterval(() => {
            setMemoryTimer(prev => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState, selectedGame]);

    // Memory card flip logic
    const handleCardClick = (card) => {
        if (flippedCards.length === 2 || flippedCards.includes(card.id) || matchedCards.includes(card.id)) {
            return;
        }

        const newFlipped = [...flippedCards, card.id];
        setFlippedCards(newFlipped);

        if (newFlipped.length === 2) {
            setMemoryMoves(prev => prev + 1);
            const [first, second] = newFlipped;
            const firstCard = memoryCards.find(c => c.id === first);
            const secondCard = memoryCards.find(c => c.id === second);

            if (firstCard.emoji === secondCard.emoji) {
                setMatchedCards(prev => [...prev, first, second]);
                setScore(prev => prev + 10);
                setFlippedCards([]);

                if (matchedCards.length + 2 === memoryCards.length) {
                    setTimeout(completeGame, 500);
                }
            } else {
                setTimeout(() => setFlippedCards([]), 1000);
            }
        }
    };

    // Sequence game logic
    const startSequenceGame = () => {
        const colors = ['red', 'blue', 'green', 'yellow'];
        const newColor = colors[Math.floor(Math.random() * colors.length)];
        setSequence([newColor]);
        playSequence([newColor]);
    };

    const playSequence = (seq) => {
        setIsPlayerTurn(false);
        setSequenceMessage('Watch the pattern...');

        seq.forEach((color, index) => {
            setTimeout(() => {
                setActiveButton(color);
                setTimeout(() => setActiveButton(null), 300);
            }, index * 600);
        });

        setTimeout(() => {
            setIsPlayerTurn(true);
            setSequenceMessage('Your turn! Repeat the pattern.');
        }, seq.length * 600 + 500);
    };

    const handleSequenceButtonClick = (color) => {
        if (!isPlayerTurn) return;

        const newPlayerSequence = [...playerSequence, color];
        setPlayerSequence(newPlayerSequence);

        if (newPlayerSequence[newPlayerSequence.length - 1] !== sequence[newPlayerSequence.length - 1]) {
            setSequenceMessage('Wrong! Game Over!');
            setIsPlayerTurn(false);
            setTimeout(() => {
                completeGame();
            }, 1500);
            return;
        }

        if (newPlayerSequence.length === sequence.length) {
            setScore(prev => prev + 10);
            setSequenceLevel(prev => prev + 1);
            setPlayerSequence([]);

            const colors = ['red', 'blue', 'green', 'yellow'];
            const newColor = colors[Math.floor(Math.random() * colors.length)];
            const newSequence = [...sequence, newColor];
            setSequence(newSequence);

            setTimeout(() => {
                setSequenceMessage('Great! Watch the next pattern...');
                playSequence(newSequence);
            }, 1000);
        }
    };

    // ===================================
    // 🎨 RENDER: GAME MENU
    // ===================================

    if (gameState === 'menu') {
        const filteredGames = getFilteredGames();

        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(to right top, #fb735f, #ff6871, #ff5f85, #ff599c, #ff58b5, #fa5ec4, #f365d2, #eb6ce0, #df74e4, #d37be6, #c881e7, #bd86e7)',
                color: 'white',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                padding: '2rem 1rem'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h1 style={{
                            fontSize: '3rem',
                            fontWeight: '800',
                            margin: '0 0 0.5rem 0',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                        }}>🎮 Pixel Play Game Hub</h1>
                        <p style={{
                            fontSize: '1.2rem',
                            opacity: '0.9',
                            margin: '0 0 1rem 0'
                        }}>All 12 Amazing Games!</p>

                        {/* User Stats Bar */}
                        <div style={{
                            background: 'rgba(208, 79, 204, 0.54)',
                            borderRadius: '12px',
                            padding: '1rem',
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '2rem',
                            flexWrap: 'wrap',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <div><strong>Level:</strong> {userStats.level}</div>
                            <div><strong>XP:</strong> {userStats.xp}</div>
                            <div><strong>Coins:</strong> 🪙 {userStats.coins}</div>
                            <div><strong>Streak:</strong> 🔥 {userStats.weeklyStreak} days</div>
                        </div>
                    </div>

                    {/* Search and Filter Section */}
                    <div style={{
                        background: 'rgba(208, 79, 204, 0.54)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        marginBottom: '2rem',
                        backdropFilter: 'blur(10px)'
                    }}>
                        {/* Search Bar */}
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                background: 'rgba(255, 255, 255, 0.2)',
                                borderRadius: '8px',
                                padding: '0.75rem 1rem'
                            }}>
                                <Search size={20} style={{ marginRight: '0.5rem', opacity: 0.7 }} />
                                <input
                                    type="text"
                                    placeholder="Search games..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        flex: 1,
                                        background: 'transparent',
                                        border: 'none',
                                        outline: 'none',
                                        color: 'white',
                                        fontSize: '1rem',
                                        fontWeight: '500'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Filters */}
                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            flexWrap: 'wrap'
                        }}>
                            {/* Category Filter */}
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.9rem',
                                    fontWeight: '600'
                                }}>
                                    <Filter size={16} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />
                                    Category
                                </label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        color: 'white',
                                        fontSize: '1rem',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat} style={{ color: '#333' }}>
                                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Difficulty Filter */}
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.9rem',
                                    fontWeight: '600'
                                }}>
                                    <Target size={16} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />
                                    Difficulty
                                </label>
                                <select
                                    value={selectedDifficulty}
                                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        color: 'white',
                                        fontSize: '1rem',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {difficulties.map(diff => (
                                        <option key={diff} value={diff} style={{ color: '#333' }}>
                                            {diff.charAt(0).toUpperCase() + diff.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Audio Toggle */}
                            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                <button
                                    onClick={() => setAudioEnabled(!audioEnabled)}
                                    style={{
                                        background: audioEnabled ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                                        border: '2px solid rgba(255, 255, 255, 0.3)',
                                        color: 'white',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontWeight: '600'
                                    }}
                                >
                                    {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                                    {audioEnabled ? 'Sound On' : 'Sound Off'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Results Count */}
                    <p style={{
                        textAlign: 'center',
                        marginBottom: '1rem',
                        opacity: 0.9
                    }}>
                        Showing {filteredGames.length} of {games.length} games
                    </p>

                    {/* Game Cards Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {filteredGames.map(game => {
                            const unlocked = isGameUnlocked(game);

                            return (
                                <div
                                    key={game.id}
                                    style={{
                                        background: unlocked
                                            ? 'rgba(255, 255, 255, 0.95)'
                                            : 'rgba(0, 0, 0, 0.3)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '16px',
                                        padding: '1.5rem',
                                        border: '2px solid rgba(255, 255, 255, 0.2)',
                                        transition: 'all 0.3s ease',
                                        cursor: unlocked ? 'pointer' : 'not-allowed',
                                        opacity: unlocked ? 1 : 0.6,
                                        position: 'relative',
                                        overflow: 'hidden',
                                        color: unlocked ? "#1f2937" : "white",
                                    }}
                                    onMouseEnter={e => {
                                        if (unlocked) {
                                            e.currentTarget.style.transform = 'translateY(-5px)';
                                            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        if (unlocked) {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }
                                    }}
                                    onClick={() => unlocked && startGame(game)}
                                >
                                    {/* Lock Icon for Locked Games */}
                                    {!unlocked && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '1rem',
                                            right: '1rem',
                                            background: 'rgba(239, 68, 68, 0.9)',
                                            borderRadius: '50%',
                                            padding: '0.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Lock size={20} />
                                        </div>
                                    )}

                                    {/* Game Emoji */}
                                    <div style={{
                                        fontSize: '3rem',
                                        marginBottom: '1rem',
                                        textAlign: 'center'
                                    }}>{game.emoji}</div>

                                    {/* Game Name */}
                                    <h3 style={{
                                        margin: '0 0 0.5rem 0',
                                        fontSize: '1.5rem',
                                        fontWeight: '700',
                                        textAlign: 'center'
                                    }}>{game.name}</h3>

                                    {/* Game Description */}
                                    <p style={{
                                        margin: '0 0 1rem 0',
                                        fontSize: '0.9rem',
                                        opacity: '0.9',
                                        textAlign: 'center',
                                        minHeight: '3rem'
                                    }}>{game.description}</p>

                                    {/* Game Info Tags */}
                                    <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '0.5rem',
                                        marginBottom: '1rem',
                                        justifyContent: 'center'
                                    }}>
                                        <span style={{
                                            background: 'rgba(59, 130, 246, 0.3)',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '12px',
                                            fontSize: '0.8rem',
                                            fontWeight: '600',
                                            border: '1px solid rgba(59, 130, 246, 0.5)'
                                        }}>
                                            {game.category}
                                        </span>
                                        <span style={{
                                            background: game.difficulty === 'Easy' ? 'rgba(34, 197, 94, 0.3)' :
                                                game.difficulty === 'Medium' ? 'rgba(251, 191, 36, 0.3)' :
                                                    'rgba(239, 68, 68, 0.3)',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '12px',
                                            fontSize: '0.8rem',
                                            fontWeight: '600',
                                            border: `1px solid ${game.difficulty === 'Easy' ? 'rgba(34, 197, 94, 0.5)' :
                                                game.difficulty === 'Medium' ? 'rgba(251, 191, 36, 0.5)' :
                                                    'rgba(239, 68, 68, 0.5)'}`
                                        }}>
                                            {game.difficulty}
                                        </span>
                                        <span style={{
                                            background: 'rgba(168, 85, 247, 0.3)',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '12px',
                                            fontSize: '0.8rem',
                                            fontWeight: '600',
                                            border: '1px solid rgba(168, 85, 247, 0.5)'
                                        }}>
                                            ⏱️ {game.duration}
                                        </span>
                                    </div>

                                    {/* XP and Level Info */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        paddingTop: '1rem',
                                        borderTop: '1px solid rgba(255, 255, 255, 0.2)'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            <Star size={18} style={{ color: '#fbbf24' }} />
                                            <span style={{ fontWeight: '600' }}>+{game.xpReward} XP</span>
                                        </div>
                                        {!unlocked && (
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                fontSize: '0.85rem',
                                                opacity: 0.9
                                            }}>
                                                <Lock size={14} />
                                                Level {game.unlockLevel}
                                            </div>
                                        )}
                                        {unlocked && (
                                            <CheckCircle size={18} style={{ color: '#10b981' }} />
                                        )}
                                    </div>

                                    {/* Play Button */}
                                    {unlocked && (
                                        <button
                                            style={{
                                                width: '100%',
                                                marginTop: '1rem',
                                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                                color: 'white',
                                                border: 'none',
                                                padding: '0.75rem',
                                                borderRadius: '8px',
                                                fontSize: '1rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                        >
                                            <Play size={20} />
                                            Play Now
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* No Results Message */}
                    {filteredGames.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '3rem',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px'
                        }}>
                            <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>😢 No games found</p>
                            <p style={{ opacity: 0.8 }}>Try adjusting your search or filters</p>
                        </div>
                    )}

                    {/* ===================================
                        🏠 BOTTOM NAVIGATION BUTTONS
                        =================================== */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '1rem',
                        marginTop: '3rem',
                        paddingTop: '2rem',
                        borderTop: '2px solid rgba(255, 255, 255, 0.2)'
                    }}>
                        <button
                            onClick={() => window.location.href = '/'}
                            style={{
                                background: 'rgba(255, 255, 255, 0.95)',
                                color: '#1f2937',
                                border: '2px solid rgba(255, 255, 255, 0.4)',
                                padding: '1rem 2rem',
                                borderRadius: '12px',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
                                minWidth: '180px',
                                justifyContent: 'center'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-3px)';
                                e.currentTarget.style.boxShadow = '0 6px 25px rgba(0, 0, 0, 0.25)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.15)';
                            }}
                        >
                            🏠 Home
                        </button>

                        <button
                            onClick={() => window.location.href = '/dashboard'}
                            style={{
                                background: 'linear-gradient(135deg, #8d15a0e3, #ac2fd3ff)',
                                color: 'white',
                                border: 'none',
                                padding: '1rem 2rem',
                                borderRadius: '12px',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                                minWidth: '180px',
                                justifyContent: 'center'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-3px)';
                                e.currentTarget.style.boxShadow = '0 6px 25px rgba(102, 126, 234, 0.6)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                            }}
                        >
                            📊 Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ===================================
    // 🎨 RENDER: EXERCISE GAME
    // ===================================

    if (gameState === 'playing' && selectedGame && selectedGame.gameType === 'exercise') {
        const currentExercise = selectedGame.exercises[currentExerciseIndex];
        const progress = ((currentExerciseIndex + 1) / selectedGame.exercises.length) * 100;

        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(to right top, #fb735f, #ff6871, #ff5f85, #ff599c, #ff58b5, #fa5ec4, #f365d2, #eb6ce0, #df74e4, #d37be6, #c881e7, #bd86e7)',
                color: 'white',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                padding: '1rem'
            }}>
                {/* Top Controls */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem',
                    maxWidth: '800px',
                    margin: '0 auto 2rem auto'
                }}>
                    <button
                        onClick={resetGame}
                        style={{
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: 'none',
                            color: 'white',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <ArrowLeft size={20} />
                        Exit
                    </button>

                    <button
                        onClick={gameState === 'paused' ? resumeGame : pauseGame}
                        style={{
                            background: gameState === 'paused' ? '#10b981' : '#f59e0b',
                            border: 'none',
                            color: 'white',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        {gameState === 'paused' ? <Play size={20} /> : <Pause size={20} />}
                        {gameState === 'paused' ? 'Resume' : 'Pause'}
                    </button>
                </div>

                {/* Progress Bar */}
                <div style={{
                    maxWidth: '600px',
                    margin: '0 auto 2rem auto',
                    background: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    height: '12px'
                }}>
                    <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: '#10b981',
                        transition: 'width 0.3s ease'
                    }} />
                </div>

                {/* Main Content */}
                <div style={{
                    maxWidth: '600px',
                    margin: '0 auto',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{selectedGame.emoji}</div>
                    <h2 style={{
                        fontSize: '2rem',
                        fontWeight: '700',
                        margin: '0 0 1rem 0'
                    }}>{currentExercise?.name || 'Get Ready!'}</h2>
                    <p style={{
                        fontSize: '1.2rem',
                        opacity: '0.9',
                        margin: '0 0 2rem 0'
                    }}>{currentExercise?.instruction || 'Prepare for your workout!'}</p>

                    <div style={{
                        width: '150px',
                        height: '150px',
                        border: '6px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '50%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 2rem auto',
                        background: 'rgba(255, 255, 255, 0.1)'
                    }}>
                        <div style={{
                            fontSize: '2.5rem',
                            fontWeight: '800',
                            color: '#fbbf24'
                        }}>{timeRemaining}</div>
                        <div style={{
                            fontSize: '0.8rem',
                            opacity: '0.8'
                        }}>seconds</div>
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '2rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        padding: '1rem',
                        borderRadius: '8px'
                    }}>
                        <div style={{ fontWeight: '600' }}>Score: {score}</div>
                        <div style={{ fontWeight: '600' }}>Streak: {streakCount}</div>
                    </div>
                </div>

                {gameState === 'paused' && (
                    <div style={{
                        position: 'fixed',
                        inset: '0',
                        background: 'rgba(0, 0, 0, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            padding: '2rem',
                            borderRadius: '16px',
                            textAlign: 'center',
                            color: '#1F2937'
                        }}>
                            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem' }}>Game Paused</h3>
                            <p style={{ margin: '0 0 1.5rem 0', color: '#6B7280' }}>
                                Take a breath and resume when ready!
                            </p>
                            <button
                                style={{
                                    background: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    margin: '0 auto'
                                }}
                                onClick={resumeGame}
                            >
                                <Play size={20} />
                                Resume
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ===================================
    // 🎨 RENDER: MEMORY GAME
    // ===================================

    if (gameState === 'playing' && selectedGame && selectedGame.gameType === 'memory') {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(to right top, #fb735f, #ff6871, #ff5f85, #ff599c, #ff58b5, #fa5ec4, #f365d2, #eb6ce0, #df74e4, #d37be6, #c881e7, #bd86e7)',
                color: 'white',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                padding: '2rem 1rem'
            }}>
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '2rem'
                    }}>
                        <button onClick={resetGame} style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: 'none',
                            color: 'white',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}>
                            ← Back
                        </button>
                        <div style={{ display: 'flex', gap: '2rem', fontSize: '1.1rem' }}>
                            <div><strong>Moves:</strong> {memoryMoves}</div>
                            <div><strong>Time:</strong> {memoryTimer}s</div>
                            <div><strong>Score:</strong> {score}</div>
                        </div>
                    </div>

                    <h2 style={{
                        textAlign: 'center',
                        fontSize: '2rem',
                        marginBottom: '2rem'
                    }}>🧠 Memory Match</h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '1rem'
                    }}>
                        {memoryCards.map(card => {
                            const isFlipped = flippedCards.includes(card.id) || matchedCards.includes(card.id);
                            const isMatched = matchedCards.includes(card.id);

                            return (
                                <div
                                    key={card.id}
                                    onClick={() => handleCardClick(card)}
                                    style={{
                                        aspectRatio: '1',
                                        background: isFlipped
                                            ? isMatched
                                                ? 'linear-gradient(135deg, #10b981, #059669)'
                                                : 'rgba(255, 255, 255, 0.9)'
                                            : 'rgba(255, 255, 255, 0.2)',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '2.5rem',
                                        cursor: isFlipped ? 'default' : 'pointer',
                                        transition: 'all 0.3s',
                                        transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)',
                                        border: '3px solid rgba(255, 255, 255, 0.3)'
                                    }}
                                >
                                    {isFlipped ? card.emoji : '?'}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // ===================================
    // 🎨 RENDER: SEQUENCE GAME
    // ===================================

    if (gameState === 'playing' && selectedGame && selectedGame.gameType === 'sequence') {
        const colors = {
            red: '#ef4444',
            blue: '#3b82f6',
            green: '#10b981',
            yellow: '#fbbf24'
        };

        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(to right top, #fb735f, #ff6871, #ff5f85, #ff599c, #ff58b5, #fa5ec4, #f365d2, #eb6ce0, #df74e4, #d37be6, #c881e7, #bd86e7)',
                color: 'white',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                padding: '2rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <button onClick={resetGame} style={{
                        position: 'absolute',
                        top: '2rem',
                        left: '2rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: 'none',
                        color: 'white',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        cursor: 'pointer'
                    }}>
                        ← Back
                    </button>

                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯 Sequence Memory</h2>
                    <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Level {sequenceLevel}</div>
                    <div style={{ fontSize: '1rem', opacity: '0.8', marginBottom: '2rem' }}>{sequenceMessage}</div>

                    {sequence.length === 0 && (
                        <button
                            onClick={startSequenceGame}
                            style={{
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                padding: '1rem 2rem',
                                borderRadius: '12px',
                                fontSize: '1.2rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                marginBottom: '2rem'
                            }}
                        >
                            START
                        </button>
                    )}

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 150px)',
                        gridTemplateRows: 'repeat(2, 150px)',
                        gap: '1rem'
                    }}>
                        {Object.entries(colors).map(([color, hex]) => (
                            <button
                                key={color}
                                onClick={() => handleSequenceButtonClick(color)}
                                disabled={!isPlayerTurn}
                                style={{
                                    background: activeButton === color ? '#ffffff' : hex,
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor: isPlayerTurn ? 'pointer' : 'not-allowed',
                                    opacity: isPlayerTurn ? 1 : 0.6,
                                    transition: 'all 0.2s',
                                    transform: activeButton === color ? 'scale(0.95)' : 'scale(1)'
                                }}
                            />
                        ))}
                    </div>

                    <div style={{ marginTop: '2rem', fontSize: '1.2rem' }}>Score: {score}</div>
                </div>
            </div>
        );
    }

    // ===================================
    // 🎨 RENDER: COMPLETION SCREEN
    // ===================================

    if (gameState === 'completed') {
        const earnedXP = selectedGame.xpReward + (streakCount * 5);
        const earnedCoins = 10; // Base coins per game

        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(to right top, #fb735f, #ff6871, #ff5f85, #ff599c, #ff58b5)',
                color: 'white',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏆</div>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: '800',
                        margin: '0 0 0.5rem 0'
                    }}>Congratulations!</h1>
                    <p style={{
                        fontSize: '1.2rem',
                        opacity: '0.9',
                        margin: '0 0 2rem 0'
                    }}>You completed {selectedGame.name}! 🎉</p>

                    {/* Rewards Section */}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        marginBottom: '1.5rem',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <h3 style={{
                            margin: '0 0 1rem 0',
                            fontSize: '1.3rem',
                            fontWeight: '700'
                        }}>🎁 Rewards Earned</h3>

                        <div style={{
                            display: 'grid',
                            gap: '1rem'
                        }}>
                            {/* XP Earned */}
                            <div style={{
                                background: 'rgba(251, 191, 36, 0.2)',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: '2px solid rgba(251, 191, 36, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem'
                            }}>
                                <Star style={{ color: '#fbbf24', width: '2.5rem', height: '2.5rem' }} />
                                <div style={{ flex: 1, textAlign: 'left' }}>
                                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fbbf24' }}>
                                        +{earnedXP} XP
                                    </div>
                                    <div style={{ fontSize: '0.9rem', opacity: '0.9' }}>
                                        Experience Points
                                    </div>
                                </div>
                            </div>

                            {/* Coins Earned */}
                            <div style={{
                                background: 'rgba(251, 191, 36, 0.2)',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: '2px solid rgba(251, 191, 36, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem'
                            }}>
                                <div style={{ fontSize: '2.5rem' }}>🪙</div>
                                <div style={{ flex: 1, textAlign: 'left' }}>
                                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fbbf24' }}>
                                        +{earnedCoins} Coins
                                    </div>
                                    <div style={{ fontSize: '0.9rem', opacity: '0.9' }}>
                                        Game Reward
                                    </div>
                                </div>
                            </div>

                            {/* Score */}
                            <div style={{
                                background: 'rgba(16, 185, 129, 0.2)',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: '2px solid rgba(16, 185, 129, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem'
                            }}>
                                <Trophy style={{ color: '#10b981', width: '2.5rem', height: '2.5rem' }} />
                                <div style={{ flex: 1, textAlign: 'left' }}>
                                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#10b981' }}>
                                        Score: {score}
                                    </div>
                                    <div style={{ fontSize: '0.9rem', opacity: '0.9' }}>
                                        {streakCount > 0 && `${streakCount}x Streak Bonus!`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Updated Stats */}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.12)',
                        borderRadius: '12px',
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '0.75rem',
                            fontSize: '0.95rem'
                        }}>
                            <div style={{ textAlign: 'left' }}>
                                <strong>Current Level:</strong> {userStats.level}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <strong>Total XP:</strong> {userStats.xp}
                            </div>
                            <div style={{ textAlign: 'left' }}>
                                <strong>Total Coins:</strong> 🪙 {userStats.coins}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <strong>Streak:</strong> 🔥 {userStats.weeklyStreak}d
                            </div>
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <button
                            style={{
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                color: 'white',
                                border: 'none',
                                padding: '1rem 2rem',
                                borderRadius: '12px',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                            }}
                            onClick={() => startGame(selectedGame)}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <Play size={20} />
                            Play Again
                        </button>

                        <button
                            style={{
                                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                color: 'white',
                                border: 'none',
                                padding: '0.9rem 2rem',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                            }}
                            onClick={resetGame}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <ArrowLeft size={18} />
                            Back to Game Hub
                        </button>

                        <button
                            style={{
                                background: 'rgba(255, 255, 255, 0.95)',
                                color: 'white',
                                border: '2px solid rgba(255, 255, 255, 0.3)',
                                padding: '0.8rem 2rem',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                            onClick={() => window.location.href = '/dashboard'}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                                e.currentTarget.style.transform = 'scale(1.02)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            <Trophy size={18} />
                            View Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Loading State
    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem'
            }}>
                Loading Game Hub...
            </div>

        );
    }

    return null;
};

export default PixelPlayGameHub;