import React, { useState, useEffect, useRef } from 'react';
import '../styles/habittracker.css'; // Import the CSS file

const HabitTracker = () => {
  const [gameData, setGameData] = useState({
    totalPoints: 0,
    dailyPoints: 0,
    completedTasks: [],
    lastResetDate: null,
    streakDays: 0,
    gameStates: {}
  });

  const [sequenceProgress, setSequenceProgress] = useState({});

  const routines = [
    {
      id: 'brush-teeth',
      title: 'Brush My Teeth',
      icon: '🦷',
      description: 'Brush for 2 minutes with our timer game!',
      gameType: 'timer',
      gameData: {
        duration: 120,
        encouragementMessages: [
          "Great brushing! Keep those circles going! 🦷",
          "Don't forget the back teeth! 🎯",
          "You're doing amazing! Almost halfway! ⭐"
        ]
      }
    },
    {
      id: 'eat-fruit',
      title: 'Eat Healthy Snack',
      icon: '🍎',
      description: 'Learn fun food facts and play nutrition quiz!',
      gameType: 'quiz',
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
          },
          {
            question: "What should you drink most throughout the day?",
            options: ["🥤 Soda", "🧃 Juice", "💧 Water", "🥛 Chocolate milk"],
            correct: 2
          },
          {
            question: "Which helps build strong bones?",
            options: ["🍭 Candy", "🥛 Milk", "🍟 Chips", "🥤 Soda"],
            correct: 1
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
      id: 'drink-water',
      title: 'Drink Water',
      icon: '💧',
      description: 'Track glasses and get hydration facts!',
      gameType: 'counter',
      gameData: {
        target: 4,
        facts: [
          "Water helps your brain work better! 🧠",
          "Your body is 60% water! 💧",
          "Water helps carry nutrients to your cells! 🚚"
        ]
      }
    }
  ];

  useEffect(() => {
    initApp();
  }, []);

  const initApp = () => {
    if (!gameData.lastResetDate) {
      setGameData(prev => ({
        ...prev,
        lastResetDate: getCurrentDateString()
      }));
    }
    checkForDailyReset();
  };

  const getCurrentDateString = () => {
    const now = new Date();
    return now.getFullYear() + '-' + 
           String(now.getMonth() + 1).padStart(2, '0') + '-' + 
           String(now.getDate()).padStart(2, '0');
  };

  const checkForDailyReset = () => {
    const currentDate = getCurrentDateString();
    
    if (gameData.lastResetDate !== currentDate) {
      setGameData(prev => ({
        ...prev,
        streakDays: prev.completedTasks.length === routines.length ? prev.streakDays + 1 : 0,
        completedTasks: [],
        dailyPoints: 0,
        gameStates: {},
        lastResetDate: currentDate
      }));
      setSequenceProgress({});
    }
  };

  const completeTask = (routineId) => {
    if (gameData.completedTasks.includes(routineId)) return;

    if (!gameData.gameStates[routineId]?.completed) {
      alert('Complete the activity first, then mark it as done! 🎮');
      return;
    }

    setGameData(prev => ({
      ...prev,
      completedTasks: [...prev.completedTasks, routineId],
      dailyPoints: prev.dailyPoints + 25,
      totalPoints: prev.totalPoints + 25
    }));

    if (gameData.completedTasks.length + 1 === routines.length) {
      setTimeout(() => alert('🎉 Congratulations! You completed all tasks! 🎉'), 500);
    }
  };

  const enableTaskCompletion = (routineId) => {
    setGameData(prev => ({
      ...prev,
      gameStates: {
        ...prev.gameStates,
        [routineId]: { ...prev.gameStates[routineId], completed: true }
      }
    }));
  };

  const selectQuizAnswer = (routineId, answerIndex) => {
    const routine = routines.find(r => r.id === routineId);
    const question = routine.gameData.questions[0]; // Using first question for demo
    
    if (answerIndex === question.correct) {
      alert('🎉 Correct! You know your nutrition facts!');
      enableTaskCompletion(routineId);
    } else {
      alert('Good try! You learned something new!');
      setTimeout(() => enableTaskCompletion(routineId), 1000);
    }
  };

  const selectStep = (routineId, stepIndex) => {
    const routine = routines.find(r => r.id === routineId);
    const expectedStep = sequenceProgress[routineId] || 0;
    
    if (stepIndex === expectedStep) {
      setSequenceProgress(prev => ({
        ...prev,
        [routineId]: (prev[routineId] || 0) + 1
      }));
      
      if (expectedStep + 1 >= routine.gameData.steps.length) {
        alert('🎉 Perfect! You know how to wash hands properly!');
        enableTaskCompletion(routineId);
      }
    } else {
      alert('Oops! Try the correct order. Think about what comes first!');
    }
  };

  const startTimer = (routineId) => {
    const routine = routines.find(r => r.id === routineId);
    let timeLeft = routine.gameData.duration;
    
    const interval = setInterval(() => {
      timeLeft--;
      
      if (timeLeft <= 0) {
        clearInterval(interval);
        alert('🎉 Perfect brushing! Your teeth are super clean! 🦷✨');
        enableTaskCompletion(routineId);
      }
    }, 1000);
  };

  const addWaterGlass = (routineId) => {
    const current = gameData.gameStates[routineId]?.waterCount || 0;
    
    if (current < 4) {
      setGameData(prev => ({
        ...prev,
        gameStates: {
          ...prev.gameStates,
          [routineId]: {
            ...prev.gameStates[routineId],
            waterCount: current + 1
          }
        }
      }));
      
      if (current + 1 >= 4) {
        enableTaskCompletion(routineId);
      }
    }
  };

  const renderGameContent = (routine) => {
    const isCompleted = gameData.completedTasks.includes(routine.id);
    
    switch (routine.gameType) {
      case 'timer':
        return (
          <div className="game-area">
            <div className="timer-display">2:00</div>
            <button className="game-button" onClick={() => startTimer(routine.id)}>
              Start Brushing Timer
            </button>
          </div>
        );

      case 'quiz':
        const question = routine.gameData.questions[0];
        return (
          <div className="game-area">
            <div className="quiz-question">{question.question}</div>
            {question.options.map((option, index) => (
              <button
                key={index}
                className="quiz-option"
                onClick={() => selectQuizAnswer(routine.id, index)}
              >
                {option}
              </button>
            ))}
          </div>
        );

      case 'sequence':
        return (
          <div className="game-area">
            <div>Click the steps in the right order!</div>
            {routine.gameData.steps.map((step, index) => (
              <button
                key={index}
                className="quiz-option"
                onClick={() => selectStep(routine.id, index)}
              >
                {step.icon} {step.text}
              </button>
            ))}
          </div>
        );

      case 'counter':
        const waterCount = gameData.gameStates[routine.id]?.waterCount || 0;
        return (
          <div className="game-area">
            <div>Track your water glasses!</div>
            <div className="water-display">
              {'🥤'.repeat(waterCount)}{'⚪'.repeat(4 - waterCount)}
              <br />{waterCount} / 4 glasses
            </div>
            <button className="game-button" onClick={() => addWaterGlass(routine.id)}>
              Add Glass 💧
            </button>
          </div>
        );

      default:
        return <div className="game-area">Fun activity coming soon!</div>;
    }
  };

  const getProgress = () => {
    const completed = gameData.completedTasks.length;
    const total = routines.length;
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🌟 My Interactive Routine Tracker 🌟</h1>
        <p>Complete tasks, play games, and earn points!</p>
        <div className="points-container">
          <div className="points-display">
            <h3>Today's Points</h3>
            <div className="points-number">{gameData.dailyPoints}</div>
          </div>
          <div className="points-display">
            <h3>Total Points</h3>
            <div className="points-number">{gameData.totalPoints}</div>
          </div>
          <div className="points-display streak-display">
            <h3>🔥 Streak</h3>
            <div className="points-number">{gameData.streakDays}</div>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="routine-grid">
          {routines.map(routine => {
            const isCompleted = gameData.completedTasks.includes(routine.id);
            const isGameCompleted = gameData.gameStates[routine.id]?.completed;
            
            return (
              <div key={routine.id} className={`routine-card ${isCompleted ? 'completed' : ''}`}>
                <div className="routine-icon">{routine.icon}</div>
                <div className="routine-title">{routine.title}</div>
                <div className="routine-description">{routine.description}</div>
                
                <div className={`game-section ${isCompleted ? 'completed' : ''}`}>
                  <div className="game-title">{routine.title} Game</div>
                  {renderGameContent(routine)}
                </div>
                
                <button
                  className={`complete-button ${isCompleted ? 'completed' : ''} ${isGameCompleted && !isCompleted ? 'ready' : ''}`}
                  onClick={() => completeTask(routine.id)}
                  disabled={isCompleted}
                >
                  {isCompleted ? 'Completed! ✅' : 
                   isGameCompleted ? 'Ready to Complete! 🎯' : 
                   'Complete Task'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="progress-section">
          <h2>Daily Progress</h2>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${getProgress()}%` }}>
              {getProgress()}%
            </div>
          </div>
          <p>
            {gameData.completedTasks.length === 0 ? "Let's start your daily routine!" :
             gameData.completedTasks.length < routines.length ? 
               `Great job! ${routines.length - gameData.completedTasks.length} more tasks to go!` :
               `🎉 Perfect day! You earned ${gameData.dailyPoints} points! 🎉`}
          </p>
        </div>
      </div>
    </div>
  );
};


export default HabitTracker;