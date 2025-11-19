import {
  formatTime,
  calculateTotalSeconds,
  calculateIntervalRemaining,
  validateTimerInput,
  parseTimeString
} from '../utils/timerUtils';

describe('Timer Utilities', () => {
  describe('formatTime', () => {
    test('formats 0 seconds correctly', () => {
      expect(formatTime(0)).toBe('00:00:00');
    });

    test('formats seconds only', () => {
      expect(formatTime(45)).toBe('00:00:45');
    });

    test('formats minutes and seconds', () => {
      expect(formatTime(125)).toBe('00:02:05'); // 2 minutes 5 seconds
    });

    test('formats hours, minutes, and seconds', () => {
      expect(formatTime(3661)).toBe('01:01:01'); // 1 hour 1 minute 1 second
    });

    test('formats large time values', () => {
      expect(formatTime(36000)).toBe('10:00:00'); // 10 hours
    });

    test('pads single digits with zeros', () => {
      expect(formatTime(3605)).toBe('01:00:05');
    });
  });

  describe('calculateTotalSeconds', () => {
    test('calculates seconds only', () => {
      expect(calculateTotalSeconds(0, 0, 30)).toBe(30);
    });

    test('calculates minutes to seconds', () => {
      expect(calculateTotalSeconds(0, 5, 0)).toBe(300);
    });

    test('calculates hours to seconds', () => {
      expect(calculateTotalSeconds(1, 0, 0)).toBe(3600);
    });

    test('calculates combined time', () => {
      expect(calculateTotalSeconds(1, 30, 45)).toBe(5445); // 1h 30m 45s
    });

    test('handles zero values', () => {
      expect(calculateTotalSeconds(0, 0, 0)).toBe(0);
    });
  });

  describe('calculateIntervalRemaining', () => {
    test('calculates remaining time in work phase', () => {
      // 4 rounds, currently in round 1 work phase with 1200s left
      // Work: 1500s, Rest: 300s
      // Remaining: 1200 (current) + 300 (current rest) + 3 * (1500 + 300) = 6900
      const result = calculateIntervalRemaining(1500, 300, 4, 1, true, 1200);
      expect(result).toBe(6900);
    });

    test('calculates remaining time in rest phase', () => {
      // 4 rounds, currently in round 1 rest phase with 200s left
      // Remaining: 200 (current) + 3 * (1500 + 300) = 5600
      const result = calculateIntervalRemaining(1500, 300, 4, 1, false, 200);
      expect(result).toBe(5600);
    });

    test('calculates last round correctly', () => {
      // Last round, work phase, 500s remaining
      // Remaining: 500 (current) + 300 (rest) + 0 (no more rounds) = 800
      const result = calculateIntervalRemaining(1500, 300, 4, 4, true, 500);
      expect(result).toBe(800);
    });

    test('handles single round', () => {
      // 1 round total, work phase with 1000s left
      // Remaining: 1000 + 300 = 1300
      const result = calculateIntervalRemaining(1500, 300, 1, 1, true, 1000);
      expect(result).toBe(1300);
    });
  });

  describe('validateTimerInput', () => {
    test('accepts valid time values', () => {
      expect(validateTimerInput(1, 30, 45)).toBe(true);
      expect(validateTimerInput(0, 5, 0)).toBe(true);
      expect(validateTimerInput(0, 0, 30)).toBe(true);
    });

    test('rejects negative values', () => {
      expect(validateTimerInput(-1, 0, 0)).toBe(false);
      expect(validateTimerInput(0, -1, 0)).toBe(false);
      expect(validateTimerInput(0, 0, -1)).toBe(false);
    });

    test('rejects invalid minutes (>59)', () => {
      expect(validateTimerInput(0, 60, 0)).toBe(false);
      expect(validateTimerInput(0, 75, 0)).toBe(false);
    });

    test('rejects invalid seconds (>59)', () => {
      expect(validateTimerInput(0, 0, 60)).toBe(false);
      expect(validateTimerInput(0, 0, 90)).toBe(false);
    });

    test('rejects all zeros', () => {
      expect(validateTimerInput(0, 0, 0)).toBe(false);
    });

    test('accepts boundary values', () => {
      expect(validateTimerInput(0, 59, 59)).toBe(true);
      expect(validateTimerInput(10, 0, 0)).toBe(true);
    });
  });

  describe('parseTimeString', () => {
    test('parses HH:MM:SS format', () => {
      const result = parseTimeString('01:30:45');
      expect(result).toEqual({ hours: 1, minutes: 30, seconds: 45 });
    });

    test('parses MM:SS format (no hours)', () => {
      const result = parseTimeString('00:25:00');
      expect(result).toEqual({ hours: 0, minutes: 25, seconds: 0 });
    });

    test('handles single digits', () => {
      const result = parseTimeString('1:5:3');
      expect(result).toEqual({ hours: 1, minutes: 5, seconds: 3 });
    });

    test('handles zero values', () => {
      const result = parseTimeString('00:00:00');
      expect(result).toEqual({ hours: 0, minutes: 0, seconds: 0 });
    });

    test('handles invalid input gracefully', () => {
      const result = parseTimeString('invalid');
      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(0);
      expect(result.seconds).toBe(0);
    });
  });
});
