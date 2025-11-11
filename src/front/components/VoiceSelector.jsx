import React from 'react';

const VoiceSelector = ({ 
  availableVoices, 
  selectedVoice, 
  onVoiceChange, 
  onTest 
}) => {
  return (
    <div style={{
      background: 'white',
      padding: '1.5rem',
      borderRadius: '12px',
      marginBottom: '1rem'
    }}>
      <h3 style={{ margin: '0 0 1rem 0', color: '#2D3748' }}>
        🎤 Choose Voice Coach
      </h3>
      
      <select
        value={selectedVoice?.name || ''}
        onChange={(e) => {
          const voice = availableVoices.find(v => v.name === e.target.value);
          onVoiceChange(voice);
        }}
        style={{
          width: '100%',
          padding: '0.75rem',
          border: '2px solid #E5E7EB',
          borderRadius: '8px',
          fontSize: '1rem',
          marginBottom: '1rem',
          cursor: 'pointer'
        }}
      >
        {availableVoices.map((voice, index) => (
          <option key={index} value={voice.name}>
            {voice.name} ({voice.lang})
          </option>
        ))}
      </select>

      <button
        onClick={onTest}
        style={{
          width: '100%',
          padding: '0.75rem',
          background: '#8B5CF6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '0.95rem'
        }}
      >
        🔊 Test Voice
      </button>
    </div>
  );
};

export default VoiceSelector;