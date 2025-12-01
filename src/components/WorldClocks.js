import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Maximize, Minimize } from 'lucide-react';
import WeatherEffect from './WeatherEffect';

const COMMON_TIMEZONES = [
  { city: 'New York', tz: 'America/New_York' },
  { city: 'London', tz: 'Europe/London' },
  { city: 'Tokyo', tz: 'Asia/Tokyo' },
  { city: 'Sydney', tz: 'Australia/Sydney' },
  { city: 'Los Angeles', tz: 'America/Los_Angeles' },
  { city: 'Berlin', tz: 'Europe/Berlin' },
  { city: 'Mumbai', tz: 'Asia/Kolkata' },
  { city: 'Singapore', tz: 'Asia/Singapore' },
  { city: 'UTC', tz: 'UTC' },
  // North America
  { city: 'Chicago', tz: 'America/Chicago' },
  { city: 'Denver', tz: 'America/Denver' },
  { city: 'Vancouver', tz: 'America/Vancouver' },
  { city: 'Toronto', tz: 'America/Toronto' },
  { city: 'Mexico City', tz: 'America/Mexico_City' },
  // South America
  { city: 'São Paulo', tz: 'America/Sao_Paulo' },
  { city: 'Buenos Aires', tz: 'America/Argentina/Buenos_Aires' },
  { city: 'Lima', tz: 'America/Lima' },
  // Europe
  { city: 'Paris', tz: 'Europe/Paris' },
  { city: 'Rome', tz: 'Europe/Rome' },
  { city: 'Madrid', tz: 'Europe/Madrid' },
  { city: 'Amsterdam', tz: 'Europe/Amsterdam' },
  { city: 'Moscow', tz: 'Europe/Moscow' },
  { city: 'Stockholm', tz: 'Europe/Stockholm' },
  // Asia
  { city: 'Beijing', tz: 'Asia/Shanghai' },
  { city: 'Seoul', tz: 'Asia/Seoul' },
  { city: 'Bangkok', tz: 'Asia/Bangkok' },
  { city: 'Dubai', tz: 'Asia/Dubai' },
  { city: 'Istanbul', tz: 'Europe/Istanbul' },
  { city: 'Jakarta', tz: 'Asia/Jakarta' },
  { city: 'Hong Kong', tz: 'Asia/Hong_Kong' },
  // Oceania
  { city: 'Auckland', tz: 'Pacific/Auckland' },
  { city: 'Melbourne', tz: 'Australia/Melbourne' },
  // Africa
  { city: 'Cairo', tz: 'Africa/Cairo' },
  { city: 'Johannesburg', tz: 'Africa/Johannesburg' },
  { city: 'Lagos', tz: 'Africa/Lagos' },
  { city: 'Nairobi', tz: 'Africa/Nairobi' }
];

const AnalogClock = ({ time }) => {
  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours() % 12;

  const secondAngle = (seconds * 6);
  const minuteAngle = (minutes * 6) + (seconds * 0.1);
  const hourAngle = (hours * 30) + (minutes * 0.5);

  return (
    <svg width="80" height="80" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2"/>
      {/* Hour markers */}
      {[...Array(12)].map((_, i) => (
        <line
          key={i}
          x1="50"
          y1="10"
          x2="50"
          y2="15"
          stroke="currentColor"
          strokeWidth="2"
          transform={`rotate(${i * 30} 50 50)`}
        />
      ))}
      {/* Hands */}
      <line x1="50" y1="50" x2="50" y2="30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" transform={`rotate(${hourAngle} 50 50)`}/>
      <line x1="50" y1="50" x2="50" y2="25" stroke="currentColor" strokeWidth="3" strokeLinecap="round" transform={`rotate(${minuteAngle} 50 50)`}/>
      <line x1="50" y1="50" x2="50" y2="20" stroke="currentColor" strokeWidth="1" strokeLinecap="round" transform={`rotate(${secondAngle} 50 50)`}/>
    </svg>
  );
};

const DigitalClock = ({ time }) => {
  return (
    <div style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'monospace' }}>
      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </div>
  );
};

const WorldClocks = ({ theme, onClose, weatherEffect, weatherConfig }) => {
  const [clocks, setClocks] = useState([
    { city: 'New York', tz: 'America/New_York' },
    { city: 'London', tz: 'Europe/London' },
    { city: 'Tokyo', tz: 'Asia/Tokyo' }
  ]);
  const [clockType, setClockType] = useState('analog'); // 'analog' or 'digital'
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentTimes, setCurrentTimes] = useState({});

  useEffect(() => {
    const updateTimes = () => {
      const newTimes = {};
      clocks.forEach(clock => {
        newTimes[clock.city] = new Date(new Date().toLocaleString('en-US', { timeZone: clock.tz }));
      });
      setCurrentTimes(newTimes);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, [clocks]);

  const addClock = (timezone) => {
    if (!clocks.find(c => c.tz === timezone.tz)) {
      setClocks([...clocks, timezone]);
    }
  };

  const removeClock = (city) => {
    setClocks(clocks.filter(c => c.city !== city));
  };

  const availableTimezones = COMMON_TIMEZONES.filter(tz => !clocks.find(c => c.tz === tz.tz));

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: isFullScreen ? '0' : '20px'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(25px) saturate(1.2)',
        borderRadius: isFullScreen ? '0' : '16px',
        padding: isFullScreen ? '24px' : '24px',
        maxWidth: isFullScreen ? '100vw' : '800px',
        width: isFullScreen ? '100vw' : '100%',
        maxHeight: isFullScreen ? '100vh' : '80vh',
        height: isFullScreen ? '100vh' : 'auto',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1,
        boxShadow: '0 25px 50px rgba(0,0,0,0.4)'
      }}>
        {/* Weather Effect Background - inside modal */}
        {weatherEffect !== 'none' && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '16px',
            overflow: 'hidden',
            zIndex: 0
          }}>
            <WeatherEffect 
              type={weatherEffect} 
              config={weatherConfig}
              width={isFullScreen ? window.innerWidth : 800}
              height={isFullScreen ? window.innerHeight : 600}
            />
          </div>
        )}
        
        <div style={{
          position: 'relative',
          zIndex: 1,
          maxHeight: '80vh',
          overflow: 'auto',
          padding: '0'
        }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0, color: theme.text }}>World Clocks</h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* Clock Type Toggle */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '2px' }}>
              <button
                onClick={() => setClockType('analog')}
                style={{
                  background: clockType === 'analog' ? theme.accent : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  color: clockType === 'analog' ? '#fff' : theme.text,
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                  transition: 'all 0.2s'
                }}
              >
                Analog
              </button>
              <button
                onClick={() => setClockType('digital')}
                style={{
                  background: clockType === 'digital' ? theme.accent : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  color: clockType === 'digital' ? '#fff' : theme.text,
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                  transition: 'all 0.2s'
                }}
              >
                Digital
              </button>
            </div>
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              style={{
                background: 'transparent',
                border: 'none',
                color: theme.text,
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px'
              }}
              title={isFullScreen ? 'Exit full screen' : 'Enter full screen'}
            >
              {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: theme.text,
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Clocks Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '20px'
        }}>
          {clocks.map(clock => (
            <div key={clock.city} style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              position: 'relative'
            }}>
              <button
                onClick={() => removeClock(clock.city)}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'transparent',
                  border: 'none',
                  color: theme.text,
                  cursor: 'pointer',
                  padding: '4px'
                }}
                title="Remove clock"
              >
                <Minus size={16} />
              </button>
              <h3 style={{ margin: '0 0 8px 0', color: theme.text, fontSize: '16px' }}>{clock.city}</h3>
              <div style={{ color: theme.accent, marginBottom: '8px' }}>
                {currentTimes[clock.city]?.toLocaleDateString()}
              </div>
              {clockType === 'analog' ? (
                <AnalogClock time={currentTimes[clock.city] || new Date()} />
              ) : (
                <DigitalClock time={currentTimes[clock.city] || new Date()} />
              )}
              <div style={{ color: theme.text, opacity: 0.7, fontSize: '12px', marginTop: '8px' }}>
                {clock.tz}
              </div>
            </div>
          ))}
        </div>

        {/* Add Clock */}
        {availableTimezones.length > 0 && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
            <h3 style={{ margin: '0 0 12px 0', color: theme.text }}>Add Clock</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {availableTimezones.map(tz => (
                <button
                  key={tz.tz}
                  onClick={() => addClock(tz)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: theme.text,
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Plus size={14} />
                  {tz.city}
                </button>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default WorldClocks;