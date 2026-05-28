import { act, renderHook } from '@testing-library/react';
import useTimerLibraryManagement from '../hooks/useTimerLibraryManagement';

jest.mock('../services/timerService', () => ({
  saveCustomTimer: jest.fn((timer) => timer),
}));

const { saveCustomTimer } = require('../services/timerService');

describe('useTimerLibraryManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('saves sequence routines with room metadata in both legacy and metadata fields', () => {
    const setSaved = jest.fn();
    const setSequence = jest.fn();
    const setSeqName = jest.fn();
    const setShowBuilder = jest.fn();
    const sequence = [
      { name: 'Warmup', duration: 5, unit: 'min', type: 'work', color: '#ef4444' },
      { name: 'Rest', duration: 30, unit: 'sec', type: 'rest', color: '#10b981' },
    ];

    const { result } = renderHook(() => useTimerLibraryManagement({
      seqName: 'Morning Flow',
      sequence,
      setSaved,
      setSequence,
      setSeqName,
      setShowBuilder,
    }));

    act(() => {
      result.current.saveSequence({
        isRoomCompatible: true,
        recommendedParticipants: 4,
      });
    });

    const updater = setSaved.mock.calls[0][0];
    const [savedRoutine] = updater([]);

    expect(savedRoutine.isRoomCompatible).toBe(true);
    expect(savedRoutine.recommendedParticipants).toBe(4);
    expect(savedRoutine.metadata.isRoomCompatible).toBe(true);
    expect(savedRoutine.metadata.recommendedParticipants).toBe(4);
    expect(saveCustomTimer).toHaveBeenCalledWith(expect.objectContaining({
      metadata: expect.objectContaining({ isRoomCompatible: true, recommendedParticipants: 4 }),
    }));
  });

  it('keeps steps in sync when saving an edited routine', () => {
    const { result } = renderHook(() => useTimerLibraryManagement({
      seqName: '',
      sequence: [],
      setSaved: jest.fn(),
      setSequence: jest.fn(),
      setSeqName: jest.fn(),
      setShowBuilder: jest.fn(),
    }));

    const exercises = [{ name: 'Sprint', duration: 45, unit: 'sec', type: 'work', color: '#ef4444' }];

    act(() => {
      result.current.saveEditedTimer({
        id: 'routine-1',
        name: 'Intervals',
        exercises,
        metadata: { isRoomCompatible: true, recommendedParticipants: 2 },
      });
    });

    expect(saveCustomTimer).toHaveBeenCalledWith(expect.objectContaining({
      exercises,
      steps: exercises,
      isRoomCompatible: true,
      recommendedParticipants: 2,
      metadata: expect.objectContaining({ source: 'custom', isCustom: true }),
    }));
  });
});