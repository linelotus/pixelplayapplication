import React from 'react';
import { useAvatar } from '../../Context/AvatarContext';
import './WorkoutCard.css';

const WorkoutCard = ({
  title,
  icon,
  points,
  duration,
  type,
  description
}) => {
  const {
    addPoints,
    completeWorkout,
    updateDailyChallenge,
    unlockItem,
    dailyChallenge
  } = useAvatar();

  const handleWorkout = () => {
    // Complete the workout
    completeWorkout(duration);
    addPoints(points);

    // Update daily challenge if it matches
    if (dailyChallenge.type === type && !dailyChallenge.completed) {
      updateDailyChallenge(1); // Add 1 to progress
    }

    // Maybe unlock something new (30% chance)
    if (Math.random() > 0.7) {
      const items = ['hoodie', 'cap', 'sunglasses', 'medal', 'trophy'];
      const randomItem = items[Math.floor(Math.random() * items.length)];
      unlockItem('accessories', randomItem);
    }
  };

  return (
    <div className="workout-card">
      <div className="workout-icon">{icon}</div>
      <div className="workout-info">
        <h4 className="workout-title">{title}</h4>
        {description && <p className="workout-description">{description}</p>}
        <div className="workout-stats">
          <span className="workout-duration">⏱️ {duration} min</span>
          <span className="workout-points">+{points} pts</span>
        </div>
      </div>
      <button
        onClick={handleWorkout}
        className="workout-button"
      >
        Start 🚀
      </button>
    </div>
  );
};

export default WorkoutCard;
