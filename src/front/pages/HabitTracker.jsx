import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, LayoutDashboard, ShoppingBag } from 'lucide-react';
import { getUserData } from '../utils/auth';
import '../styles/Dashboard.css';

const HabitTracker = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gameData, setGameData] = useState({
    dailyPoints: 0,
    completedTasks: [],
    lastResetDate: null,
    streakDays: 0,
    gameStates: {}
  });

  // Game-specific states
  const [quizStates, setQuizStates] = useState({});
  const [timerStates, setTimerStates] = useState({});
  const [counterStates, setCounterStates] = useState({});
  const [mathStates, setMathStates] = useState({});
  const [memoryStates, setMemoryStates] = useState({});
  const [timeUntilReset, setTimeUntilReset] = useState('');

  const routines = [
    {
      id: 'make-bed',
      title: 'Make My Bed',
      icon: '🛏️',
      description: 'Get a daily motivation quote!',
      gameType: 'quote',
      points: 10,
      gameData: {
        quotes: [
          "Making your bed is the first victory of the day! 🏆",
          "A tidy space creates a peaceful mind! 🧘‍♀️",
          "Small actions lead to big changes! ⭐",
          "Success is built one small task at a time! 💪",
          "A made bed means you're ready to conquer the day! 🌟"
        ]
      }
    },
    {
      id: 'brush-teeth',
      title: 'Brush My Teeth',
      icon: '🪥',
      description: 'Brush for 2 minutes with our timer game!',
      gameType: 'timer',
      points: 10,
      gameData: {
        duration: 120,
        encouragementMessages: [
          "Great brushing! Keep those circles going! 🦷",
          "Don't forget the back teeth! 🎯",
          "You're doing amazing! Almost halfway! ⭐",
          "Keep up the good work! Your teeth will thank you! 😊",
          "Almost done! Finish strong! 💪"
        ]
      }
    },
    {
      id: 'eat-fruit',
      title: 'Eat Healthy Snack',
      icon: '🍎',
      description: 'Learn fun food facts and play nutrition quiz!',
      gameType: 'quiz',
      points: 10,
      gameData: {
        questions: [
          {
            question: "Which food gives you energy for a long time?",
            options: ["🍎 Apple", "🍭 Candy", "🥤 Soda", "🍪 Cookie"],
            correct: 0
          },
          {
            question: "What makes fruits and vegetables colorful?",
            options: ["🎨 Paint", "🌈 Vitamins", "✨ Magic", "🧪 Chemicals"],
            correct: 1
          },
          {
            question: "How many colors should you eat each day?",
            options: ["1 color", "2 colors", "Many colors", "No colors"],
            correct: 2
          }
        ]
      }
    },
    {
      id: 'wash-hands',
      title: 'Wash My Hands',
      icon: '🧼',
      description: 'Play the handwashing sequence game!',
      gameType: 'sequence',
      points: 10,
      gameData: {
        steps: [
          { icon: '🚿', text: 'Turn on water' },
          { icon: '💧', text: 'Wet hands' },
          { icon: '🧼', text: 'Apply soap' },
          { icon: '👐', text: 'Scrub for 20 seconds' },
          { icon: '🌊', text: 'Rinse thoroughly' },
          { icon: '🧻', text: 'Dry with towel' }
        ]
      }
    },
    {
      id: 'read-book',
      title: 'Read a Book',
      icon: '📚',
      description: 'Play word memory game!',
      gameType: 'memory',
      points: 10,
      gameData: {
        cards: ['📖', '✏️', '🎭', '🌟', '🦄', '🚀', '🌈', '🎨'],
        gridSize: 4
      }
    },
    {
      id: 'drink-water',
      title: 'Drink Water',
      icon: '💧',
      description: 'Track glasses and get hydration facts!',
      gameType: 'counter',
      points: 10,
      gameData: {
        target: 8,
        facts: [
          "Water helps your brain work better! 🧠",
          "Your body is 60% water! 💧",
          "Water helps carry nutrients to your cells! 🚚"
        ]
      }
    },
    {
      id: 'tidy-toys',
      title: 'Tidy Up Toys',
      icon: '🧸',
      description: 'Solve a fun math problem about organizing!',
      gameType: 'math',
      points: 10,
      gameData: {
        problems: [
          { question: "If you have 12 toys and put 4 in each box, how many boxes do you need?", answer: 3 },
          { question: "You have 15 books. You put 5 on each shelf. How many shelves?", answer: 3 },
          { question: "8 toy cars + 7 toy trucks = ? total vehicles", answer: 15 },
          { question: "If you clean for 10 minutes and rest for 5, then clean 8 more minutes, how many minutes did you clean total?", answer: 18 },
          { question: "You have 20 blocks. You use 8 to build a tower. How many blocks are left?", answer: 12 }
        ]
      }
    }
  ];

  useEffect(() => {
    loadUserData();
    updateTimeUntilMidnight();
    const interval = setInterval(updateTimeUntilMidnight, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Cleanup timers on unmount
    return () => {
      Object.values(timerStates).forEach(state => {
        if (state.interval) clearInterval(state.interval);
      });
    };
  }, [timerStates]);

  const loadUserData = async () => {
    try {
      const authUser = getUserData();
      if (!authUser) {
        console.error('No authenticated user found');
        navigate('/login');
        return;
      }

      setUser(authUser);
      const savedData = localStorage.getItem(`habitTracker_${authUser.id}`);
      
      if (savedData) {
        const data = JSON.parse(savedData);
        const today = getCurrentDateString();
        
        // Check if we need to reset daily progress
        if (data.lastResetDate !== today) {
          // Check if it's consecutive day for streak
          const yesterday = getYesterdayDateString();
          const streakDays = data.lastResetDate === yesterday ? data.streakDays + 1 : 1;
          
          const newData = {
            dailyPoints: 0,
            completedTasks: [],
            lastResetDate: today,
            streakDays: streakDays,
            gameStates: {}
          };
          setGameData(newData);
          saveUserData(authUser.id, newData);
        } else {
          setGameData(data);
        }
      } else {
        resetDailyProgress(authUser.id);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading user data:', error);
      setLoading(false);
    }
  };

  const saveUserData = (userId, data) => {
    localStorage.setItem(`habitTracker_${userId}`, JSON.stringify(data));
  };

  const getCurrentDateString = () => {
    return new Date().toDateString();
  };

  const getYesterdayDateString = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toDateString();
  };

  const resetDailyProgress = (userId) => {
    const newData = {
      dailyPoints: 0,
      completedTasks: [],
      lastResetDate: getCurrentDateString(),
      streakDays: 1,
      gameStates: {}
    };
    setGameData(newData);
    saveUserData(userId, newData);
  };

  const updateTimeUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    setTimeUntilReset(`Tasks reset in ${hours}h ${minutes}m`);
  };

  const completeTask = (taskId, routine) => {
    if (!gameData.completedTasks.includes(taskId)) {
      const newData = {
        ...gameData,
        completedTasks: [...gameData.completedTasks, taskId],
        dailyPoints: gameData.dailyPoints + routine.points
      };
      setGameData(newData);
      saveUserData(user.id, newData);
      
      // Show success message
      alert(`🎉 Great job! You earned ${routine.points} points!`);
    }
  };

  const getProgress = () => {
    return Math.round((gameData.completedTasks.length / routines.length) * 100);
  };

  const handleNavigation = (path) => {
    setLoading(true);
    setTimeout(() => {
      navigate(path);
    }, 300);
  };

  // ===== QUIZ GAME LOGIC =====
  const handleQuizAnswer = (routineId, routine, questionIndex, selectedOption) => {
    const question = routine.gameData.questions[questionIndex];
    const isCorrect = selectedOption === question.correct;
    
    if (isCorrect) {
      const currentState = quizStates[routineId] || { currentQuestion: 0, correctAnswers: 0 };
      const newCorrectAnswers = currentState.correctAnswers + 1;
      const nextQuestion = questionIndex + 1;
      
      if (nextQuestion >= routine.gameData.questions.length) {
        // Quiz complete!
        alert(`✅ Perfect! You got all ${newCorrectAnswers} questions right!`);
        completeTask(routineId, routine);
        setQuizStates({ ...quizStates, [routineId]: { currentQuestion: 0, correctAnswers: 0 } });
      } else {
        // Move to next question
        alert('✅ Correct! Moving to next question...');
        setQuizStates({
          ...quizStates,
          [routineId]: { currentQuestion: nextQuestion, correctAnswers: newCorrectAnswers }
        });
      }
    } else {
      alert('❌ Oops! Try again!');
    }
  };

  // ===== TIMER GAME LOGIC =====
  const startTimer = (routineId, routine) => {
    const duration = routine.gameData.duration;
    const messages = routine.gameData.encouragementMessages;
    
    const newState = {
      timeLeft: duration,
      isRunning: true,
      messageIndex: 0
    };
    
    setTimerStates(prev => ({
      ...prev,
      [routineId]: newState
    }));

    const interval = setInterval(() => {
      setTimerStates(prev => {
        const current = prev[routineId];
        if (!current || !current.isRunning) {
          clearInterval(interval);
          return prev;
        }
        
        const newTimeLeft = current.timeLeft - 1;
        
        if (newTimeLeft <= 0) {
          clearInterval(interval);
          setTimeout(() => {
            alert('🎉 Great job! You brushed for the full 2 minutes!');
            completeTask(routineId, routine);
            setTimerStates(p => ({
              ...p,
              [routineId]: { timeLeft: 0, isRunning: false, messageIndex: 0 }
            }));
          }, 100);
          return {
            ...prev,
            [routineId]: { ...current, timeLeft: 0, isRunning: false }
          };
        }
        
        const messageIndex = Math.floor((duration - newTimeLeft) / (duration / messages.length));
        
        return {
          ...prev,
          [routineId]: { ...current, timeLeft: newTimeLeft, messageIndex }
        };
      });
    }, 1000);
  };

  // ===== COUNTER GAME LOGIC =====
  const incrementCounter = (routineId, routine) => {
    const current = counterStates[routineId] || { count: 0 };
    const newCount = current.count + 1;
    
    setCounterStates({
      ...counterStates,
      [routineId]: { count: newCount }
    });
    
    if (newCount >= routine.gameData.target) {
      setTimeout(() => {
        alert(`💧 Amazing! You drank ${routine.gameData.target} glasses of water!`);
        completeTask(routineId, routine);
      }, 300);
    }
  };

  // ===== MATH GAME LOGIC =====
  const checkMathAnswer = (routineId, routine, problemIndex) => {
    const userAnswer = mathStates[routineId]?.answer || '';
    const problem = routine.gameData.problems[problemIndex];
    
    if (parseInt(userAnswer) === problem.answer) {
      alert('✅ Correct! Great math skills!');
      completeTask(routineId, routine);
      setMathStates({ ...mathStates, [routineId]: { answer: '' } });
    } else {
      alert('❌ Not quite! Try again!');
    }
  };

  // ===== MEMORY GAME LOGIC =====
  const initMemoryGame = (routineId, routine) => {
    const cards = [...routine.gameData.cards, ...routine.gameData.cards];
    const shuffled = cards.sort(() => Math.random() - 0.5);
    
    setMemoryStates({
      ...memoryStates,
      [routineId]: {
        cards: shuffled,
        flipped: [],
        matched: [],
        firstCard: null,
        secondCard: null
      }
    });
  };

  const flipCard = (routineId, routine, index) => {
    const state = memoryStates[routineId];
    if (!state || state.flipped.includes(index) || state.matched.includes(index) || state.secondCard !== null) {
      return;
    }

    const newFlipped = [...state.flipped, index];
    
    if (state.firstCard === null) {
      setMemoryStates({
        ...memoryStates,
        [routineId]: { ...state, flipped: newFlipped, firstCard: index }
      });
    } else {
      setMemoryStates({
        ...memoryStates,
        [routineId]: { ...state, flipped: newFlipped, secondCard: index }
      });

      setTimeout(() => {
        const firstCardValue = state.cards[state.firstCard];
        const secondCardValue = state.cards[index];

        if (firstCardValue === secondCardValue) {
          const newMatched = [...state.matched, state.firstCard, index];
          setMemoryStates({
            ...memoryStates,
            [routineId]: {
              ...state,
              matched: newMatched,
              flipped: [],
              firstCard: null,
              secondCard: null
            }
          });

          if (newMatched.length === state.cards.length) {
            setTimeout(() => {
              alert('🎉 You matched all pairs! Great memory!');
              completeTask(routineId, routine);
            }, 300);
          }
        } else {
          setMemoryStates({
            ...memoryStates,
            [routineId]: {
              ...state,
              flipped: [],
              firstCard: null,
              secondCard: null
            }
          });
        }
      }, 1000);
    }
  };

  // ===== RENDER GAME CONTENT =====
  const renderGameContent = (routine) => {
    const isCompleted = gameData.completedTasks.includes(routine.id);

    if (isCompleted) {
      return (
        <div style={{ textAlign: 'center', padding: '1rem', color: '#10B981', fontWeight: '600' }}>
          ✅ Completed! Great job!
        </div>
      );
    }

    switch (routine.gameType) {
      case 'quote':
        return (
          <div style={{ 
            textAlign: 'center', 
            fontSize: '0.95rem', 
            fontStyle: 'italic', 
            color: '#4B5563', 
            padding: '1rem',
            background: 'white',
            borderRadius: '12px'
          }}>
            {routine.gameData.quotes[Math.floor(Math.random() * routine.gameData.quotes.length)]}
          </div>
        );

      case 'timer':
        const timerState = timerStates[routine.id];
        const timeLeft = timerState?.timeLeft || routine.gameData.duration;
        const isRunning = timerState?.isRunning || false;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        const messageIndex = timerState?.messageIndex || 0;

        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '3rem',
              fontWeight: '700',
              color: '#8B5CF6',
              marginBottom: '1rem'
            }}>
              {minutes}:{seconds.toString().padStart(2, '0')}
            </div>
            {isRunning && (
              <div style={{
                fontSize: '0.9rem',
                color: '#6B7280',
                marginBottom: '1rem',
                fontWeight: '600'
              }}>
                {routine.gameData.encouragementMessages[messageIndex]}
              </div>
            )}
            <button
              style={{
                width: '100%',
                padding: '0.75rem 1.5rem',
                borderRadius: '20px',
                fontWeight: '700',
                fontSize: '0.95rem',
                border: 'none',
                cursor: isRunning ? 'not-allowed' : 'pointer',
                background: isRunning ? '#D1D5DB' : 'linear-gradient(135deg, #EC4899, #8B5CF6)',
                color: 'white',
                boxShadow: '0 4px 12px rgba(236, 72, 153, 0.4)',
                transition: 'all 0.3s ease'
              }}
              onClick={() => !isRunning && startTimer(routine.id, routine)}
              disabled={isRunning}
            >
              {isRunning ? '⏱️ Timer Running...' : '⏱️ Start 2-Minute Timer'}
            </button>
          </div>
        );

      case 'quiz':
        const quizState = quizStates[routine.id] || { currentQuestion: 0, correctAnswers: 0 };
        const currentQuestion = routine.gameData.questions[quizState.currentQuestion];

        return (
          <div>
            <div style={{
              textAlign: 'center',
              fontSize: '0.875rem',
              color: '#6B7280',
              marginBottom: '0.5rem',
              fontWeight: '600'
            }}>
              Question {quizState.currentQuestion + 1} of {routine.gameData.questions.length}
            </div>
            <p style={{ 
              textAlign: 'center', 
              fontWeight: '600', 
              color: '#374151', 
              marginBottom: '0.75rem' 
            }}>
              {currentQuestion.question}
            </p>
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '16px',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  border: '2px solid #E5E7EB',
                  background: 'white',
                  color: '#1F2937',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  marginTop: '0.5rem',
                  textAlign: 'left'
                }}
                onClick={() => handleQuizAnswer(routine.id, routine, quizState.currentQuestion, idx)}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#8B5CF6';
                  e.target.style.background = '#F3F4F6';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#E5E7EB';
                  e.target.style.background = 'white';
                }}
              >
                {option}
              </button>
            ))}
          </div>
        );

      case 'sequence':
        return (
          <div>
            {routine.gameData.steps.map((step, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.5rem',
                marginBottom: '0.5rem',
                background: 'white',
                borderRadius: '12px',
                border: '2px solid #E5E7EB'
              }}>
                <span style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>{step.icon}</span>
                <span style={{ fontSize: '0.85rem', color: '#4B5563', fontWeight: '600' }}>{step.text}</span>
              </div>
            ))}
          </div>
        );

      case 'memory':
        const memoryState = memoryStates[routine.id];
        
        if (!memoryState) {
          return (
            <div style={{ textAlign: 'center' }}>
              <button
                style={{
                  width: '100%',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '20px',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  border: 'none',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #EC4899, #8B5CF6)',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(236, 72, 153, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => initMemoryGame(routine.id, routine)}
              >
                🎮 Start Memory Game
              </button>
            </div>
          );
        }

        return (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.5rem'
          }}>
            {memoryState.cards.map((card, idx) => {
              const isFlipped = memoryState.flipped.includes(idx) || memoryState.matched.includes(idx);
              return (
                <button
                  key={idx}
                  style={{
                    aspectRatio: '1',
                    fontSize: '2rem',
                    border: '2px solid #E5E7EB',
                    borderRadius: '12px',
                    background: isFlipped ? 'white' : '#F3F4F6',
                    cursor: isFlipped ? 'default' : 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => flipCard(routine.id, routine, idx)}
                  disabled={isFlipped}
                >
                  {isFlipped ? card : '?'}
                </button>
              );
            })}
          </div>
        );

      case 'counter':
        const counterState = counterStates[routine.id] || { count: 0 };
        const progress = (counterState.count / routine.gameData.target) * 100;

        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#1F2937',
              marginBottom: '0.5rem'
            }}>
              {counterState.count} / {routine.gameData.target}
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              background: '#E5E7EB',
              borderRadius: '4px',
              overflow: 'hidden',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: '#6B7280',
              marginBottom: '1rem',
              fontStyle: 'italic'
            }}>
              {routine.gameData.facts[counterState.count % routine.gameData.facts.length]}
            </div>
            <button
              style={{
                width: '100%',
                padding: '0.75rem 1.5rem',
                borderRadius: '20px',
                fontWeight: '700',
                fontSize: '0.95rem',
                border: 'none',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                color: 'white',
                boxShadow: '0 4px 12px rgba(6, 182, 212, 0.4)',
                transition: 'all 0.3s ease'
              }}
              onClick={() => incrementCounter(routine.id, routine)}
            >
              💧 Add Glass
            </button>
          </div>
        );

      case 'math':
        const mathState = mathStates[routine.id] || { answer: '' };
        const problemIndex = 0;
        const problem = routine.gameData.problems[problemIndex];

        return (
          <div>
            <p style={{ 
              textAlign: 'center', 
              fontWeight: '600', 
              color: '#374151', 
              marginBottom: '0.75rem',
              fontSize: '0.95rem'
            }}>
              {problem.question}
            </p>
            <input
              type="number"
              placeholder="Your answer"
              value={mathState.answer}
              onChange={(e) => setMathStates({
                ...mathStates,
                [routine.id]: { answer: e.target.value }
              })}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '16px',
                fontWeight: '600',
                fontSize: '1.1rem',
                border: '2px solid #E5E7EB',
                background: 'white',
                color: '#1F2937',
                textAlign: 'center',
                marginTop: '0.5rem',
                marginBottom: '0.5rem',
                outline: 'none'
              }}
            />
            <button
              style={{
                width: '100%',
                padding: '0.75rem 1.5rem',
                borderRadius: '20px',
                fontWeight: '700',
                fontSize: '0.95rem',
                border: 'none',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #EC4899, #8B5CF6)',
                color: 'white',
                boxShadow: '0 4px 12px rgba(236, 72, 153, 0.4)',
                transition: 'all 0.3s ease'
              }}
              onClick={() => checkMathAnswer(routine.id, routine, problemIndex)}
            >
              ✅ Check Answer
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Loading habits...</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to right top, #fb735f, #ff6871, #ff5f85, #ff599c, #ff58b5, #fa5ec4, #f365d2, #eb6ce0, #df74e4, #d37be6, #c881e7, #bd86e7)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <nav style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '1rem 2rem',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => handleNavigation('/dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'white',
                border: '2px solid #E5E7EB',
                borderRadius: '12px',
                color: '#374151',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>

            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: '800',
              color: '#1F2937',
              margin: 0
            }}>📊 Routine Tracker</h1>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => handleNavigation('/dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'white',
                border: '2px solid #E5E7EB',
                borderRadius: '12px',
                color: '#374151',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => handleNavigation('/reward-store')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
              }}
            >
              <ShoppingBag size={20} />
              <span>Rewards</span>
            </button>
          </div>
        </div>
      </nav>

      <main style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        <section style={{ marginBottom: '2rem' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '24px',
            padding: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              color: '#1F2937',
              margin: '0 0 0.5rem 0'
            }}>🌟 My Routine Tracker 🌟</h1>
            <p style={{
              fontSize: '1.125rem',
              color: '#6B7280',
              margin: '0 0 1.5rem 0'
            }}>Complete tasks, play games, and earn points!</p>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              marginBottom: '1rem'
            }}>
              <span style={{
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                color: 'white',
                borderRadius: '20px',
                fontSize: '0.875rem',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
              }}>
                ⭐ {gameData.dailyPoints} Points Today
              </span>
              <span style={{
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
                color: 'white',
                borderRadius: '20px',
                fontSize: '0.875rem',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
              }}>
                🔥 {gameData.streakDays} Day Streak
              </span>
            </div>

            <div style={{
              fontSize: '0.875rem',
              color: '#9CA3AF',
              fontWeight: '500'
            }}>
              {timeUntilReset}
            </div>
          </div>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}>
            {routines.map(routine => {
              const isCompleted = gameData.completedTasks.includes(routine.id);

              return (
                <div
                  key={routine.id}
                  style={{
                    position: 'relative',
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '20px',
                    border: isCompleted ? '2px solid #10B981' : '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{routine.icon}</div>
                    <h3 style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: '#1F2937',
                      margin: '0 0 0.75rem 0'
                    }}>{routine.title}</h3>
                    <p style={{
                      color: '#6B7280',
                      margin: '0 0 1.5rem 0',
                      lineHeight: '1.5',
                      fontSize: '0.9rem'
                    }}>{routine.description}</p>

                    <div style={{
                      background: '#F9FAFB',
                      borderRadius: '15px',
                      padding: '1rem',
                      marginBottom: '1rem',
                      border: '2px solid #E5E7EB'
                    }}>
                      <div style={{
                        fontSize: '0.875rem',
                        color: '#6B7280',
                        textAlign: 'center',
                        fontWeight: '600',
                        marginBottom: '0.5rem'
                      }}>
                        {isCompleted ? 'Completed!' : 'Play the Game'}
                      </div>
                      {renderGameContent(routine)}
                    </div>

                    {!isCompleted && (
                      <button
                        style={{
                          width: '100%',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '16px',
                          fontWeight: '700',
                          fontSize: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          border: 'none',
                          cursor: 'pointer',
                          background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                          color: 'white',
                          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                        }}
                        onClick={() => completeTask(routine.id, routine)}
                      >
                        ✨ Mark as Complete (+{routine.points} pts)
                      </button>
                    )}

                    {isCompleted && (
                      <div style={{
                        width: '100%',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '16px',
                        fontWeight: '700',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        background: 'linear-gradient(135deg, #10B981, #059669)',
                        color: 'white',
                        opacity: 0.8
                      }}>
                        ✅ Completed! +{routine.points} pts
                      </div>
                    )}
                  </div>

                  {isCompleted && (
                    <div style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      width: '2.5rem',
                      height: '2.5rem',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      background: '#10B981',
                      fontSize: '1.25rem'
                    }}>
                      ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <div style={{
            background: 'linear-gradient(135deg, #a855f7, #E32BED, #fb923c)',
            borderRadius: '24px',
            padding: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '800',
              color: 'white',
              margin: '0 0 1.5rem 0'
            }}>Daily Progress</h2>

            <div style={{
              background: '#F3F4F6',
              borderRadius: '15px',
              height: '35px',
              margin: '0 0 1.5rem 0',
              overflow: 'hidden',
              position: 'relative',
              border: '2px solid #E5E7EB'
            }}>
              <div style={{
                background: 'linear-gradient(90deg, #8B5CF6, #EC4899)',
                height: '100%',
                borderRadius: '13px',
                transition: 'width 0.5s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                color: 'white',
                width: `${getProgress()}%`,
                minWidth: getProgress() > 0 ? '40px' : '0',
                boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)'
              }}>
                {getProgress()}%
              </div>
            </div>

            <p style={{
              fontSize: '1.125rem',
              color: 'white',
              fontWeight: '600',
              margin: 0
            }}>
              {gameData.completedTasks.length === 0 ? "Let's start your daily routine! 🌟" :
                gameData.completedTasks.length < routines.length ?
                  `${routines.length - gameData.completedTasks.length} more to go! 💪` :
                  `🎉 Perfect! You earned ${gameData.dailyPoints} points! 🎉`}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HabitTracker;